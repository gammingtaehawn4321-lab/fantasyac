/**
 * 이 파일의 문자열은 화면에 그대로 출력되는 문장이 아닙니다.
 * Gemini가 장면을 구조화된 상태 변화로 판정할 때 참고하는 사용자 규칙입니다.
 * 실제 표시명/구체적인 장면 조건은 사용자가 직접 작성하세요.
 */
export const BODY_SYSTEM_USER_RULES = {
  compartments: {
    COMPARTMENT_1: '',
    COMPARTMENT_2: '',
    COMPARTMENT_3: '',
  },

  // 어떤 장면에서 범용 반사 배출 판정을 실행할지 자연어로 작성.
  reflexTriggerRule: '',

  // 어떤 장면에서 payload가 추가/감소하는지 보조 규칙이 필요하면 작성.
  payloadChangeRule: '',

  // 외부에서 유입되는 URINE payload가 발생했다고 판정할 장면 조건을 자연어로 작성.
  // 플레이어 자신의 bladderStatus와는 완전히 별개입니다.
  externalUrineTriggerRule: '',

  // 임신 성립을 별도로 판정해야 하는 경우 사용할 사용자 규칙.
  pregnancyTriggerRule: '',
} as const;
