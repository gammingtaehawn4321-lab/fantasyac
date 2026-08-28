# 판타지악 — 내용물 표시/출처/몬스터 배출량 + 체형 확장 패치

## 이번 패치 범위

1. 컴포넌트 1·2의 30칸 삽화 구조를 사용자 정의 내용물 3종으로 정리
2. 내부 A/B/C 및 슬롯 ID를 UI에 노출하지 않음
3. 사용자 작성용 내용물 표시명 / 양 표시명 / 단위 / Gemini 참고문구 슬롯 추가
4. 내용물 출처 표시 규칙 정리
5. 전체 몬스터 120종 A/B/C 배출량 설정 슬롯 추가
6. `basic` 상속 규칙 추가
7. 동일 세부종의 내용물을 동일 물질 계열로 취급
8. 키/기존 체구 유지 + 가슴/엉덩이 유형 추가
9. 가슴/엉덩이 Gemini 참고문구는 사용자 작성 공란 유지

체형의 기계적 효과, 임신 확장, 부화, 동반자 연동은 아직 구현하지 않았습니다.

---

## 1. 내용물 이름과 Gemini 참고문구를 작성하는 곳

파일:

`src/data/bodyPayloadUserDefinitions.ts`

수정 대상:

- `BODY_PAYLOAD_CHANNEL_USER_DEFINITIONS.A`
- `BODY_PAYLOAD_CHANNEL_USER_DEFINITIONS.B`
- `BODY_PAYLOAD_CHANNEL_USER_DEFINITIONS.C`

각 항목:

```ts
{
  displayName: '',
  amountLabel: '',
  unit: '',
  geminiReference: '',
}
```

의미:

- `displayName`: 게임 UI에 표시할 실제 내용물 이름
- `amountLabel`: 양을 표시할 때 쓸 명칭
- `unit`: 필요하면 ml, 개 등의 단위
- `geminiReference`: Gemini가 이 내용물의 성질/의미를 이해할 때만 사용하는 내부 참고 문자열

기본값은 모두 공란입니다.

`geminiReference`가 공란이면 해당 참고자료는 Gemini 프롬프트에 들어가지 않습니다.

A/B/C는 내부 식별자일 뿐 UI와 narrative에 노출하지 않습니다.
표시명이 비어 있으면 UI는 `미지정 내용물 1/2/3`으로만 표시합니다.

---

## 2. 컴포넌트 1·2 삽화 슬롯

파일:

`src/data/bodyPayloadPresentation.ts`

구성:

- 컴포넌트 1: 3종 × 5단계 = 15칸
- 컴포넌트 2: 3종 × 5단계 = 15칸

총 `5 × 3 × 2 = 30칸`.

단계:

- 미량
- 적음
- 보통
- 많음
- 포화

실제 `imageSrc`는 30칸 모두 공란입니다.

내부 슬롯 ID는 코드 연결용으로만 유지하며 UI에 표시하지 않습니다.
삽화가 없는 경우 화면에는 `삽화 준비 중`만 표시됩니다.

컴포넌트 3의 기존 표시 구조는 유지합니다.

---

## 3. 내용물 출처 표시 규칙

관련 파일:

- `src/types.ts`
- `src/gameEngine.ts`
- `server.ts`
- `src/components/InternalStatusModal.tsx`

규칙:

- 고유 인물(`sourceType === CHARACTER`)이면 종족 대신 `sourceName`을 표시
- 일반 몬스터/이형이면 내부 ID가 아니라 세부종의 한국어 이름을 표시
- 같은 세부종 + 같은 내용물 채널은 동일 물질 계열로 취급
- 내부 추적은 유지하되 UI에서는 같은 세부종의 잔량을 합쳐 볼 수 있음
- 사건/인카운터 ID는 UI에 표시하지 않음
- 슬롯 ID, sourceId, sourceSpeciesId 같은 내부 ID도 UI에 직접 출력하지 않음

---

## 4. 몬스터 A/B/C 배출량을 수정하는 곳

파일:

`src/data/world/monsterPayloadEmission.ts`

### 인간형 기본값

`HUMANOID_PAYLOAD_AMOUNT_BY_SIZE`

- SMALL = 5
- MEDIUM = 7
- LARGE = 10

현재 A/B/C 모두 같은 크기 기본량을 사용합니다.

인간형 세부종의 기본 체구:

`HUMANOID_BASIC_SIZE_BY_SUBTYPE`

예:
- 인간 / 엘프 / 고양이 수인 / 새 수인 / 여우 수인 / 인어족 = MEDIUM
- 개 수인 / 늑대 수인 = LARGE
- 설인 = SMALL

필요하면 이 기본 체구도 직접 수정할 수 있습니다.

### 이형 기본값

`ABERRANT_PAYLOAD_AMOUNT_BY_SUBTYPE`

세부분류별 A/B/C 값이 따로 있습니다.

현재 분류:
- BEAST
- INSECTOID
- PARASITIC
- PLANTLIKE
- SLIME
- AQUATIC
- AERIAL
- CONSTRUCT
- ELEMENTAL
- UNDEAD
- TENTACLE

### 개별 몬스터 120종

`MONSTER_PAYLOAD_AMOUNT_BY_MONSTER`

모든 현재 몬스터가 다음 형태로 한 줄씩 들어 있습니다.

```ts
grandia_grass_wolf: { A: 'basic', B: 'basic', C: 'basic' },
```

규칙:

- 숫자를 쓰면 그 몬스터의 고유값
- `'basic'`이면 해당 개별값을 무시
- HUMANOID의 `basic` → 체구별 5/7/10
- ABERRANT의 `basic` → 세부분류별 기본값

예:

```ts
grandia_grass_wolf: { A: 12, B: 'basic', C: 3 },
```

이면:
- A = 12 고정
- B = BEAST 상위 기본값
- C = 3 고정

---

## 5. 몬스터 사건에서 실제 양을 정하는 방식

`server.ts`에서 Gemini가 내용물 사건을 구조화할 때 몬스터를 식별합니다.

몬스터가 식별되면 Gemini가 반환한 임의의 `amount`보다
`resolveMonsterPayloadAmount()` 결과를 우선합니다.

따라서 몬스터 배출량의 최종 수치는 사용자 설정 파일이 기준입니다.

같은 세부종 몬스터의 내용물은 동일 `payloadFamilyKey`를 사용하여
같은 물질 계열로 취급합니다.

---

## 6. 신체 유형

기존:
- 키
- 체구(`BuildType`)

둘 다 그대로 유지합니다.

추가:

### 가슴

타입:
- `SMALL` → 빈유
- `SLENDER` → 슬렌더형
- `LARGE` → 거유

### 엉덩이

타입:
- `SLIM` → 부실함
- `AVERAGE` → 적당함
- `FULL` → 풍만함

캐릭터 생성 외형 단계에서 선택할 수 있습니다.

신체적 나이 18세 미만에서는 이 성인 신체 유형 선택 UI와 Gemini 참고 연결을 사용하지 않습니다.

---

## 7. 가슴/엉덩이 Gemini 참조문구를 작성하는 곳

파일:

`src/data/bodyShapeUserReferences.ts`

사용자 작성 칸:

- `BREAST_SIZE_GEMINI_REFERENCES`
- `HIP_SIZE_GEMINI_REFERENCES`

현재 6칸 전부 공란입니다.

공란인 항목은 Gemini에 전달하지 않습니다.

즉 선택값 자체를 Gemini가 임의로 해석하게 하지 않고,
사용자가 작성한 참고 문자열이 있을 때만 해당 묘사 참고자료가 활성화됩니다.

---

## 다음 예정

이번 패치에 포함하지 않음:

1. 체형의 게임 수치/장비 크기 영향
2. 임신 시스템 확장
3. 부화 시스템
4. 부화 결과의 추후 동반자 연동
