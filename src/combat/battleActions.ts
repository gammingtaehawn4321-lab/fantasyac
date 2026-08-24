import { BattleActor, BattleLogEntry, StatusEffect } from './combatTypes';
import { getSkillDefinition, SkillDefinition } from '../data/skills';
import { calculateDamage } from './damageCalculator';
import { SpeechStyleData } from '../types';

export interface ActionExecutionResult {
  sourceActor: BattleActor;
  targetActors: BattleActor[];
  logEntries: BattleLogEntry[];
  speechLine?: string;
}

/**
 * 캐릭터의 speechStyle에 따른 짧은 전투 대사 생성
 */
export function generateCombatSpeech(
  speechStyle?: SpeechStyleData,
  situation: 'ATTACK' | 'SKILL' | 'DEFEND' | 'HIT' | 'VICTORY' | 'CRISIS' = 'ATTACK'
): string {
  if (speechStyle?.exampleLines && speechStyle.exampleLines.length > 0) {
    // 30% chance to pick an exact preset line
    if (Math.random() < 0.3) {
      return speechStyle.exampleLines[Math.floor(Math.random() * speechStyle.exampleLines.length)];
    }
  }

  const tone = speechStyle?.tone || '담담함';
  const desc = speechStyle?.description || '';

  if (desc.includes('오만') || tone.includes('거만') || tone.includes('냉혹')) {
    switch (situation) {
      case 'ATTACK': return '이 정도로 끝낼 줄 알았나?';
      case 'SKILL': return '네놈의 한계는 여기까지다.';
      case 'DEFEND': return '흥, 뻔한 공격이군.';
      case 'CRISIS': return '칫... 성가시게 구는군.';
      case 'VICTORY': return '결과는 처음부터 정해져 있었어.';
      default: return '사라져라.';
    }
  }

  if (desc.includes('활발') || desc.includes('장난') || tone.includes('쾌활')) {
    switch (situation) {
      case 'ATTACK': return '여기야, 여기! 놓치지 마!';
      case 'SKILL': return '제대로 한 방 먹여주겠어!';
      case 'DEFEND': return '헤헤, 그렇게 쉽게 맞진 않지!';
      case 'CRISIS': return '으앗... 방심했다!';
      case 'VICTORY': return '해냈다! 내 승리야!';
      default: return '가자!';
    }
  }

  if (desc.includes('소심') || desc.includes('차분') || tone.includes('조용')) {
    switch (situation) {
      case 'ATTACK': return '빈틈이 보였어...';
      case 'SKILL': return '호흡을 가다듬고... 집중하자.';
      case 'DEFEND': return '막아내야 해... 버텨라!';
      case 'CRISIS': return '큭... 아직 쓰러질 순 없어.';
      case 'VICTORY': return '후우... 끝난 건가.';
      default: return '조심하자.';
    }
  }

  // 기본 단호하고 침착한 어조
  switch (situation) {
    case 'ATTACK': return '이번엔 내가 먼저 간다.';
    case 'SKILL': return '승부를 내자.';
    case 'DEFEND': return '움직임을 읽었어. 물러서지 않는다.';
    case 'CRISIS': return '여기서 밀리면 끝장이야.';
    case 'VICTORY': return '위험했지만 어떻게든 제압했군.';
    default: return '간다.';
  }
}

/**
 * 스킬 또는 기본 액션 실행
 */
export function executeSkillAction(
  source: BattleActor,
  targets: BattleActor[],
  skillId: string,
  turnNumber: number,
  speechStyle?: SpeechStyleData
): ActionExecutionResult {
  const skill = getSkillDefinition(skillId) || {
    id: 'basic_attack',
    name: '기본 공격',
    description: '기본 물리 공격',
    type: 'ACTIVE',
    mpCost: 0,
    cooldown: 0,
    effectId: 'EFFECT_BASIC_ATTACK',
    targetType: 'ENEMY',
    scalingStat: 'physical',
    damageMultiplier: 1.0,
  } as SkillDefinition;

  // MP 소모
  if (skill.mpCost && skill.mpCost > 0) {
    source.mp = Math.max(0, source.mp - skill.mpCost);
  }

  const logEntries: BattleLogEntry[] = [];
  const speechLine = source.isPlayer ? generateCombatSpeech(speechStyle, skillId === 'basic_attack' ? 'ATTACK' : 'SKILL') : undefined;

  switch (skill.effectId) {
    case 'EFFECT_DEFEND': {
      // 기존 DEFEND 효과 갱신 또는 추가
      source.statusEffects = source.statusEffects.filter((s) => s.type !== 'DEFEND');
      source.statusEffects.push({
        id: `defend_${Date.now()}`,
        type: 'DEFEND',
        name: '방어 태세',
        duration: 1,
      });

      const defendSpeech = source.isPlayer ? generateCombatSpeech(speechStyle, 'DEFEND') : undefined;
      logEntries.push({
        id: `log_${Date.now()}_${Math.random()}`,
        turn: turnNumber,
        actorName: source.name,
        isPlayer: source.isPlayer,
        text: `${source.name}(이)가 중심을 낮추며 굳건한 방어 태세를 취했다. 이번 턴 받는 피해가 절반으로 감소한다.`,
        speechText: defendSpeech,
        badge: { text: '방어 태세 (+50% 피해 감소)', type: 'buff' },
        timestamp: Date.now(),
      });
      break;
    }

    case 'EFFECT_FIRST_AID': {
      const healAmount = Math.round(15 + (source.stats.magicAttack ?? 5) * 0.8);
      const prevHp = source.hp;
      source.hp = Math.min(source.maxHp, source.hp + healAmount);
      const actualHealed = source.hp - prevHp;

      logEntries.push({
        id: `log_${Date.now()}_${Math.random()}`,
        turn: turnNumber,
        actorName: source.name,
        isPlayer: source.isPlayer,
        text: `${source.name}(이)가 품에서 붕대와 소독약을 꺼내 재빠르게 지혈 처치를 완료했다.`,
        speechText: speechLine,
        badge: { text: `HP +${actualHealed}`, type: 'heal' },
        timestamp: Date.now(),
      });
      break;
    }

    case 'EFFECT_DIVINE_HEAL': {
      const healAmount = Math.round(35 + (source.stats.magicAttack ?? 10) * 1.6);
      const prevHp = source.hp;
      source.hp = Math.min(source.maxHp, source.hp + healAmount);
      const actualHealed = source.hp - prevHp;

      // 특성: 치유의 보호막 (cleric_shield_of_healing)
      if (source.traits.includes('TALENT_HEAL_SHIELD')) {
        const shieldVal = Math.round(actualHealed * 0.5);
        source.statusEffects.push({
          id: `shield_${Date.now()}`,
          type: 'SHIELD',
          name: '신성 보호막',
          duration: 2,
          value: shieldVal,
        });
      }

      logEntries.push({
        id: `log_${Date.now()}_${Math.random()}`,
        turn: turnNumber,
        actorName: source.name,
        isPlayer: source.isPlayer,
        text: `따스하고 성스러운 빛이 ${source.name}의 온몸을 감싸며 깊은 상처가 아물어든다.`,
        speechText: speechLine,
        badge: { text: `HP +${actualHealed} 회복`, type: 'heal' },
        timestamp: Date.now(),
      });
      break;
    }

    case 'EFFECT_IRON_WALL': {
      const shieldVal = Math.round(source.maxHp * 0.3);
      source.statusEffects.push({
        id: `shield_${Date.now()}`,
        type: 'SHIELD',
        name: '철벽 보호막',
        duration: 3,
        value: shieldVal,
      });

      logEntries.push({
        id: `log_${Date.now()}_${Math.random()}`,
        turn: turnNumber,
        actorName: source.name,
        isPlayer: source.isPlayer,
        text: `${source.name}(이)가 기합을 내지르며 전신에 난공불락의 단단한 방벽을 구축했다.`,
        speechText: speechLine,
        badge: { text: `보호막 +${shieldVal}`, type: 'buff' },
        timestamp: Date.now(),
      });
      break;
    }

    case 'EFFECT_THROW_SAND': {
      for (const target of targets) {
        target.statusEffects.push({
          id: `sand_${Date.now()}`,
          type: 'DEF_UP',
          name: '시야 방해',
          duration: 2,
          value: -25, // 명중 감소
        });
        logEntries.push({
          id: `log_${Date.now()}_${Math.random()}`,
          turn: turnNumber,
          actorName: source.name,
          isPlayer: source.isPlayer,
          text: `${source.name}(이)가 바닥의 거친 모래를 걷어차 ${target.name}의 눈가를 가렸다!`,
          speechText: speechLine,
          badge: { text: `${target.name} 명중률 대폭 저하`, type: 'buff' },
          timestamp: Date.now(),
        });
      }
      break;
    }

    default: {
      // 일반 공격 및 피해 계열 스킬 처리
      const isMagic = skill.scalingStat === 'magic';
      const multiplier = skill.damageMultiplier ?? 1.0;
      const isRogueAmbush = skill.effectId === 'EFFECT_ROGUE_AMBUSH';
      const isVitalPoint = skill.effectId === 'EFFECT_VITAL_POINT';

      for (const target of targets) {
        const bonusCrit = isRogueAmbush ? 35 : 0;
        const ignoreDef = isVitalPoint ? 0.5 : 0;

        const dmgResult = calculateDamage(
          source,
          target,
          isMagic ? 'MAGIC' : 'PHYSICAL',
          multiplier,
          ignoreDef,
          bonusCrit
        );

        if (!dmgResult.isHit) {
          logEntries.push({
            id: `log_${Date.now()}_${Math.random()}`,
            turn: turnNumber,
            actorName: source.name,
            isPlayer: source.isPlayer,
            text: `${source.name}의 ${skill.name}(이)가 매섭게 빗발쳤으나, ${target.name}(이)가 몸을 날렵하게 비틀어 피해냈다.`,
            speechText: speechLine,
            badge: { text: '빗나감 (회피)', type: 'miss' },
            timestamp: Date.now(),
          });
          continue;
        }

        // 체력 감소
        target.hp = Math.max(0, target.hp - dmgResult.finalDamage);

        // 추가 상태이상 부여
        if (skill.effectId === 'EFFECT_SHADOW_STRIKE' || skill.effectId === 'EFFECT_BEAST_CLAWS') {
          target.statusEffects.push({
            id: `bleed_${Date.now()}`,
            type: 'BLEED',
            name: '출혈',
            duration: 3,
            value: Math.round(source.stats.physicalAttack * 0.3),
            sourceActorId: source.id,
          });
        } else if (skill.effectId === 'EFFECT_POISON_ARROW') {
          target.statusEffects.push({
            id: `poison_${Date.now()}`,
            type: 'POISON',
            name: '맹독',
            duration: 3,
            value: Math.round(source.stats.physicalAttack * 0.35),
            sourceActorId: source.id,
          });
        } else if (skill.effectId === 'EFFECT_SHIELD_BASH') {
          target.statusEffects.push({
            id: `stun_${Date.now()}`,
            type: 'STUN',
            name: '기절',
            duration: 1,
            sourceActorId: source.id,
          });
        }

        let actionDesc = `${source.name}의 [${skill.name}]! 날카로운 일격이 ${target.name}에게 적중했다.`;
        if (dmgResult.isCrit) {
          actionDesc = `치명적인 빈틈을 포착했다! ${source.name}의 [${skill.name}]이(가) ${target.name}의 급소를 정확히 관통했다.`;
        }

        logEntries.push({
          id: `log_${Date.now()}_${Math.random()}`,
          turn: turnNumber,
          actorName: source.name,
          isPlayer: source.isPlayer,
          text: actionDesc,
          speechText: speechLine,
          badge: {
            text: `${dmgResult.isCrit ? '💥 치명타! ' : ''}HP -${dmgResult.finalDamage}${dmgResult.shieldAbsorbed > 0 ? ` (보호막 ${dmgResult.shieldAbsorbed} 흡수)` : ''}`,
            type: dmgResult.isCrit ? 'crit' : 'damage',
          },
          timestamp: Date.now(),
        });
      }
      break;
    }
  }

  return {
    sourceActor: source,
    targetActors: targets,
    logEntries,
    speechLine,
  };
}
