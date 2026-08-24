import { EncounterDefinition } from '../../types';

export const ENCOUNTER_DATABASE: Record<string, EncounterDefinition> = {
  forest_ambush_investigation: {
    id: 'forest_ambush_investigation',
    title: '어스름 숲의 의문의 발자국',
    summary: '안개 낀 숲길에서 부서진 마차 잔해와 늑대 무리의 불길한 발자국이 발견되었습니다.',
    location: '어스름 숲 초입',
    isPersistent: true,
    totalSteps: 2,
    conditions: {
      location: '어스름 숲',
    },
    chainOnResolve: [
      {
        nextEncounterId: 'bandit_hideout_scouting',
        delayDays: 1,
        delayTimeOfDay: 'NIGHT',
      },
    ],
    chainOnFail: [
      {
        nextEncounterId: 'forest_wolf_pack_hunt',
        delayDays: 0,
        delayTimeOfDay: 'NIGHT',
      },
    ],
    startsCombat: false,
  },

  forest_wolf_pack_hunt: {
    id: 'forest_wolf_pack_hunt',
    title: '굶주린 늑대 무리의 야간 습격',
    summary: '숲의 어둠 속에서 붉은 안광을 번뜩이는 야생 늑대 무리가 포위망을 좁혀옵니다.',
    location: '어스름 숲 심층',
    isPersistent: false,
    startsCombat: true,
    combatEnemyTemplate: 'wild_wolf',
  },

  bandit_hideout_scouting: {
    id: 'bandit_hideout_scouting',
    title: '협곡 도적단의 감시 초소',
    summary: '절벽 틈새에 숨겨진 도적단의 전초기지. 잠입하거나 정면 돌파할 수 있는 기로에 섭니다.',
    location: '메아리 협곡 외곽',
    isPersistent: true,
    totalSteps: 3,
    associatedNpcId: 'drake_bandit_leader',
    associatedQuestId: 'quest_bandit_canyon_negotiation',
    startsCombat: false,
  },

  ancient_crypt_exploration: {
    id: 'ancient_crypt_exploration',
    title: '지하 묘지의 봉인된 성소',
    summary: '수백 년간 닫혀 있던 석문 너머에서 고대 유령들의 속삭임과 마력의 파동이 흘러나옵니다.',
    location: '고대 지하 묘지',
    isPersistent: true,
    totalSteps: 2,
    conditions: {
      locksUnlocked: ['crypt_iron_gate'],
    },
    chainOnResolve: [
      {
        nextEncounterId: 'crypt_guardian_awakening',
        delayDays: 0,
      },
    ],
    startsCombat: false,
  },

  crypt_guardian_awakening: {
    id: 'crypt_guardian_awakening',
    title: '성소 묘지기 망령의 각성',
    summary: '침입자를 응징하기 위해 고대 전사의 영혼이 검을 뽑아 들었습니다.',
    location: '고대 지하 묘지 중앙 제단',
    isPersistent: false,
    startsCombat: true,
    combatEnemyTemplate: 'skeleton_warrior',
  },

  lunar_dancer_encounter: {
    id: 'lunar_dancer_encounter',
    title: '달빛 오아시스의 매혹적인 춤사위',
    summary: '사막의 맑은 샘가에서 은빛 차크람을 든 수인 무희 실비아가 화려한 무도를 펼치고 있습니다.',
    location: '달빛 오아시스',
    isPersistent: true,
    totalSteps: 2,
    associatedNpcId: 'sylvia_shadow_dancer',
    associatedQuestId: 'quest_sylvia_lunar_veil',
    startsCombat: false,
  },

  arcane_library_trial: {
    id: 'arcane_library_trial',
    title: '마법탑 서재의 비전 수수께끼',
    summary: '공중에 떠오른 마법 서적들이 침입자의 지혜와 마력 감응력을 시험합니다.',
    location: '은둔자의 마법탑 상층',
    isPersistent: true,
    totalSteps: 2,
    associatedNpcId: 'kaelen_archmage',
    associatedQuestId: 'quest_arcane_investigation',
    conditions: {
      locksUnlocked: ['arcane_tower_barrier'],
    },
    startsCombat: false,
  },
};

export function getEncounterDefinition(encounterId?: string): EncounterDefinition | undefined {
  if (!encounterId) return undefined;
  return ENCOUNTER_DATABASE[encounterId.trim()];
}
