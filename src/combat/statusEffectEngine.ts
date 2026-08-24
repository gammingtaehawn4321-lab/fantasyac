import { BattleActor, StatusEffect } from './combatTypes';

export interface StatusTickResult {
  actorId: string;
  actorName: string;
  hpDelta: number;
  mpDelta: number;
  staggerDelta: number;
  logs: string[];
  expiredEffectNames: string[];
}

/**
 * 라운드 시작 또는 턴 종료 시 지속 상태효과(DoT, 재생 등) 및 지속시간 감쇄 처리
 */
export function processStatusEffectsTick(actor: BattleActor): StatusTickResult {
  let hpDelta = 0;
  let mpDelta = 0;
  let staggerDelta = 0;
  const logs: string[] = [];
  const remainingEffects: StatusEffect[] = [];
  const expiredEffectNames: string[] = [];

  for (const effect of actor.statusEffects) {
    switch (effect.type) {
      case 'BLEED': {
        // 출혈: 물리 DoT (최대 체력의 5% 또는 고정 수치)
        const bleedDmg = Math.max(2, Math.round(effect.value ?? (actor.maxHp * 0.05)));
        hpDelta -= bleedDmg;
        logs.push(`🩸 [출혈] ${actor.name}이(가) 상처에서 피를 흘리며 ${bleedDmg}의 물리 피해를 입었습니다.`);
        break;
      }

      case 'POISON': {
        // 중독: 마법 DoT (마법 방어력 무시 체력 피해)
        const poisonDmg = Math.max(2, Math.round(effect.value ?? 6));
        hpDelta -= poisonDmg;
        logs.push(`🧪 [중독] ${actor.name}의 몸에 독이 퍼져 ${poisonDmg}의 지속 마법 피해를 입었습니다.`);
        break;
      }

      case 'REGENERATION': {
        // 재생: 매 턴 회복
        const healAmt = Math.max(3, Math.round(effect.value ?? (actor.maxHp * 0.08)));
        hpDelta += healAmt;
        logs.push(`🌿 [재생] ${actor.name}의 상처가 아물며 ${healAmt}의 체력을 회복했습니다.`);
        break;
      }

      case 'DEFEND': {
        // 방어 상태 유지 중에는 흐트러짐 10 회복
        staggerDelta -= 10;
        break;
      }

      default:
        break;
    }

    // 턴 지속시간 감소
    const nextDuration = effect.duration - 1;
    if (nextDuration > 0) {
      remainingEffects.push({
        ...effect,
        duration: nextDuration,
      });
    } else {
      expiredEffectNames.push(effect.name);
    }
  }

  // 흐트러짐 자연 회복 (흐트러짐 상태가 아니면 매 라운드 3씩 감소)
  if (!actor.isStaggered && actor.stagger > 0) {
    staggerDelta -= 3;
  }

  // 흐트러짐 상태 해제 (1턴 후 정상 복귀)
  let nextIsStaggered = actor.isStaggered;
  let nextStagger = Math.max(0, actor.stagger + staggerDelta);
  if (actor.isStaggered) {
    nextIsStaggered = false;
    nextStagger = 0;
    logs.push(`💫 ${actor.name}이(가) 흐트러짐(그로기) 상태에서 정신을 차렸습니다!`);
  }

  actor.hp = Math.min(actor.maxHp, Math.max(0, actor.hp + hpDelta));
  actor.mp = Math.min(actor.maxMp, Math.max(0, actor.mp + mpDelta));
  actor.stagger = nextStagger;
  actor.isStaggered = nextIsStaggered;
  actor.statusEffects = remainingEffects;

  return {
    actorId: actor.id,
    actorName: actor.name,
    hpDelta,
    mpDelta,
    staggerDelta,
    logs,
    expiredEffectNames,
  };
}
