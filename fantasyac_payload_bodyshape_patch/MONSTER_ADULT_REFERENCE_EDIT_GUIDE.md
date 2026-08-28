# 몬스터 성인 장면 참조 슬롯 + 사용자 인카운터 슬롯

## 1. 몬스터 참조를 수정할 파일

`src/data/world/monsterAdultSceneReferences.ts`

이 파일 하나에 3단계 참조가 전부 있습니다. 초기 내용은 **모두 빈 문자열**입니다.

### 상위 Race 분류
- `MONSTER_ADULT_SCENE_REFERENCE_BY_CATEGORY.HUMANOID`
- `MONSTER_ADULT_SCENE_REFERENCE_BY_CATEGORY.ABERRANT`

### 세부분류 20종
`MONSTER_ADULT_SCENE_REFERENCE_BY_SUBTYPE` 안의:

`HUMAN / ELF / BEASTKIN_CAT / BEASTKIN_DOG / BEASTKIN_BIRD / BEASTKIN_FOX / BEASTKIN_WOLF / MERFOLK / YETI / BEAST / INSECTOID / PARASITIC / PLANTLIKE / SLIME / AQUATIC / AERIAL / CONSTRUCT / ELEMENTAL / UNDEAD / TENTACLE`

### 몬스터 개별 95종
`MONSTER_ADULT_SCENE_REFERENCE_BY_MONSTER`에 현재 존재하는 95종이 각각 독립 키로 들어 있습니다. 각 줄 옆에 한국어 몬스터 이름과 분류가 주석으로 붙어 있습니다.

## 2. 자동 폴백

Gemini에 전달할 참조는 다음 우선순위입니다.

1. 해당 몬스터 개별 칸이 채워져 있으면 그것 사용
2. 개별 칸이 비었으면 해당 세부분류 칸 사용
3. 세부분류도 비었으면 `HUMANOID` 또는 `ABERRANT` 공통 칸 사용
4. 셋 다 비어 있으면 몬스터 전용 참조를 아예 전달하지 않음

따라서 공통 연출만 먼저 작성한 뒤, 특별히 구별하고 싶은 몬스터만 개별 칸을 채우면 됩니다.

## 3. 어떤 몬스터인지 판정하는 방법

`server.ts`에서 다음 순서로 현재 몬스터 문맥을 찾습니다.

- 현재 패배 후 인카운터의 `sourceEnemyIds`
- 진행 중 전투의 적
- 직전 전투 몬스터(전투 종료 뒤 4개 로그 동안 유지)
- 최근 대화/입력 텍스트에 직접 등장한 몬스터 ID 또는 한국어 이름

성인 참조는 **신체적 나이 18세 이상에서만** 전달됩니다.

## 4. 사용자 작성용 빈 인카운터 5개

`src/data/encounters/encounterDatabase.ts`의 아래 키입니다.

- `user_encounter_slot_01`
- `user_encounter_slot_02`
- `user_encounter_slot_03`
- `user_encounter_slot_04`
- `user_encounter_slot_05`

현재 각 슬롯은:

```ts
title: ''
summary: ''
location: ''
sceneReference: ''
rewards: {}
enabled: false
```

로 비어 있습니다.

작성 후 마지막에 `enabled: true`로 바꾸면 활성화됩니다.

`sceneReference`는 해당 인카운터가 `activeEncounterId`로 진행되는 동안 Gemini의 내부 참고자료로 전달됩니다. 원문 복사 지시가 아니라 현재 장면에 맞게 재구성하도록 연결되어 있습니다.

`rewards`는 기존 `QuestRewards` 형식을 그대로 사용합니다. 예를 들면 경험치, 루피, 아이템 등을 넣을 수 있고 `ENCOUNTER_RESOLVED` 때 자동 지급됩니다.

## 5. 연결 코드 위치

- 몬스터 분류/95종 원본: `src/data/world/monsterData.ts`
- 몬스터 성인 참조 슬롯: `src/data/world/monsterAdultSceneReferences.ts`
- Gemini 참조 연결: `server.ts`
- 빈 인카운터 5개: `src/data/encounters/encounterDatabase.ts`
- 인카운터 진행/보상 연결: `src/gameEvents.ts`
- 타입: `src/types.ts`

## 6. 주의

몬스터 참조 칸은 사용자가 직접 내용을 채우는 용도입니다. 현재 배포본에는 몬스터별/분류별 성인 장면 문구를 미리 작성해 두지 않았습니다.
