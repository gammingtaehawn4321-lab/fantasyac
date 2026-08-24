import {
  BattleActor,
  BattlefieldState,
  BattleLogEntry,
  BattleState,
  BattleActionResult,
} from './combatTypes';
import { PlayerState, CompanionData } from '../types';
import {
  calculateCombatStats,
  DEFAULT_LEVEL_GROWTH,
  getArmorProficiency,
  ARMOR_PROFICIENCY_CONFIG,
  DUAL_WIELD_OFFHAND_RATIO,
  CombatDerivedStats,
} from '../data/combatConfig';
import { executeSkillAction } from './battleActions';
import { decideEnemyAction } from './enemyAI';
import { getSkillDefinition } from '../data/skills';
import { getTalentNode } from '../data/talents';
import { getCombatClass } from '../data/classes';
import { EQUIPMENT_DATABASE, EquipmentSlot } from '../data/equipment';
import { calculateTurnOrder } from './turnManager';

/**
 * 캐릭터 데이터(플레이어 또는 동료)로부터 장비/특성/직업/방어구 적성을 모두 고려한 통합 BattleActor 생성
 */
export function createBattleActorFromCharacter(
  character: PlayerState | CompanionData,
  isPlayer: boolean
): BattleActor {
  const isPlayerState = isPlayer;
  const pState = isPlayerState ? (character as PlayerState) : null;
  const cState = !isPlayerState ? (character as CompanionData) : null;

  const charName = isPlayerState
    ? pState?.profile?.inGameName || pState?.characterName || '모험가'
    : cState?.name || '동료';

  const combatClass = character.combatClass || 'NONE';
  const classDef = getCombatClass(combatClass);
  const recommendedArmor = classDef?.recommendedArmor;

  // 1. 장비 스탯 및 방어구 적성 수집
  const equipment = character.equipment || {};
  const equipmentBonuses: Partial<CombatDerivedStats> = {};
  const bonusBaseStats: Record<string, number> = {};
  const grantedSkillIds: string[] = [];
  const traits: string[] = [];

  let totalSpeedPenalty = 0;
  let totalEvasionPenalty = 0;
  let totalTenacityPenalty = 0;
  let armorSlotCount = 0;

  const armorSlots: EquipmentSlot[] = ['HEAD', 'CHEST', 'LEGS', 'BOOTS', 'GLOVES'];

  // 슬롯별 장비 순회
  Object.entries(equipment).forEach(([slot, equipId]) => {
    const id = equipId as string | undefined;
    if (!id || !EQUIPMENT_DATABASE[id]) return;
    const item = EQUIPMENT_DATABASE[id];

    // 기본 스탯 보정 (strength, vitality 등)
    if (item.statModifiers) {
      Object.entries(item.statModifiers).forEach(([stat, val]) => {
        if (typeof val === 'number') {
          bonusBaseStats[stat] = (bonusBaseStats[stat] || 0) + val;
        }
      });
    }

    // 전투 파생 능력치 보정 (physicalAttack, magicAttack 등)
    if (item.baseStats) {
      Object.entries(item.baseStats).forEach(([statKey, val]) => {
        const key = statKey as keyof CombatDerivedStats;
        if (typeof val === 'number') {
          // 보조무기 공격력은 쌍수 효율 적용
          let appliedVal = val;
          if (slot === 'OFF_HAND' && (key === 'physicalAttack' || key === 'magicAttack')) {
            appliedVal = Math.round(appliedVal * DUAL_WIELD_OFFHAND_RATIO);
          }
          const prevVal = (equipmentBonuses[key] as number) || 0;
          (equipmentBonuses as any)[key] = prevVal + appliedVal;
        }
      });
    }

    // 마법 무기 스탯 & 마법 스킬 추가
    if (item.magicWeapon) {
      if (item.magicWeapon.availableSpellIds) {
        grantedSkillIds.push(...item.magicWeapon.availableSpellIds);
      }
      if (item.magicWeapon.exclusiveSpellIds) {
        grantedSkillIds.push(...item.magicWeapon.exclusiveSpellIds);
      }
    }

    // 특수 장비 효과 ID (vampirism_15, revive_once, bleed_synergy 등)
    if (item.specialEffectIds) {
      traits.push(...item.specialEffectIds);
    }

    // 방어구 슬롯인 경우 방어구 적성 검사
    if (armorSlots.includes(slot as EquipmentSlot) && item.armorType) {
      armorSlotCount++;
      const prof = getArmorProficiency(item.armorType, recommendedArmor);
      const penaltyConfig = ARMOR_PROFICIENCY_CONFIG[prof];
      totalSpeedPenalty += penaltyConfig.speedPenaltyPercent;
      totalEvasionPenalty += penaltyConfig.evasionPenaltyPercent;
      totalTenacityPenalty += penaltyConfig.tenacityPenaltyPercent;
    }
  });

  // 2. 특성(Talents) 보너스 종합
  const talentBonuses: Record<string, number> = {};
  const learnedTalents = character.learnedTalents || {};
  Object.entries(learnedTalents).forEach(([talentId, rank]) => {
    const node = getTalentNode(talentId);
    if (node && rank > 0) {
      if (node.effectId) {
        traits.push(node.effectId);
      }
      if (node.statModifiers) {
        Object.entries(node.statModifiers).forEach(([statKey, val]) => {
          talentBonuses[statKey] = (talentBonuses[statKey] || 0) + val * rank;
        });
      }
    }
  });

  // 3. 전직 클래스 성장 보정치
  if (classDef?.statGrowthModifiers) {
    Object.entries(classDef.statGrowthModifiers).forEach(([k, v]) => {
      talentBonuses[k] = (talentBonuses[k] || 0) + (v || 0);
    });
  }

  // 4. 장비로 증가된 실효 스탯 산출
  const baseStats = character.stats || { strength: 5, vitality: 5, agility: 5, intelligence: 5, spirit: 5, luck: 5 };
  const effectiveBaseStats = {
    strength: (baseStats.strength ?? 5) + (bonusBaseStats.strength || 0),
    vitality: (baseStats.vitality ?? 5) + (bonusBaseStats.vitality || 0),
    agility: (baseStats.agility ?? 5) + (bonusBaseStats.agility || 0),
    intelligence: (baseStats.intelligence ?? 5) + (bonusBaseStats.intelligence || 0),
    spirit: (baseStats.spirit ?? 5) + (bonusBaseStats.spirit || 0),
    luck: (baseStats.luck ?? 5) + (bonusBaseStats.luck || 0),
  };

  // 5. 최종 파생 능력치 계산
  let derivedStats = calculateCombatStats(
    effectiveBaseStats,
    character.level || 1,
    DEFAULT_LEVEL_GROWTH,
    talentBonuses as any,
    equipmentBonuses
  );

  // 6. 방어구 적성 패널티 적용
  if (armorSlotCount > 0) {
    const avgSpeedPen = totalSpeedPenalty / armorSlotCount;
    const avgEvasionPen = totalEvasionPenalty / armorSlotCount;
    const avgTenacityPen = totalTenacityPenalty / armorSlotCount;

    if (avgSpeedPen > 0) {
      derivedStats.actionSpeed = Math.max(1, Math.round(derivedStats.actionSpeed * (1 - avgSpeedPen / 100)));
    }
    if (avgEvasionPen > 0) {
      derivedStats.evasion = Math.max(0, Math.round(derivedStats.evasion * (1 - avgEvasionPen / 100)));
    }
    if (avgTenacityPen > 0 && derivedStats.tenacity) {
      derivedStats.tenacity = Math.max(0, Math.round(derivedStats.tenacity * (1 - avgTenacityPen / 100)));
    }
  }

  // 7. 보유 스킬 목록 (기본 + 학습 + 직업 + 장비 부여)
  const skills = Array.from(
    new Set([
      'basic_attack',
      'defend_stance',
      'first_aid',
      ...(character.learnedSkills || []),
      ...(classDef?.initialSkillIds || []),
      ...grantedSkillIds,
    ])
  );

  const actorId = isPlayer ? 'player' : cState?.id || `companion_${Date.now()}`;
  const hp = character.hp || character.maxHp || 100;
  const maxHp = character.maxHp || 100;
  const mp = isPlayerState ? (pState?.mana ?? 50) : (cState?.mp ?? 50);
  const maxMp = isPlayerState ? (pState?.maxMana ?? 50) : (cState?.maxMp ?? 50);

  return {
    id: actorId,
    name: charName,
    level: character.level || 1,
    hp,
    maxHp,
    mp,
    maxMp,
    sanity: character.sanity,
    maxSanity: character.maxSanity,
    stagger: 0,
    maxStagger: Math.max(40, Math.floor(maxHp * 0.45) + (derivedStats.tenacity || 0) * 2),
    isStaggered: false,
    stats: derivedStats,
    baseStats: effectiveBaseStats,
    skills,
    traits: Array.from(new Set(traits)),
    statusEffects: [],
    consumedBattleEffects: [],
    portraitUrl: isPlayer ? pState?.profile?.portraitUrl : undefined,
    isPlayer,
    isCompanion: !isPlayer,
  };
}

/**
 * 플레이어와 동료들을 모두 포괄하는 배틀 상태 초기화
 */
export function initBattleState(
  playerState: PlayerState,
  enemies: BattleActor[],
  battlefieldInput?: Partial<BattlefieldState>,
  canEscape: boolean = true
): BattleState {
  const playerActor = createBattleActorFromCharacter(playerState, true);

  // 활성 파티 멤버인 동료들만 전투에 참여
  const activeCompanions = (playerState.companions || []).filter((c) => c.isActivePartyMember);
  const companionActors = activeCompanions.map((c) => createBattleActorFromCharacter(c, false));

  const battlefield: BattlefieldState = {
    id: `bf_${Date.now()}`,
    name: battlefieldInput?.name || '거친 전장',
    description: battlefieldInput?.description || '적과 마주쳐 일촉즉발의 긴장감이 감돈다.',
    environmentType: battlefieldInput?.environmentType || 'FOREST',
    effectModifiers: battlefieldInput?.effectModifiers || {},
  };

  const initialLog: BattleLogEntry = {
    id: `log_init_${Date.now()}`,
    turn: 1,
    actorName: '시스템',
    isPlayer: false,
    text: `⚔️ [전투 개시] ${enemies.map((e) => `${e.name}(Lv.${e.level})`).join(', ')}와(과)의 전투가 시작되었습니다!`,
    badge: { text: '전투 개시', type: 'info' },
    timestamp: Date.now(),
  };

  // 실시간 속도 기반 턴 순서 산출
  const turnOrder = calculateTurnOrder(playerActor, companionActors, enemies);

  return {
    id: `battle_${Date.now()}`,
    turn: 1,
    phase: 'PLAYER_TURN',
    battlefield,
    player: playerActor,
    companions: companionActors,
    enemies,
    battleLog: [initialLog],
    victoryCondition: { type: 'DEFEAT_ALL' },
    canEscape,
    turnOrder,
  };
}

/**
 * 상태이상 틱 처리 및 부활(revive_once) 점검
 */
export function processActorStatusEffects(actor: BattleActor, turnNumber: number): BattleLogEntry[] {
  const logs: BattleLogEntry[] = [];
  const nextEffects = [];

  for (const effect of actor.statusEffects) {
    if (effect.type === 'BLEED') {
      const bleedDmg = Math.max(1, effect.value || 5);
      actor.hp = Math.max(0, actor.hp - bleedDmg);
      logs.push({
        id: `bleed_${Date.now()}_${Math.random()}`,
        turn: turnNumber,
        actorName: actor.name,
        isPlayer: actor.isPlayer,
        text: `${actor.name}의 상처에서 피가 뿜어져 나오며 지속적인 출혈 피해를 입었습니다.`,
        badge: { text: `출혈 HP -${bleedDmg}`, type: 'damage' },
        timestamp: Date.now(),
      });
    } else if (effect.type === 'POISON') {
      const poisonDmg = Math.max(1, effect.value || 6);
      actor.hp = Math.max(0, actor.hp - poisonDmg);
      logs.push({
        id: `poison_${Date.now()}_${Math.random()}`,
        turn: turnNumber,
        actorName: actor.name,
        isPlayer: actor.isPlayer,
        text: `${actor.name}의 온몸에 독기가 퍼져 극심한 고통을 겪었습니다.`,
        badge: { text: `맹독 HP -${poisonDmg}`, type: 'damage' },
        timestamp: Date.now(),
      });
    }

    const remainingDuration = effect.duration - 1;
    if (remainingDuration > 0 && !(effect.type === 'SHIELD' && (effect.value ?? 0) <= 0)) {
      nextEffects.push({ ...effect, duration: remainingDuration });
    }
  }

  actor.statusEffects = nextEffects;

  // 사망 위기 시 부활(revive_once) 1회성 발동 체크
  checkAndTriggerRevival(actor, turnNumber, logs);

  return logs;
}

/**
 * 불사조 목걸이 / 부활 특성 1회성 발동 헬퍼
 */
function checkAndTriggerRevival(actor: BattleActor, turnNumber: number, logs: BattleLogEntry[]) {
  if (actor.hp <= 0 && actor.traits.some((t) => t.includes('revive') || t.includes('RESURRECTION'))) {
    if (!actor.consumedBattleEffects?.includes('revive_once')) {
      const reviveAmount = Math.max(1, Math.round(actor.maxHp * 0.4));
      actor.hp = reviveAmount;
      actor.consumedBattleEffects = [...(actor.consumedBattleEffects || []), 'revive_once'];

      logs.push({
        id: `revive_${Date.now()}_${Math.random()}`,
        turn: turnNumber,
        actorName: actor.name,
        isPlayer: actor.isPlayer,
        text: `🔥 [불사조의 가호] ${actor.name}이(가) 치명상을 입고 쓰러지는 순간, 황금빛 불꽃이 타오르며 기적적으로 되살아났습니다! (HP +${reviveAmount})`,
        badge: { text: `부활 HP +${reviveAmount}`, type: 'heal' },
        timestamp: Date.now(),
      });
    }
  }
}

/**
 * 동료 AI 턴 행동 결정 및 실행
 */
export function executeCompanionAITurn(
  companion: BattleActor,
  companionData: CompanionData | undefined,
  allCompanions: BattleActor[],
  player: BattleActor,
  enemies: BattleActor[],
  turnNumber: number
): BattleLogEntry[] {
  const logs: BattleLogEntry[] = [];
  if (companion.hp <= 0) return logs;

  // 상태이상 처리
  const statusLogs = processActorStatusEffects(companion, turnNumber);
  logs.push(...statusLogs);
  if (companion.hp <= 0) return logs;

  // 기절 확인
  if (companion.statusEffects.some((s) => s.type === 'STUN') || companion.isStaggered) {
    logs.push({
      id: `comp_stun_${Date.now()}`,
      turn: turnNumber,
      actorName: companion.name,
      isPlayer: false,
      text: `${companion.name}(이)가 기절/흐트러짐 상태로 인해 이번 턴 행동하지 못합니다.`,
      badge: { text: '행동 불가', type: 'info' },
      timestamp: Date.now(),
    });
    return logs;
  }

  const tactic = companionData?.combatTactic || 'BALANCED';
  const aliveEnemies = enemies.filter((e) => e.hp > 0);
  if (aliveEnemies.length === 0) return logs;

  // 스킬 선택 로직
  let chosenSkillId = 'basic_attack';
  let targets: BattleActor[] = [aliveEnemies[0]];

  const hasHealSkill = companion.skills.find((s) => s.includes('heal') || s.includes('first_aid'));
  const needsHeal = player.hp < player.maxHp * 0.4 || companion.hp < companion.maxHp * 0.35;

  if (tactic === 'DEFENSIVE' || tactic === 'HEAL_PRIORITY' || (tactic === 'SUPPORT_PRIORITY' && needsHeal)) {
    if (hasHealSkill && companion.mp >= (getSkillDefinition(hasHealSkill)?.mpCost || 0)) {
      chosenSkillId = hasHealSkill;
      targets = player.hp < companion.hp ? [player] : [companion];
    } else if (companion.skills.includes('defend_stance')) {
      chosenSkillId = 'defend_stance';
      targets = [companion];
    }
  } else if (tactic === 'AGGRESSIVE') {
    // 고위력 공격 스킬 우선 탐색
    const atkSkills = companion.skills.filter(
      (s) => s !== 'basic_attack' && s !== 'defend_stance' && s !== 'first_aid'
    );
    const affordable = atkSkills.find((s) => {
      const def = getSkillDefinition(s);
      return def && companion.mp >= (def.mpCost || 0) && def.targetType === 'ENEMY';
    });
    if (affordable) {
      chosenSkillId = affordable;
      // 가장 체력이 낮은 적 점사
      targets = [aliveEnemies.slice().sort((a, b) => a.hp - b.hp)[0]];
    }
  } else {
    // BALANCED
    const usableSkill = companion.skills.find((s) => {
      const def = getSkillDefinition(s);
      return (
        s !== 'basic_attack' &&
        def &&
        companion.mp >= (def.mpCost || 0) &&
        (def.targetType === 'ENEMY' || def.targetType === 'ALL_ENEMIES')
      );
    });
    if (usableSkill) {
      chosenSkillId = usableSkill;
      const def = getSkillDefinition(usableSkill);
      targets = def?.targetType === 'ALL_ENEMIES' ? aliveEnemies : [aliveEnemies[0]];
    }
  }

  const actionRes = executeSkillAction(companion, targets, chosenSkillId, turnNumber);
  logs.push(...actionRes.logEntries);

  return logs;
}

/**
 * 플레이어 턴 행동 처리 (플레이어 -> 동료 AI -> 적 AI 순)
 */
export function processPlayerTurn(
  battleState: BattleState,
  skillId: string,
  targetEnemyId: string,
  playerState: PlayerState
): BattleActionResult {
  const logs: BattleLogEntry[] = [];
  const { player, companions, enemies, turn } = battleState;

  // 1. 플레이어 상태이상 틱 처리
  const playerStatusLogs = processActorStatusEffects(player, turn);
  logs.push(...playerStatusLogs);

  // 2. 플레이어 행동 실행
  if (player.hp > 0) {
    if (player.statusEffects.some((s) => s.type === 'STUN') || player.isStaggered) {
      logs.push({
        id: `stun_log_${Date.now()}`,
        turn,
        actorName: player.name,
        isPlayer: true,
        text: `${player.name}(이)가 기절/흐트러짐 상태에 빠져 이번 턴 행동할 수 없습니다!`,
        badge: { text: '기절 (행동 불가)', type: 'info' },
        timestamp: Date.now(),
      });
    } else {
      const skillDef = getSkillDefinition(skillId);
      let targetActors: BattleActor[] = [];

      if (skillDef?.targetType === 'SELF') {
        targetActors = [player];
      } else if (skillDef?.targetType === 'ALL_ENEMIES') {
        targetActors = enemies.filter((e) => e.hp > 0);
      } else {
        const target = enemies.find((e) => e.id === targetEnemyId && e.hp > 0) || enemies.find((e) => e.hp > 0);
        if (target) targetActors = [target];
      }

      if (targetActors.length > 0) {
        const actionResult = executeSkillAction(
          player,
          targetActors,
          skillId,
          turn,
          playerState.profile?.speechStyle
        );
        logs.push(...actionResult.logEntries);
      }
    }
  }

  // 3. 승리 검사
  let aliveEnemies = enemies.filter((e) => e.hp > 0);
  if (aliveEnemies.length === 0) {
    battleState.phase = 'VICTORY';
    const rewards = generateRewards(enemies);
    logs.push({
      id: `vic_log_${Date.now()}`,
      turn,
      actorName: '전투 승리',
      isPlayer: true,
      text: `전장의 모든 적을 격파했습니다! 완벽한 승리를 거두었습니다.`,
      badge: { text: `승리 (EXP +${rewards.exp}, 루피 +${rewards.rupees})`, type: 'heal' },
      timestamp: Date.now(),
    });

    return {
      battleState: {
        ...battleState,
        battleLog: [...battleState.battleLog, ...logs],
      },
      logEntries: logs,
      isBattleEnded: true,
      outcome: 'VICTORY',
      rewards,
    };
  }

  // 4. 동료 AI 행동 실행
  for (const companion of companions) {
    if (companion.hp <= 0) continue;
    aliveEnemies = enemies.filter((e) => e.hp > 0);
    if (aliveEnemies.length === 0) break;

    const compData = playerState.companions?.find((c) => c.id === companion.id);
    const compLogs = executeCompanionAITurn(
      companion,
      compData,
      companions,
      player,
      enemies,
      turn
    );
    logs.push(...compLogs);
  }

  // 5. 다시 승리 검사 (동료가 마지막 적을 처치했을 경우)
  aliveEnemies = enemies.filter((e) => e.hp > 0);
  if (aliveEnemies.length === 0) {
    battleState.phase = 'VICTORY';
    const rewards = generateRewards(enemies);
    logs.push({
      id: `vic_log_comp_${Date.now()}`,
      turn,
      actorName: '전투 승리',
      isPlayer: true,
      text: `동료들과 합심하여 모든 적을 소탕했습니다!`,
      badge: { text: `승리 (EXP +${rewards.exp}, 루피 +${rewards.rupees})`, type: 'heal' },
      timestamp: Date.now(),
    });

    return {
      battleState: {
        ...battleState,
        battleLog: [...battleState.battleLog, ...logs],
      },
      logEntries: logs,
      isBattleEnded: true,
      outcome: 'VICTORY',
      rewards,
    };
  }

  // 6. 적 AI 턴 실행
  const partyTargets = [player, ...companions.filter((c) => c.hp > 0)];

  for (const enemy of aliveEnemies) {
    if (player.hp <= 0 && companions.every((c) => c.hp <= 0)) break;

    // 적 상태이상 처리
    const enemyStatusLogs = processActorStatusEffects(enemy, turn);
    logs.push(...enemyStatusLogs);

    if (enemy.hp <= 0) {
      logs.push({
        id: `enemy_down_${Date.now()}_${enemy.id}`,
        turn,
        actorName: enemy.name,
        isPlayer: false,
        text: `${enemy.name}(이)가 버티지 못하고 바닥으로 쓰러졌습니다.`,
        badge: { text: '적 격퇴', type: 'info' },
        timestamp: Date.now(),
      });
      continue;
    }

    // 공격 대상 선정 (플레이어 또는 동료 중 1명)
    const aliveParty = partyTargets.filter((p) => p.hp > 0);
    if (aliveParty.length === 0) break;
    const chosenTarget = aliveParty[Math.floor(Math.random() * aliveParty.length)];

    const decision = decideEnemyAction(enemy, chosenTarget, turn);
    if (decision.skillId === 'STUNNED') {
      logs.push({
        id: `enemy_stun_${Date.now()}`,
        turn,
        actorName: enemy.name,
        isPlayer: false,
        text: `${enemy.name}(이)가 기절/흐트러짐 상태로 몸을 가누지 못합니다.`,
        badge: { text: '적 기절', type: 'info' },
        timestamp: Date.now(),
      });
      continue;
    }

    const enemySkillDef = getSkillDefinition(decision.skillId);
    const enemyTargets = enemySkillDef?.targetType === 'SELF' ? [enemy] : [chosenTarget];
    const enemyResult = executeSkillAction(enemy, enemyTargets, decision.skillId, turn);
    logs.push(...enemyResult.logEntries);

    // 대상 피격 후 부활 발동 검사
    checkAndTriggerRevival(chosenTarget, turn, logs);
  }

  // 7. 플레이어 및 파티 전멸 검사
  if (player.hp <= 0) {
    battleState.phase = 'DEFEAT';
    logs.push({
      id: `defeat_log_${Date.now()}`,
      turn,
      actorName: '전투 패배',
      isPlayer: true,
      text: `${player.name}(이)가 한계에 달해 무기를 떨어뜨리고 의식을 잃었습니다...`,
      badge: { text: '전투 패배', type: 'damage' },
      timestamp: Date.now(),
    });

    return {
      battleState: {
        ...battleState,
        battleLog: [...battleState.battleLog, ...logs],
      },
      logEntries: logs,
      isBattleEnded: true,
      outcome: 'DEFEAT',
    };
  }

  // 8. 턴 갱신 및 새로운 턴 순서 산출
  const nextTurn = turn + 1;
  const newTurnOrder = calculateTurnOrder(player, companions, enemies);

  const updatedBattleState: BattleState = {
    ...battleState,
    turn: nextTurn,
    phase: 'PLAYER_TURN',
    turnOrder: newTurnOrder,
    battleLog: [...battleState.battleLog, ...logs],
  };

  return {
    battleState: updatedBattleState,
    logEntries: logs,
    isBattleEnded: false,
  };
}

/**
 * 도주 시도
 */
export function attemptEscape(battleState: BattleState, playerState: PlayerState): BattleActionResult {
  const logs: BattleLogEntry[] = [];
  const { player, enemies, turn } = battleState;

  if (!battleState.canEscape) {
    logs.push({
      id: `no_escape_${Date.now()}`,
      turn,
      actorName: player.name,
      isPlayer: true,
      text: '적들에게 포위되어 도망칠 수 없습니다!',
      badge: { text: '도주 불가', type: 'miss' },
      timestamp: Date.now(),
    });
    return {
      battleState: {
        ...battleState,
        battleLog: [...battleState.battleLog, ...logs],
      },
      logEntries: logs,
      isBattleEnded: false,
    };
  }

  const highestEnemySpeed = Math.max(...enemies.map((e) => e.stats.actionSpeed || 10));
  const speedDiff = (player.stats.actionSpeed || 10) - highestEnemySpeed;
  const escapeChance = Math.min(90, Math.max(30, 50 + speedDiff * 3));

  const isSuccess = Math.random() * 100 <= escapeChance;

  if (isSuccess) {
    battleState.phase = 'ESCAPED';
    logs.push({
      id: `escape_success_${Date.now()}`,
      turn,
      actorName: player.name,
      isPlayer: true,
      text: `${player.name}(이)가 적들의 틈을 비집고 전장에서 벗어나 안전한 곳으로 몸을 피했습니다.`,
      badge: { text: '도주 성공', type: 'info' },
      timestamp: Date.now(),
    });

    return {
      battleState: {
        ...battleState,
        battleLog: [...battleState.battleLog, ...logs],
      },
      logEntries: logs,
      isBattleEnded: true,
      outcome: 'ESCAPED',
    };
  } else {
    logs.push({
      id: `escape_fail_${Date.now()}`,
      turn,
      actorName: player.name,
      isPlayer: true,
      text: `${player.name}(이)가 도주를 시도했으나, 적들에게 가로막혀 실패했습니다!`,
      badge: { text: '도주 실패', type: 'damage' },
      timestamp: Date.now(),
    });

    return processPlayerTurn(battleState, 'defend_stance', enemies[0]?.id || '', playerState);
  }
}

/**
 * 전투 승리 보상 계산
 */
function generateRewards(enemies: BattleActor[]) {
  let totalExp = 0;
  let totalRupees = 0;

  for (const enemy of enemies) {
    const baseExp = 25 + enemy.level * 15;
    const baseRupees = 20 + enemy.level * 12;
    totalExp += baseExp;
    totalRupees += baseRupees;
  }

  return {
    exp: totalExp,
    rupees: totalRupees,
    items: [{ name: '작은 회복약', quantity: 1 }],
  };
}

