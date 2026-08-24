import { BattleActor } from './combatTypes';
import { getSkillDefinition } from '../data/skills';

export interface EnemyDecision {
  skillId: string;
  targetId: string;
}

/**
 * 적의 턴에 수행할 지능적인 스킬 및 타겟 결정
 */
export function decideEnemyAction(
  enemy: BattleActor,
  player: BattleActor,
  _turnNumber: number
): EnemyDecision {
  // 1. 기절(STUN) 상태면 행동 불가
  if (enemy.statusEffects.some((s) => s.type === 'STUN')) {
    return { skillId: 'STUNNED', targetId: enemy.id };
  }

  const hpRatio = enemy.hp / enemy.maxHp;
  const availableSkills = (enemy.skills || []).map((id) => getSkillDefinition(id)).filter(Boolean);

  // 2. 체력이 위급(35% 이하)하고 방어 스킬이 등록되어 있을 때
  if (hpRatio < 0.35) {
    const defendSkill = availableSkills.find((s) => s?.id === 'defend_stance' || s?.id === 'warrior_iron_wall');
    if (defendSkill && (enemy.mp >= (defendSkill.mpCost ?? 0))) {
      return { skillId: defendSkill.id, targetId: enemy.id };
    }
  }

  // 3. 사용 가능한 공격/상태이상 스킬 필터링
  const usableSpecialSkills = availableSkills.filter(
    (s) => s && s.id !== 'basic_attack' && s.id !== 'defend_stance' && (enemy.mp >= (s.mpCost ?? 0))
  );

  if (usableSpecialSkills.length > 0 && Math.random() < 0.65) {
    const chosen = usableSpecialSkills[Math.floor(Math.random() * usableSpecialSkills.length)]!;
    return {
      skillId: chosen.id,
      targetId: chosen.targetType === 'SELF' ? enemy.id : player.id,
    };
  }

  // 4. 기본 공격 수행
  return {
    skillId: 'basic_attack',
    targetId: player.id,
  };
}
