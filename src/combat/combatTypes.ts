import { CombatDerivedStats } from '../data/combatConfig';
import { PlayerStats } from '../types';

export type StatusEffectType =
  | 'BLEED'          // 출혈 (지속 물리 피해)
  | 'POISON'         // 중독 (지속 마법 피해)
  | 'STUN'           // 기절 (행동 불가)
  | 'DEFEND'         // 방어 태세 (피해 경감 + 흐트러짐 회복)
  | 'SHIELD'         // 보호막 (피해 흡수)
  | 'ATK_UP'         // 공격력 상승
  | 'DEF_UP'         // 방어력 상승
  | 'SPEED_UP'       // 행동 속도 상승
  | 'TAUNT'          // 도발
  | 'REGENERATION'   // 지속 회복
  | 'BLIND'          // 실명 (명중률 대폭 감소)
  | 'SLOW'           // 둔화 (행동 속도 감소)
  | 'WEAKEN'         // 약화 (공격력 감소)
  | 'VULNERABLE';    // 취약 (방어력 감소)

export type EnemyTier = 'WEAK' | 'NORMAL' | 'ELITE' | 'BOSS';

export type EnemyIntentType =
  | 'ATTACK'
  | 'HEAVY_ATTACK'
  | 'DEFEND'
  | 'PREPARE_SKILL'
  | 'DEBUFF'
  | 'HEAL'
  | 'ESCAPE'
  | 'UNKNOWN';

export interface EnemyIntent {
  type: EnemyIntentType;
  label: string;
  description: string;
  targetActorId?: string;
  isSecret?: boolean;
}

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  name: string;
  duration: number; // 남은 턴 수
  value?: number;   // 효과 수치 (예: 보호막 잔여량, 지속 피해량, 배율 등)
  sourceActorId?: string;
}

export interface BattleActor {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  sanity?: number;
  maxSanity?: number;
  stagger: number;      // 현재 흐트러짐 (0 ~ maxStagger)
  maxStagger: number;   // 최대 흐트러짐 한계치
  isStaggered: boolean; // 흐트러짐(그로기) 상태 여부
  stats: CombatDerivedStats;
  baseStats?: PlayerStats;
  skills: string[];
  traits: string[];
  statusEffects: StatusEffect[];
  consumedBattleEffects?: string[]; // 1회성 효과 (예: revive_once 등) 소모 여부
  portraitUrl?: string;
  isPlayer: boolean;
  isCompanion?: boolean;
  tier?: EnemyTier;
  archetype?: string;
  nextIntent?: EnemyIntent; // 적의 행동 예고
  aiProfile?: {
    personality: 'AGGRESSIVE' | 'DEFENSIVE' | 'TACTICAL' | 'BERSERK' | 'SUPPORT';
    preferredSkills: string[];
  };
}

export type BattlePhase =
  | 'ROUND_START'
  | 'PLAYER_TURN'
  | 'COMPANION_TURN'
  | 'ENEMY_TURN'
  | 'ACTION_RESOLVING'
  | 'VICTORY'
  | 'DEFEAT'
  | 'ESCAPED';

export interface BattlefieldState {
  id: string;
  name: string;
  description: string;
  environmentType: 'FOREST' | 'DUNGEON' | 'RUINS' | 'CITY' | 'CAVE' | 'PLAIN' | 'CASTLE';
  effectModifiers?: {
    accuracyModifier?: number;
    evasionModifier?: number;
    escapeChanceModifier?: number;
    speedModifier?: number;
    physicalDefenseModifier?: number;
  };
}

export interface BattleLogEntry {
  id: string;
  turn: number;
  actorName: string;
  isPlayer: boolean;
  text: string;
  speechText?: string;
  badge?: {
    text: string;
    type: 'damage' | 'heal' | 'buff' | 'crit' | 'miss' | 'info' | 'stagger';
  };
  timestamp: number;
}

export interface BattleVictoryCondition {
  type: 'DEFEAT_ALL' | 'SURVIVE_TURNS' | 'DEFEAT_TARGET';
  targetEnemyId?: string;
  surviveTurnsTarget?: number;
}

export interface BattleState {
  id: string;
  turn: number;
  phase: BattlePhase;
  battlefield: BattlefieldState;
  player: BattleActor;
  companions: BattleActor[];
  enemies: BattleActor[];
  battleLog: BattleLogEntry[];
  victoryCondition: BattleVictoryCondition;
  canEscape: boolean;
  activeActorIndex?: number;
  turnOrder: string[]; // Actor IDs in execution order for this turn
}

export interface BattleActionResult {
  battleState: BattleState;
  logEntries: BattleLogEntry[];
  isBattleEnded: boolean;
  outcome?: 'VICTORY' | 'DEFEAT' | 'ESCAPED';
  rewards?: {
    exp: number;
    rupees: number;
    items: Array<{ name: string; quantity: number }>;
  };
}
