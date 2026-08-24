import { BattleActor } from './combatTypes';

export interface DamageCalculationResult {
  isHit: boolean;
  isCrit: boolean;
  rawDamage: number;
  mitigatedDamage: number;
  shieldAbsorbed: number;
  finalDamage: number;
  isDefending: boolean;
  staggerDamage: number;
  isStaggerTriggered: boolean;
  vampiricHeal?: number;
}

/**
 * 정밀 비율형 피해 공식 및 흐트러짐(Stagger) 계산기
 * 공식: 공격력 * 계수 * (100 / (100 + 실효방어력))
 */
export function calculateDamage(
  attacker: BattleActor,
  defender: BattleActor,
  damageType: 'PHYSICAL' | 'MAGIC' = 'PHYSICAL',
  multiplier: number = 1.0,
  bonusPenetration: number = 0,
  bonusCritChance: number = 0,
  bonusStagger: number = 0
): DamageCalculationResult {
  // 1. 명중률 판정: (공격자 명중 - 방어자 회피) clamp(25%, 98%)
  const hitChance = Math.min(98, Math.max(25, (attacker.stats.accuracy ?? 95) - (defender.stats.evasion ?? 5)));
  const hitRoll = Math.random() * 100;
  const isHit = hitRoll <= hitChance;

  if (!isHit) {
    return {
      isHit: false,
      isCrit: false,
      rawDamage: 0,
      mitigatedDamage: 0,
      shieldAbsorbed: 0,
      finalDamage: 0,
      isDefending: false,
      staggerDamage: 0,
      isStaggerTriggered: false,
    };
  }

  // 2. 치명타 판정
  const totalCritChance = Math.min(85, (attacker.stats.criticalChance ?? 5) + bonusCritChance);
  const isCrit = Math.random() * 100 <= totalCritChance;
  const critMultiplier = isCrit ? (attacker.stats.criticalDamage ?? 1.5) : 1.0;

  // 3. 기초 공격력 및 관통력 적용
  const atkPower = damageType === 'PHYSICAL' ? attacker.stats.physicalAttack : attacker.stats.magicAttack;
  let defPower = damageType === 'PHYSICAL' ? defender.stats.physicalDefense : defender.stats.magicDefense;

  const totalPenetration = (attacker.stats.physicalPenetration ?? 0) + bonusPenetration;
  defPower = Math.max(0, defPower - totalPenetration);

  // 4. 비율형 방어 감소 공식 (방어력이 높아도 0으로 붕괴되지 않음)
  // 예: 방어력 100 -> 피해 50%로 감소, 방어력 200 -> 피해 33.3%로 감소
  const defenseFactor = 100 / (100 + defPower);
  const variance = 0.92 + Math.random() * 0.16; // 0.92 ~ 1.08

  // 취약(VULNERABLE) 상태인 경우 30% 추가 피해
  const isVulnerable = defender.statusEffects.some((s) => s.type === 'VULNERABLE') || defender.isStaggered;
  const vulnerabilityMultiplier = isVulnerable ? 1.3 : 1.0;

  const calculatedDamage = atkPower * multiplier * defenseFactor * critMultiplier * variance * vulnerabilityMultiplier;
  const rawDamage = Math.max(1, Math.round(calculatedDamage));

  // 5. 방어 태세 (DEFEND) 적용 (피해 50% 경감)
  const isDefending = defender.statusEffects.some((s) => s.type === 'DEFEND');
  let mitigatedDamage = isDefending ? Math.max(1, Math.round(rawDamage * 0.5)) : rawDamage;

  // 6. 보호막 (SHIELD) 흡수 처리
  let shieldAbsorbed = 0;
  const shieldEffect = defender.statusEffects.find((s) => s.type === 'SHIELD');
  if (shieldEffect && (shieldEffect.value ?? 0) > 0) {
    const shieldValue = shieldEffect.value!;
    if (shieldValue >= mitigatedDamage) {
      shieldAbsorbed = mitigatedDamage;
      shieldEffect.value = shieldValue - mitigatedDamage;
      mitigatedDamage = 0;
    } else {
      shieldAbsorbed = shieldValue;
      mitigatedDamage -= shieldValue;
      shieldEffect.value = 0;
    }
  }

  // 7. 흐트러짐 (Stagger) 피해 산출
  // 공격력 및 치명타, 공격자의 근력에 비례하여 누적, 방어자의 강인함(tenacity)으로 경감
  const baseStaggerDamage = (atkPower * 0.4 + bonusStagger) * (isCrit ? 1.5 : 1.0);
  const defenderTenacity = Math.max(0, defender.stats.tenacity ?? 10);
  const staggerMitigation = 50 / (50 + defenderTenacity);
  const finalStaggerDamage = Math.max(1, Math.round(baseStaggerDamage * staggerMitigation * (isDefending ? 0.4 : 1.0)));

  const currentStagger = defender.stagger ?? 0;
  const maxStagger = defender.maxStagger || Math.max(30, Math.round(defender.maxHp * 0.6));
  const newStagger = Math.min(maxStagger, currentStagger + finalStaggerDamage);
  const isStaggerTriggered = !defender.isStaggered && newStagger >= maxStagger;

  // 8. 특수 장비 흡혈(Vampirism) 효과 처리
  let vampiricHeal: number | undefined = undefined;
  const hasVampirism = attacker.traits.some((t) => t.includes('vampirism'));
  if (hasVampirism && mitigatedDamage > 0) {
    vampiricHeal = Math.max(1, Math.round(mitigatedDamage * 0.15));
  }

  return {
    isHit: true,
    isCrit,
    rawDamage,
    mitigatedDamage,
    shieldAbsorbed,
    finalDamage: mitigatedDamage,
    isDefending,
    staggerDamage: finalStaggerDamage,
    isStaggerTriggered,
    vampiricHeal,
  };
}
