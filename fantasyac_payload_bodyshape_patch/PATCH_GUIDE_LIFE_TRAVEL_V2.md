# 판타지악 2.0 — 생활·이동 패치 수정 가이드

## 핵심 파일
- 생활 재료/용도/출현 지형: `src/data/items/lifeMaterialSystem.ts`
- 생활 제작식: `src/data/professions/lifeRecipeExpansion.ts`
- 지상 이동 한도·종족/패시브/도구/장비 보정·비행정: `src/data/world/lifeTravelSystem.ts`
- 이동거리 보정 장비: `src/data/equipment/lifeTravelEquipment.ts`
- 역참 20개/노선/특수 인카운터 확률: `src/data/world/waystationSystem.ts`
- 역참 인카운터 연출 정의: `src/data/encounters/encounterDatabase.ts`
- 월드맵 역참/이동 제한/하늘·천공 진입: `src/data/world/worldMapSystem.ts`
- 월드맵 UI/비행정/역참/채집: `src/components/WorldMapModal.tsx`
- Hex 생활 채집: `src/data/world/gatheringSystem.ts`
- 신규 주요 인물 45명: `src/data/characters/majorCharacterExpansion.ts`
- 전체 주요 인물 병합: `src/data/characters/majorCharacters.ts`
- 주요 인물 관계/영입 UI: `src/components/MajorCharactersModal.tsx`
- 반복 대화/악독함 노출/퀘스트 이벤트: `src/gameEvents.ts`
- 가이드 퀘스트: `src/data/quests/guideQuestExpansion.ts`
- 세이브 마이그레이션/초기 상태: `src/gameEngine.ts`
- 실제 UI 핸들러: `src/App.tsx`

## 신규 주요 인물 퀘스트 작성
2.0.5에서 비악랄 신규 인물 31명은 `characterQuestExpansionV205.ts`의 공식 고유 퀘스트와 연결됩니다. `villainous: true`인 14명은 `customQuestIds: []`를 유지하며 이번 패치에서 건드리지 않습니다.

## 악독함
`villainous: true`, `betrayalRisk`로 관리합니다. 기본 UI에서는 숨기고 반복 대화 중 확률적으로 `maliciousIntentExposed`/`betrayalTriggered`가 기록됩니다.

## 비행정
구형 `celestial_flight_permit`은 레거시 증표입니다. 2.0 핵심 이동은 직접 건조한 `PlayerState.airship`과 연료를 사용합니다. 하늘/천공의 기존 지도·나침반·망원경 항법 조건은 유지됩니다.

## 다음 패치 예약
야생 동물을 길들여 동행하는 별도 『동반자』 시스템은 이번 패치에 포함하지 않았습니다. 2.0 최종 패치용으로 남겨둡니다.
