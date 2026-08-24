/**
 * 중요:
 *
 * 아래 문자열들은 게임 화면에 그대로 출력하기 위한 문장이 아니다.
 *
 * Gemini에게 전달되는 "연출 참고자료 / 의미 지침"이다.
 *
 * server.ts에서:
 * - 원문 복사 금지
 * - 현재 장면에 맞게 자유롭게 재구성
 * - 여러 지침을 조합 가능
 * - 불필요하면 생략 가능
 * - 의미와 설정만 유지
 *
 * 규칙으로 전달한다.
 *
 * 길게 쓰고 싶다면:
 *
 * field: `
 * 여러 줄
 * 작성 가능
 * `,
 *
 * 형태로 바꿔도 된다.
 */

export const ADULT_NARRATIVE_DIRECTIVES = {
  // ==========================================
  // 성인 관계 장면 전체
  // ==========================================

  generalAdultScene: '',

  relationshipEvent: '',


  // ==========================================
  // 성욕
  // ==========================================

  desireIncrease: '',

  desireHigh: '',


  // ==========================================
  // 음란도
  // ==========================================

  lewdnessIncrease: '',

  lewdnessHigh: '',


  // ==========================================
  // 감도
  // ==========================================

  sensitivityIncrease: '',

  sensitivityDecrease: '',

  sensitivityHigh: '',


  // ==========================================
  // 타락도
  // ==========================================

  corruptionIncrease: '',

  corruptionTierUp: '',


  // ==========================================
  // 미약
  // ==========================================

  // 관계 이벤트 중 미약 적용 사건 자체
  aphrodisiacInjectionEvent: '',

  // 0 -> 양수
  aphrodisiacApplied: '',

  // 이미 미약이 있는 상태에서 추가 적용
  aphrodisiacIntensified: '',

  // 미약이 현재 활성화된 동안 참고
  aphrodisiacActive: '',

  // 시간 경과로 강도가 낮아졌을 때
  aphrodisiacDecay: '',

  // 완전히 0이 되었을 때
  aphrodisiacCleared: '',


  // ==========================================
  // 중독
  // ==========================================

  addictionIncrease: '',

  addictionTierUp: '',

  addictionActive: '',


  // ==========================================
  // 자유 확장용
  // ==========================================

  custom: '',
} as const;

export type AdultNarrativeDirectiveKey =
  keyof typeof ADULT_NARRATIVE_DIRECTIVES;