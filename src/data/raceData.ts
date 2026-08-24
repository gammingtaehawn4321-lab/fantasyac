import { PlayerStats } from '../types';

export type Race = 'HUMAN' | 'ELF' | 'BEASTKIN';
export type BeastkinType = 'FOX' | 'CAT' | 'DOG' | 'WOLF' | 'BIRD';

export interface PassiveDefinition {
  id: string;
  name: string;
  description: string;
  effect: string;
}

export interface RaceDefinition {
  id: string;
  race: Race;
  beastkinType?: BeastkinType;
  name: string;
  subName?: string;
  description: string;
  summary: string;
  iconSymbol: string;
  statModifiers: Partial<PlayerStats>;
  passiveIds: string[];
  learnableSkillIds: string[];
  factionAffinity: Record<string, number>;
  reactionTags: string[];
  storyFlags: string[];
}

export const PASSIVE_DEFINITIONS: Record<string, PassiveDefinition> = {
  // 인간 패시브
  HUMAN_ADAPTABILITY: {
    id: 'HUMAN_ADAPTABILITY',
    name: '적응력',
    description: '어떤 환경이나 기술에도 빠르게 익숙해지는 인간 고유의 유연성.',
    effect: '새로운 계열의 기술 및 장비 제약 완화, 세력 접근성 우수',
  },

  // 엘프 패시브
  ELF_MANA_AFFINITY: {
    id: 'ELF_MANA_AFFINITY',
    name: '마력 친화',
    description: '체내 마력 순환이 자연과 조화를 이루어 마법의 위력을 극대화합니다.',
    effect: '마법 계열 효율 상승 및 최대 마나 보정',
  },
  ELF_FOREST_SENSE: {
    id: 'ELF_FOREST_SENSE',
    name: '숲의 감각',
    description: '자연과 동화되어 미세한 기척과 숲의 비밀을 감지합니다.',
    effect: '자연·숲 탐색 특수 선택지 개방 및 매복 사전 감지',
  },

  // 여우 수인
  BEASTKIN_FOX_TRICK: {
    id: 'BEASTKIN_FOX_TRICK',
    name: '여우의 기만',
    description: '상대의 허점을 꿰뚫고 교섭과 기만 상황에서 우위를 점합니다.',
    effect: '교섭, 속임수 및 위기 회피 선택지 성공률 증가',
  },
  BEASTKIN_FOX_ILLUSION: {
    id: 'BEASTKIN_FOX_ILLUSION',
    name: '환술 친화',
    description: '빛과 시각을 왜곡하는 신비한 영묘한 재주를 타고납니다.',
    effect: '환각·혼란 계열 술식 및 돌발 행운 이벤트 보정',
  },

  // 고양이 수인
  BEASTKIN_CAT_NIGHT_VISION: {
    id: 'BEASTKIN_CAT_NIGHT_VISION',
    name: '야간 시야',
    description: '완전한 어둠 속에서도 빛을 모아 사물을 뚜렷하게 식별합니다.',
    effect: '어두운 장소/동굴/야간 시야 페널티 무효화',
  },
  BEASTKIN_CAT_AGILITY: {
    id: 'BEASTKIN_CAT_AGILITY',
    name: '착지 보정 & 유연성',
    description: '공중에서도 균형을 잡으며 좁은 통로나 높은 지형을 자유자재로 이동합니다.',
    effect: '회피율 대폭 상승 및 낙하/기습 피해 경감',
  },

  // 개 수인
  BEASTKIN_DOG_SCENT_TRACK: {
    id: 'BEASTKIN_DOG_SCENT_TRACK',
    name: '후각 추적',
    description: '바람에 실려오는 미세한 냄새를 통해 목표와 위험을 추적합니다.',
    effect: '목표물 추적, 숨겨진 흔적 발견 성공률 증가',
  },
  BEASTKIN_DOG_LOYALTY: {
    id: 'BEASTKIN_DOG_LOYALTY',
    name: '동료 연계 & 신뢰',
    description: '우호적인 인물에게 높은 신뢰를 주며 협동 상황에서 진가를 발휘합니다.',
    effect: '동료/NPC 호감도 획득 보너스 및 협력 전투 보정',
  },

  // 늑대 수인
  BEASTKIN_WOLF_PREDATOR: {
    id: 'BEASTKIN_WOLF_PREDATOR',
    name: '포식자의 감각',
    description: '상처 입은 먹잇감의 빈틈을 본능적으로 포착하여 치명타를 가합니다.',
    effect: '전투 시 물리 공격력 및 치명타 확률 보정',
  },
  BEASTKIN_WOLF_PACK: {
    id: 'BEASTKIN_WOLF_PACK',
    name: '무리 결속 & 위압',
    description: '늑대의 위압감으로 적의 사기를 꺾고 밤의 전투에서 강해집니다.',
    effect: '야간 전투 위압 효과 및 난전 집중력 상승',
  },

  // 새 수인
  BEASTKIN_BIRD_KEEN_EYE: {
    id: 'BEASTKIN_BIRD_KEEN_EYE',
    name: '원거리 시야',
    description: '높은 곳에서 전체 지형과 원거리의 위험 요소를 한눈에 조망합니다.',
    effect: '원거리 정찰 성공률 증가 및 지형 분석 선택지 개방',
  },
  BEASTKIN_BIRD_SCOUT: {
    id: 'BEASTKIN_BIRD_SCOUT',
    name: '정찰 본능',
    description: '위험한 함정이나 적의 매복을 사전에 포착하여 우회할 기회를 얻습니다.',
    effect: '함정 및 기습 회피율 증가, 선공 기회 획득',
  },
};

export const RACE_DEFINITIONS: Record<string, RaceDefinition> = {
  HUMAN: {
    id: 'HUMAN',
    race: 'HUMAN',
    name: '인간',
    summary: '균형 잡힌 스탯 · 뛰어난 적응력 · 넓은 세력 접근성',
    description:
      '가장 번성한 종족으로 뛰어난 적응력과 유연성을 지녔습니다. 특정 능력치에 치우치지 않으며 모든 세력과 기술에 자유롭게 접근할 수 있습니다.',
    iconSymbol: '👤',
    statModifiers: {
      strength: 0,
      vitality: 0,
      agility: 0,
      intelligence: 0,
      spirit: 0,
      luck: 0,
    },
    passiveIds: ['HUMAN_ADAPTABILITY'],
    learnableSkillIds: ['SLASH', 'PARRY', 'FIREBALL', 'HEAL', 'SNEAK'],
    factionAffinity: {
      human_kingdom: 15,
      free_cities: 15,
      merchants_guild: 10,
    },
    reactionTags: ['VERSATILE', 'COMMON', 'ADAPTABLE'],
    storyFlags: ['RACE_HUMAN'],
  },

  ELF: {
    id: 'ELF',
    race: 'ELF',
    name: '엘프',
    summary: '지능 +3 · 정신 +3 · 민첩 +1 · 체력/근력 -1 · 마법 및 숲 감각',
    description:
      '숲의 영험한 마력과 교감하는 고대 종족입니다. 뛰어난 지능과 정신력을 바탕으로 강력한 마법을 구사하지만, 육체적인 힘과 체력은 다소 연약합니다.',
    iconSymbol: '🌿',
    statModifiers: {
      strength: -1,
      vitality: -1,
      agility: 1,
      intelligence: 3,
      spirit: 3,
      luck: 0,
    },
    passiveIds: ['ELF_MANA_AFFINITY', 'ELF_FOREST_SENSE'],
    learnableSkillIds: ['ELF_NATURE_ARROW', 'MANA_BURST', 'FOREST_WHISPER', 'SPIRIT_SHIELD'],
    factionAffinity: {
      elven_sanctuary: 30,
      natural_order: 20,
      human_kingdom: -5,
    },
    reactionTags: ['MAGICAL', 'ANCIENT', 'NATURE_ALIGNED', 'NOBLE'],
    storyFlags: ['RACE_ELF'],
  },

  BEASTKIN_FOX: {
    id: 'BEASTKIN_FOX',
    race: 'BEASTKIN',
    beastkinType: 'FOX',
    name: '수인',
    subName: '여우 수인',
    summary: '민첩 +2 · 지능 +2 · 행운 +2 · 근력 -1 · 기만 및 환술',
    description:
      '날렵한 몸놀림과 비상한 지혜를 지닌 여우 수인입니다. 교섭과 속임수, 환각 술식에 능하며 돌발 상황을 재치 있게 모면합니다.',
    iconSymbol: '🦊',
    statModifiers: {
      strength: -1,
      vitality: 0,
      agility: 2,
      intelligence: 2,
      spirit: 1,
      luck: 2,
    },
    passiveIds: ['BEASTKIN_FOX_TRICK', 'BEASTKIN_FOX_ILLUSION'],
    learnableSkillIds: ['FOX_FIRE', 'DECEPTIVE_STEP', 'CHARM_WHISPER'],
    factionAffinity: {
      beastkin_tribes: 20,
      merchants_guild: 15,
      thieves_syndicate: 15,
    },
    reactionTags: ['CLEVER', 'TRICKSTER', 'AGILE', 'ENCHANTING'],
    storyFlags: ['RACE_BEASTKIN', 'BEASTKIN_FOX'],
  },

  BEASTKIN_CAT: {
    id: 'BEASTKIN_CAT',
    race: 'BEASTKIN',
    beastkinType: 'CAT',
    name: '수인',
    subName: '고양이 수인',
    summary: '민첩 +4 · 행운 +2 · 체력 -1 · 야간 시야 및 착지 회피',
    description:
      '극도의 민첩성과 유연성을 자랑하는 고양이 수인입니다. 어둠 속에서도 사물을 똑똑히 보며, 은신과 기습, 지형지물 활용에 탁월합니다.',
    iconSymbol: '🐱',
    statModifiers: {
      strength: 0,
      vitality: -1,
      agility: 4,
      intelligence: 0,
      spirit: 1,
      luck: 2,
    },
    passiveIds: ['BEASTKIN_CAT_NIGHT_VISION', 'BEASTKIN_CAT_AGILITY'],
    learnableSkillIds: ['CAT_AMBUSH', 'SHADOW_STEP', 'NINE_LIVES_DODGE'],
    factionAffinity: {
      beastkin_tribes: 20,
      shadow_syndicate: 15,
      free_cities: 10,
    },
    reactionTags: ['STEALTHY', 'FLEXIBLE', 'NIGHT_PROWLER', 'QUICK'],
    storyFlags: ['RACE_BEASTKIN', 'BEASTKIN_CAT'],
  },

  BEASTKIN_DOG: {
    id: 'BEASTKIN_DOG',
    race: 'BEASTKIN',
    beastkinType: 'DOG',
    name: '수인',
    subName: '개 수인',
    summary: '체력 +3 · 근력 +1 · 민첩 +1 · 정신 +1 · 후각 추적 및 동료 신뢰',
    description:
      '강인한 끈기와 예민한 후각을 지닌 개 수인입니다. 흔적을 놓치지 않는 추적 능력을 발휘하며, 동료 및 NPC들과의 깊은 유대감을 형성합니다.',
    iconSymbol: '🐕',
    statModifiers: {
      strength: 1,
      vitality: 3,
      agility: 1,
      intelligence: 0,
      spirit: 1,
      luck: 0,
    },
    passiveIds: ['BEASTKIN_DOG_SCENT_TRACK', 'BEASTKIN_DOG_LOYALTY'],
    learnableSkillIds: ['SCENT_FOCUS', 'LOYAL_GUARD', 'COURAGEOUS_HOWL'],
    factionAffinity: {
      beastkin_tribes: 20,
      royal_guard: 15,
      adventurers_guild: 15,
    },
    reactionTags: ['LOYAL', 'TRACKER', 'RESILIENT', 'TRUSTWORTHY'],
    storyFlags: ['RACE_BEASTKIN', 'BEASTKIN_DOG'],
  },

  BEASTKIN_WOLF: {
    id: 'BEASTKIN_WOLF',
    race: 'BEASTKIN',
    beastkinType: 'WOLF',
    name: '수인',
    subName: '늑대 수인',
    summary: '근력 +3 · 체력 +2 · 민첩 +1 · 정신 +1 · 지능 -1 · 포식자 본능',
    description:
      '거친 야성과 강력한 완력을 겸비한 전사 종족입니다. 무리를 이끄는 위압감과 빈틈없는 사냥 본능으로 전장을 지배합니다.',
    iconSymbol: '🐺',
    statModifiers: {
      strength: 3,
      vitality: 2,
      agility: 1,
      intelligence: -1,
      spirit: 1,
      luck: 0,
    },
    passiveIds: ['BEASTKIN_WOLF_PREDATOR', 'BEASTKIN_WOLF_PACK'],
    learnableSkillIds: ['WOLF_BITE', 'FERAL_ROAR', 'BLOOD_HUNT'],
    factionAffinity: {
      beastkin_tribes: 25,
      wild_hunters: 20,
      mercenaries: 15,
    },
    reactionTags: ['FIERCE', 'PACK_HUNTER', 'INTIMIDATING', 'STRONG'],
    storyFlags: ['RACE_BEASTKIN', 'BEASTKIN_WOLF'],
  },

  BEASTKIN_BIRD: {
    id: 'BEASTKIN_BIRD',
    race: 'BEASTKIN',
    beastkinType: 'BIRD',
    name: '수인',
    subName: '새 수인',
    summary: '민첩 +3 · 행운 +2 · 지능 +1 · 정신 +1 · 근력 -1 · 원거리 시야 및 정찰',
    description:
      '탁 트인 시야와 예리한 관찰력을 지닌 새 수인입니다. 지형을 분석하고 원거리의 위험을 미리 감지하여 언제나 한발 앞서 대처합니다.',
    iconSymbol: '🦅',
    statModifiers: {
      strength: -1,
      vitality: 0,
      agility: 3,
      intelligence: 1,
      spirit: 1,
      luck: 2,
    },
    passiveIds: ['BEASTKIN_BIRD_KEEN_EYE', 'BEASTKIN_BIRD_SCOUT'],
    learnableSkillIds: ['FEATHER_DART', 'EAGLE_EYE', 'GUST_EVASION'],
    factionAffinity: {
      beastkin_tribes: 20,
      scouts_alliance: 20,
      explorers_society: 15,
    },
    reactionTags: ['OBSERVANT', 'HIGH_GROUND', 'SCOUT', 'SWIFT'],
    storyFlags: ['RACE_BEASTKIN', 'BEASTKIN_BIRD'],
  },
};

export const BEASTKIN_SUB_TYPES: Array<{
  type: BeastkinType;
  label: string;
  icon: string;
  key: string;
}> = [
  { type: 'FOX', label: '여우', icon: '🦊', key: 'BEASTKIN_FOX' },
  { type: 'CAT', label: '고양이', icon: '🐱', key: 'BEASTKIN_CAT' },
  { type: 'DOG', label: '개', icon: '🐕', key: 'BEASTKIN_DOG' },
  { type: 'WOLF', label: '늑대', icon: '🐺', key: 'BEASTKIN_WOLF' },
  { type: 'BIRD', label: '새', icon: '🦅', key: 'BEASTKIN_BIRD' },
];

export function getRaceDefinition(race: Race, beastkinType?: BeastkinType): RaceDefinition {
  if (race === 'BEASTKIN') {
    const key = `BEASTKIN_${beastkinType || 'CAT'}`;
    return RACE_DEFINITIONS[key] || RACE_DEFINITIONS.BEASTKIN_CAT;
  }
  return RACE_DEFINITIONS[race] || RACE_DEFINITIONS.HUMAN;
}

export function getRaceDisplayName(race: Race, beastkinType?: BeastkinType): string {
  if (race === 'BEASTKIN') {
    const def = getRaceDefinition(race, beastkinType);
    return def.subName || '수인';
  }
  return race === 'ELF' ? '엘프' : '인간';
}
