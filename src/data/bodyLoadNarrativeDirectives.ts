import type { BodyCompartmentId, BodyLoadStage, BodyPayloadKind } from '../types';

type StageDirectives = Record<Exclude<BodyLoadStage, 'EMPTY'>, string>;
const blankStages = (): StageDirectives => ({ TRACE: '', LOW: '', MEDIUM: '', HIGH: '', SATURATED: '' });

/**
 * 전부 "연출 원고"가 아니라 Gemini용 참고 칸입니다.
 * 엔진이 구획/종류/현재량으로 단계를 자동 판정하고 해당 칸만 활성 참고자료로 전달합니다.
 */
export const BODY_LOAD_NARRATIVE_DIRECTIVES: Record<BodyCompartmentId, Record<BodyPayloadKind, StageDirectives>> = {
  COMPARTMENT_1: {
    STANDARD_FLUID: blankStages(), INSECTOID_SECRETION: blankStages(), URINE: blankStages(), EGG: blankStages(), PARASITE: blankStages(), OTHER: blankStages(),
  },
  COMPARTMENT_2: {
    STANDARD_FLUID: blankStages(), INSECTOID_SECRETION: blankStages(), URINE: blankStages(), EGG: blankStages(), PARASITE: blankStages(), OTHER: blankStages(),
  },
  COMPARTMENT_3: {
    STANDARD_FLUID: blankStages(), INSECTOID_SECRETION: blankStages(), URINE: blankStages(), EGG: blankStages(), PARASITE: blankStages(), OTHER: blankStages(),
  },
};
