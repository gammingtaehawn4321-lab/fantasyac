import { PlayerStats } from '../../types';
import { CombatDerivedStats } from '../combatConfig';

export type CombatClassType =
  | 'NONE'
  | 'WARRIOR'
  | 'ARCHER'
  | 'ROGUE'
  | 'CLERIC'
  | 'DANCER'
  | 'MAGE';

export interface ClassRequirement {
  type: 'LEVEL' | 'STAT' | 'TALENT' | 'STORY_FLAG';
  target: string;
  value: number | string;
  description: string;
}

export interface ClassEvolutionDefinition {
  id: string;
  fromClassId: CombatClassType;
  toClassId: string;
  evolutionTier: number; // 2 = 1차 진화, 3 = 2차 진화
  evolutionName: string; // e.g. "대검전사", "아케인 메이지"
  weaponSpecialization: string; // e.g. "대검 (양손)", "쌍성구 (마법)"
  requiredLevel: number;
  requirements?: ClassRequirement[];
  description: string;
  statBonuses?: Partial<CombatDerivedStats>;
}

export interface CombatClassDefinition {
  id: CombatClassType;
  name: string;
  role: string;
  description: string;
  primaryStats: (keyof PlayerStats)[];
  statGrowthModifiers: Partial<CombatDerivedStats>;
  unlockLevel: number;
  initialSkillIds: string[];
  talentCategory: 'WARRIOR' | 'ARCHER' | 'ROGUE' | 'CLERIC' | 'DANCER' | 'MAGE';
  color: string;
  badgeBorder: string;
  iconSymbol: string;
  recommendedArmor: 'LIGHT' | 'HEAVY' | 'CLOTH';
  evolutions: ClassEvolutionDefinition[];
}

export const COMBAT_CLASSES: Record<CombatClassType, CombatClassDefinition | null> = {
  NONE: null,

  WARRIOR: {
    id: 'WARRIOR',
    name: '전사',
    role: '근접 방어 및 물리 파괴',
    description: '강인한 육체와 중갑으로 전선을 사수하고 묵직한 무기로 적의 방어를 분쇄하는 불굴의 투사입니다.',
    primaryStats: ['vitality', 'strength'],
    statGrowthModifiers: {
      physicalAttack: 3,
      physicalDefense: 3,
    },
    unlockLevel: 5,
    initialSkillIds: ['warrior_heavy_strike', 'warrior_shield_bash'],
    talentCategory: 'WARRIOR',
    color: 'text-amber-400',
    badgeBorder: 'border-amber-500/50 bg-amber-950/30',
    iconSymbol: '⚔️',
    recommendedArmor: 'HEAVY',
    evolutions: [
      {
        id: 'evo_greatsword_warrior',
        fromClassId: 'WARRIOR',
        toClassId: 'GREATSWORD_WARRIOR',
        evolutionTier: 2,
        evolutionName: '대검전사',
        weaponSpecialization: '대검 (양손무기)',
        requiredLevel: 15,
        description: '거대한 대검으로 광범위한 적의 가드를 일격에 분쇄하고 전장을 제압합니다.',
        statBonuses: { physicalAttack: 12, physicalPenetration: 8, tenacity: 10 },
      },
      {
        id: 'evo_spearman',
        fromClassId: 'WARRIOR',
        toClassId: 'SPEARMAN',
        evolutionTier: 2,
        evolutionName: '창술사',
        weaponSpecialization: '창 (양손무기)',
        requiredLevel: 15,
        description: '긴 리치를 활용하여 적의 접근을 원천 차단하고 급소를 정확히 관통합니다.',
        statBonuses: { physicalAttack: 10, accuracy: 12, physicalPenetration: 10 },
      },
      {
        id: 'evo_swordsman',
        fromClassId: 'WARRIOR',
        toClassId: 'SWORDSMAN',
        evolutionTier: 2,
        evolutionName: '검술사',
        weaponSpecialization: '검 & 방패 (한손무기)',
        requiredLevel: 15,
        description: '완벽한 검술과 방패 방어로 적의 공세를 흘려내고 빈틈을 노려 반격합니다.',
        statBonuses: { physicalDefense: 10, physicalAttack: 8, tenacity: 8 },
      },
      {
        id: 'evo_magic_knight',
        fromClassId: 'WARRIOR',
        toClassId: 'MAGIC_KNIGHT',
        evolutionTier: 2,
        evolutionName: '마법검사',
        weaponSpecialization: '마법검 & 아뮬렛 (한손)',
        requiredLevel: 15,
        description: '검에 원소 마력을 휘감아 물리와 마법 복합 피해를 입히는 전투 마도사입니다.',
        statBonuses: { magicAttack: 10, physicalAttack: 6, magicDefense: 6 },
      },
      {
        id: 'evo_dual_swordsman',
        fromClassId: 'WARRIOR',
        toClassId: 'DUAL_SWORDSMAN',
        evolutionTier: 2,
        evolutionName: '쌍검술사',
        weaponSpecialization: '쌍검 (쌍수무기)',
        requiredLevel: 15,
        description: '양손에 검을 쥐고 쉼 없이 몰아치는 연속 참격으로 적을 압도합니다.',
        statBonuses: { physicalAttack: 10, actionSpeed: 4, criticalChance: 6 },
      },
    ],
  },

  ARCHER: {
    id: 'ARCHER',
    name: '궁수',
    role: '원거리 정밀 저격 및 기동전',
    description: '원거리에서 적의 급소를 꿰뚫고 탁월한 거리 조절과 기동성으로 전장을 장악하는 명사수입니다.',
    primaryStats: ['agility', 'luck'],
    statGrowthModifiers: {
      accuracy: 6,
      criticalChance: 4,
      actionSpeed: 3,
    },
    unlockLevel: 5,
    initialSkillIds: ['archer_precision_shot', 'archer_poison_arrow'],
    talentCategory: 'ARCHER',
    color: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/50 bg-emerald-950/30',
    iconSymbol: '🏹',
    recommendedArmor: 'LIGHT',
    evolutions: [
      {
        id: 'evo_battleshooter',
        fromClassId: 'ARCHER',
        toClassId: 'BATTLESHOOTER',
        evolutionTier: 2,
        evolutionName: '배틀슈터',
        weaponSpecialization: '석궁 (양손무기)',
        requiredLevel: 15,
        description: '중장거리에서 묵직한 볼트를 연속 발사하여 적의 중갑을 꿰뚫는 돌파형 사수입니다.',
        statBonuses: { physicalAttack: 12, physicalPenetration: 12, criticalChance: 6 },
      },
      {
        id: 'evo_sniper',
        fromClassId: 'ARCHER',
        toClassId: 'SNIPER',
        evolutionTier: 2,
        evolutionName: '스나이퍼',
        weaponSpecialization: '장궁 (양손무기)',
        requiredLevel: 15,
        description: '초장거리에서 숨을 죽인 채 적의 급소를 단 한 발로 저격하는 저격수입니다.',
        statBonuses: { accuracy: 20, criticalChance: 10, criticalDamage: 0.3 },
      },
      {
        id: 'evo_sylph',
        fromClassId: 'ARCHER',
        toClassId: 'SYLPH',
        evolutionTier: 2,
        evolutionName: '실프',
        weaponSpecialization: '윈드보우 (한손)',
        requiredLevel: 15,
        description: '바람 정령의 가호를 받아 고속 기동하며 폭풍 같은 화살비를 퍼붓습니다.',
        statBonuses: { actionSpeed: 8, evasion: 8, criticalChance: 5 },
      },
      {
        id: 'evo_master_archer',
        fromClassId: 'ARCHER',
        toClassId: 'MASTER_ARCHER',
        evolutionTier: 2,
        evolutionName: '아처',
        weaponSpecialization: '단궁 (한손)',
        requiredLevel: 15,
        description: '유연한 사격술로 근거리와 중거리를 오가며 다양한 특수 화살을 다룹니다.',
        statBonuses: { accuracy: 12, actionSpeed: 5, criticalChance: 6 },
      },
    ],
  },

  ROGUE: {
    id: 'ROGUE',
    name: '도적',
    role: '암습 및 치명적 상태이상',
    description: '그림자 속에 몸을 숨긴 채 적의 배후를 급습하고, 맹독과 출혈로 적을 고사시키는 은밀한 암살자입니다.',
    primaryStats: ['agility', 'strength'],
    statGrowthModifiers: {
      evasion: 5,
      criticalDamage: 0.15,
      actionSpeed: 4,
    },
    unlockLevel: 5,
    initialSkillIds: ['rogue_ambush', 'rogue_shadow_strike'],
    talentCategory: 'ROGUE',
    color: 'text-purple-400',
    badgeBorder: 'border-purple-500/50 bg-purple-950/30',
    iconSymbol: '🗡️',
    recommendedArmor: 'LIGHT',
    evolutions: [
      {
        id: 'evo_dual_blade',
        fromClassId: 'ROGUE',
        toClassId: 'DUAL_BLADE',
        evolutionTier: 2,
        evolutionName: '듀얼블레이드',
        weaponSpecialization: '블레이드 ×2 (쌍수)',
        requiredLevel: 15,
        description: '양손의 칼날에 각각 다른 독과 출혈을 묻혀 쉴 틈 없는 치명타를 가합니다.',
        statBonuses: { physicalAttack: 10, criticalChance: 10, actionSpeed: 6 },
      },
      {
        id: 'evo_assassin',
        fromClassId: 'ROGUE',
        toClassId: 'ASSASSIN',
        evolutionTier: 2,
        evolutionName: '암살자',
        weaponSpecialization: '암살 단도 (한손)',
        requiredLevel: 15,
        description: '그림자 은신과 기습에 특화되어 적이 반응하기도 전에 치명상을 입힙니다.',
        statBonuses: { criticalDamage: 0.4, evasion: 10, physicalPenetration: 10 },
      },
    ],
  },

  CLERIC: {
    id: 'CLERIC',
    name: '성직자',
    role: '신성 치유 및 방어 지원',
    description: '신성한 빛의 권능으로 아군의 상처를 어루만지고, 수호 방벽과 정화로 위기를 극복하는 성스러운 사제입니다.',
    primaryStats: ['spirit', 'intelligence'],
    statGrowthModifiers: {
      magicAttack: 3,
      magicDefense: 4,
    },
    unlockLevel: 5,
    initialSkillIds: ['cleric_divine_heal', 'cleric_holy_smite'],
    talentCategory: 'CLERIC',
    color: 'text-sky-300',
    badgeBorder: 'border-sky-500/50 bg-sky-950/30',
    iconSymbol: '✨',
    recommendedArmor: 'CLOTH',
    evolutions: [
      {
        id: 'evo_priest',
        fromClassId: 'CLERIC',
        toClassId: 'PRIEST',
        evolutionTier: 2,
        evolutionName: '사제',
        weaponSpecialization: '홀리 케인 (마법형)',
        requiredLevel: 15,
        description: '강력한 신성 축복과 정화 의식으로 아군을 보호하고 악을 심판합니다.',
        statBonuses: { magicAttack: 10, magicDefense: 10, statusResistance: 15 },
      },
      {
        id: 'evo_monk',
        fromClassId: 'CLERIC',
        toClassId: 'MONK',
        evolutionTier: 2,
        evolutionName: '수도사',
        weaponSpecialization: '너클 (근접 격투 마법형)',
        requiredLevel: 15,
        description: '신성력을 신체에 두르고 직접 적을 타격하는 근접 전투형 성직자입니다.',
        statBonuses: { physicalAttack: 10, physicalDefense: 8, tenacity: 10 },
      },
      {
        id: 'evo_healer',
        fromClassId: 'CLERIC',
        toClassId: 'HEALER',
        evolutionTier: 2,
        evolutionName: '힐러',
        weaponSpecialization: '성자의 스태프 (마법형)',
        requiredLevel: 15,
        description: '치유와 재생 마법의 정점에 도달하여 빈사의 아군도 즉시 소생시킵니다.',
        statBonuses: { magicDefense: 12, maxMp: 50, maxSanity: 30 },
      },
    ],
  },

  MAGE: {
    id: 'MAGE',
    name: '마법사',
    role: '비전 마법 및 광역 파괴',
    description: '원소와 비전 마력을 탐구하여 공간을 뒤흔드는 고위력 주문과 상태이상을 다루는 학자형 마도사입니다.',
    primaryStats: ['intelligence', 'spirit'],
    statGrowthModifiers: {
      magicAttack: 5,
      magicDefense: 3,
    },
    unlockLevel: 5,
    initialSkillIds: ['mage_firebolt', 'mage_arcane_burst'],
    talentCategory: 'MAGE',
    color: 'text-indigo-400',
    badgeBorder: 'border-indigo-500/50 bg-indigo-950/30',
    iconSymbol: '🔮',
    recommendedArmor: 'CLOTH',
    evolutions: [
      {
        id: 'evo_arcane_mage',
        fromClassId: 'MAGE',
        toClassId: 'ARCANE_MAGE',
        evolutionTier: 2,
        evolutionName: '아케인 메이지',
        weaponSpecialization: '쌍성구 (비전 마법구)',
        requiredLevel: 15,
        description: '순수 비전 마력과 별빛을 다루며 다채롭고 연속적인 마법 폭격을 가합니다.',
        statBonuses: { magicAttack: 16, statusHitRate: 15, maxMp: 60 },
      },
      {
        id: 'evo_wizard',
        fromClassId: 'MAGE',
        toClassId: 'WIZARD',
        evolutionTier: 2,
        evolutionName: '위자드',
        weaponSpecialization: '커스드 스태프 (저주 지팡이)',
        requiredLevel: 15,
        description: '심연의 저주와 파멸적인 원소 마법으로 적의 저항력을 붕괴시킵니다.',
        statBonuses: { magicAttack: 18, magicDefense: 8, physicalPenetration: 8 },
      },
      {
        id: 'evo_crow',
        fromClassId: 'MAGE',
        toClassId: 'CROW',
        evolutionTier: 2,
        evolutionName: '크로우',
        weaponSpecialization: '포이즌 코어 (독성 마도구)',
        requiredLevel: 15,
        description: '맹독과 오염, 지속 피해를 전장에 살포하여 적들을 서서히 고사시킵니다.',
        statBonuses: { statusHitRate: 25, magicAttack: 12, actionSpeed: 4 },
      },
    ],
  },

  DANCER: {
    id: 'DANCER',
    name: '무희',
    role: '전장 교란, 고속 회피 및 쌍수 차크람 연격 (여성 전용)',
    description: '매혹적인 춤사위와 쌍수 차크람의 궤적으로 적의 시야를 교란하고 찰나의 빈틈을 베어 넘기는 여성 전용 클래스입니다.',
    primaryStats: ['agility', 'luck'],
    statGrowthModifiers: {
      evasion: 7,
      actionSpeed: 5,
      criticalChance: 4,
    },
    unlockLevel: 5,
    initialSkillIds: ['dancer_chakram_slash', 'dancer_alluring_step'],
    talentCategory: 'DANCER',
    color: 'text-rose-400',
    badgeBorder: 'border-rose-500/50 bg-rose-950/30',
    iconSymbol: '💃',
    recommendedArmor: 'CLOTH',
    evolutions: [
      {
        id: 'evo_succubus',
        fromClassId: 'DANCER',
        toClassId: 'SUCCUBUS',
        evolutionTier: 2,
        evolutionName: '서큐버스',
        weaponSpecialization: '사념 (마법형)',
        requiredLevel: 15,
        description: '강력한 사념의 파동과 매혹, 정신 간섭 마법으로 적을 농락하고 생명력을 흡수합니다.',
        statBonuses: { magicAttack: 16, statusHitRate: 20, maxMp: 40, maxSanity: 25 },
      },
      {
        id: 'evo_blade_dancer',
        fromClassId: 'DANCER',
        toClassId: 'BLADE_DANCER',
        evolutionTier: 2,
        evolutionName: '검무희',
        weaponSpecialization: '처형도 (쌍수)',
        requiredLevel: 15,
        description: '매혹과 교란으로 적의 급소를 노출시킨 뒤, 쌍수 처형도로 고속 연격을 퍼부어 단숨에 처형합니다.',
        statBonuses: { physicalAttack: 14, criticalChance: 12, actionSpeed: 8, physicalPenetration: 10 },
      },
      {
        id: 'evo_advanced_dancer',
        fromClassId: 'DANCER',
        toClassId: 'ADVANCED_DANCER',
        evolutionTier: 2,
        evolutionName: '댄서',
        weaponSpecialization: '부채 (쌍수)',
        requiredLevel: 15,
        description: '양손의 화려한 깃털 부채와 극에 달한 춤사위로 아군 전체를 고양시키고 적들을 매혹하여 전장을 완벽히 통제합니다.',
        statBonuses: { evasion: 15, actionSpeed: 10, statusHitRate: 15, statusResistance: 12 },
      },
    ],
  },
};

/**
 * 무희 계열 전직 가능 여부 검사 (정확히 "여성" 성별만 허용)
 */
export function canChooseDancer(gender?: string | null): boolean {
  return (gender || '').trim() === '여성';
}

export function getCombatClass(classId?: string | null): CombatClassDefinition | null {
  if (!classId || classId === 'NONE') return null;
  return COMBAT_CLASSES[classId as CombatClassType] || null;
}

export function getAllCombatClasses(): CombatClassDefinition[] {
  return (Object.values(COMBAT_CLASSES).filter(Boolean) as CombatClassDefinition[]);
}

export const CLASS_EVOLUTIONS: Record<string, { currentTitle: string; evolvedTitle: string; requiredLevel: number; description: string; statBonuses: string }> = {
  WARRIOR: {
    currentTitle: '전사',
    evolvedTitle: '대검전사 / 창술사 / 검술사 / 마법검사 / 쌍검술사',
    requiredLevel: 15,
    description: '육중한 양손 대검으로 적진을 분쇄하거나, 불굴의 방패로 파티를 결사 수호합니다.',
    statBonuses: '물리 공격력 +15, 강인함 +20, 물리 방어력 +12',
  },
  ARCHER: {
    currentTitle: '궁수',
    evolvedTitle: '배틀슈터 / 스나이퍼 / 실프 / 아처',
    requiredLevel: 15,
    description: '원거리 치명타와 급소 관통으로 적을 일격필살하거나 야생의 감각으로 덫과 연사를 퍼붓습니다.',
    statBonuses: '치명타율 +10%, 행동 속도 +8, 관통력 +15',
  },
  ROGUE: {
    currentTitle: '도적',
    evolvedTitle: '듀얼블레이드 / 암살자',
    requiredLevel: 15,
    description: '그림자 속에서 출혈과 맹독을 퍼붓고, 극대화된 회피와 기습 공격을 가합니다.',
    statBonuses: '회피율 +12%, 치명 피해 배율 +0.5x, 행동 속도 +10',
  },
  CLERIC: {
    currentTitle: '성직자',
    evolvedTitle: '사제 / 수도사 / 힐러',
    requiredLevel: 15,
    description: '강력한 신성 기적과 광역 치유, 언데드 퇴마 및 절대적 가호 결계를 펼칩니다.',
    statBonuses: '마법 방어력 +15, 최대 정신력 +40, 치유력 +25%',
  },
  MAGE: {
    currentTitle: '마법사',
    evolvedTitle: '아케인 메이지 / 위자드 / 크로우',
    requiredLevel: 15,
    description: '고위 마법과 원소 폭풍을 일으켜 전장을 일거에 초토화시키는 파괴의 정점입니다.',
    statBonuses: '마법 공격력 +25, 최대 마나 +60, 속성 관통력 +15',
  },
  DANCER: {
    currentTitle: '무희',
    evolvedTitle: '서큐버스 / 검무희 / 댄서',
    requiredLevel: 15,
    description: '사념 마법(서큐버스), 처형도 쌍수 연격(검무희), 부채 광역 지원(댄서)으로 진화합니다.',
    statBonuses: '회피율 +15%, 상태이상 적중 +20%, 행동 속도 +10',
  },
};
