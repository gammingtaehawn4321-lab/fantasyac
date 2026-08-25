# 판타지악 체내 상태 통합 패치 — 사용자 작성 가이드

## 통일 원칙
- 코드 내부 구획 ID: `COMPARTMENT_1`, `COMPARTMENT_2`, `COMPARTMENT_3`
- 화면 표시명/구체적 의미는 `src/data/bodySystemConfig.ts`와 `src/data/bodySystemUserRules.ts`에서 사용자가 정한다.
- Gemini 판정용 자연어 규칙과 연출용 문장은 분리한다.
- `bodySystemUserRules.ts` = 무엇이 발생했는지 판정하는 규칙.
- `bodyLoadNarrativeDirectives.ts` = 현재 양 단계에 따른 연출 참고자료.
- `adultNarrativeDirectives.ts` = 상태 변화 사건 자체의 연출 참고자료.
- 모든 narrative directive는 원문 출력용이 아니라 Gemini 참고자료다.

## 사용자가 작성할 파일
### src/data/bodySystemUserRules.ts
- `compartments.COMPARTMENT_1/2/3`: 각 구획을 어떤 장면에서 판정할지 자연어로 작성.
- `reflexTriggerRule`: 범용 반사 배출 판정을 언제 요청할지 작성.
- `payloadChangeRule`: payload 추가/감소 판정에 보조 규칙이 필요할 때 작성.
- `pregnancyTriggerRule`: 임신 성립 판정에 사용할 사용자 규칙.

### src/data/bodySystemConfig.ts
- `BODY_STATUS_VISUALS.*.label`: 화면 표시명.
- `BODY_STATUS_VISUALS.*.imageSrc`: 직접 만든 상태 이미지 경로.
- `BLADDER_STATUS_VISUAL.imageSrc`: 직접 만든 소변 욕구 상태 이미지 경로.
- 단계/효과 수치는 이미 엔진 기본값이 있으므로 수정하지 않아도 된다.

### src/data/bodyLoadNarrativeDirectives.ts
각 구획 × payload 종류마다 `TRACE`, `LOW`, `MEDIUM`, `HIGH`, `SATURATED` 빈 문자열이 있다.
원하는 연출 방향만 작성한다. 단계는 엔진이 자동 판정한다.

### src/data/adultNarrativeDirectives.ts
새 빈칸: payloadAdded/reduced/cleared/high, bladder*, pregnancy*, parasiteInserted*, parasiteInternal*.
상태 변화 사건의 연출 방향을 작성한다.

## 엔진이 자동으로 하는 일
- Gemini 응답의 `sceneState.payloadEvents[]` 구조화 판정.
- 구획/종류/양 검증 및 누적.
- EGG/PARASITE의 허용 구획 검증.
- 삽입형/내부형 기생 상태 생성과 시간 진행.
- 삽입형 기생 상태의 주기적 `INSECTOID_SECRETION` 생성.
- 소변 욕구 시간 증가 및 범용 반사 확률(HUMANOID 30%, ABERRANT 70%).
- payload 양에 따른 `effectiveDesire`, `lewdness`, `effectiveCorruption`, `sensitivity` 파생 보정.
- 영구 `corruption`과 현재 `effectiveCorruption` 분리.
- 임신 시간 진행 및 자식 종족 1회 확정. HUMANOID × ABERRANT는 ABERRANT 종족 우선, 동일 대분류의 서로 다른 종은 기본 50:50.
- 구 세이브 마이그레이션.


## 외부 URINE payload 추가

- `bladderStatus`는 플레이어 자신의 방광/소변 욕구입니다.
- `bodyPayloads`의 `URINE`은 외부에서 유입된 것으로 판정된 양이며 둘은 합산하지 않습니다.
- 구획별 `URINE`은 다른 payload와 동일하게 독립 누적되고 EMPTY/TRACE/LOW/MEDIUM/HIGH/SATURATED 단계를 자동 판정합니다.
- `src/data/bodySystemUserRules.ts`의 `externalUrineTriggerRule`에 발생 조건을 자연어로 작성하세요.
- `src/data/bodyLoadNarrativeDirectives.ts`의 각 구획 `URINE` 단계 빈칸에는 현재량에 따른 연출 방향만 작성하세요.
- 구체적인 장면 문장은 Gemini가 참고자료를 바탕으로 새로 구성합니다.
- 기본 파생 밸런스: URINE은 100% 부하 기준 desire +4, lewdness +0.65, effective corruption +0.35, sensitivity +1의 기여도를 가지며 전체 전역 상한의 적용을 받습니다.
