import { BattleActor } from './combatTypes';

export interface TurnOrderEntry {
  actorId: string;
  actorName: string;
  isPlayer: boolean;
  isCompanion: boolean;
  initiativeScore: number;
}

/**
 * 매 라운드 동적 행동 순서 (Turn Initiative) 산출
 * 공식: 행동 속도 + 상태효과 보정 + 난수 보정 (-2 ~ +2)
 */
export function calculateTurnOrder(
  player: BattleActor,
  companions: BattleActor[],
  enemies: BattleActor[]
): string[] {
  const allActors: BattleActor[] = [player, ...companions, ...enemies].filter(
    (actor) => actor.hp > 0
  );

  const initiativeList: TurnOrderEntry[] = allActors.map((actor) => {
    let speed = actor.stats.actionSpeed ?? 10;

    // 상태효과 보정
    const hasSpeedUp = actor.statusEffects.some((s) => s.type === 'SPEED_UP');
    const hasSlow = actor.statusEffects.some((s) => s.type === 'SLOW');
    const isStunned = actor.statusEffects.some((s) => s.type === 'STUN') || actor.isStaggered;

    if (hasSpeedUp) speed += 6;
    if (hasSlow) speed -= 6;
    if (isStunned) speed -= 50; // 기절/흐트러짐 상태는 최후순위로 밀림

    // 소량의 턴 분산 (-2 ~ +2)
    const randomJitter = Math.floor(Math.random() * 5) - 2;
    const finalScore = Math.max(1, speed + randomJitter);

    return {
      actorId: actor.id,
      actorName: actor.name,
      isPlayer: actor.isPlayer,
      isCompanion: !!actor.isCompanion,
      initiativeScore: finalScore,
    };
  });

  // 점수 내림차순 정렬
  initiativeList.sort((a, b) => b.initiativeScore - a.initiativeScore);

  return initiativeList.map((entry) => entry.actorId);
}
