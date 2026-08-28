# 판타지악 지역 설정 수정 위치

각 지역의 세계관 문구는 서로 다른 파일로 분리되어 있습니다. 아래 파일만 수정하면 지도/운명/몬스터 엔진과 분리된 채 설정을 바꿀 수 있습니다.

## 그란디아
- 파일: `src/data/world/regions/grandia.ts`
- 지역 객체 시작: **7행**
- 핵심 세계관 `lore`: **12행**
- 수도/중심지 `capitals`: **16행**

## 세이레
- 파일: `src/data/world/regions/seire.ts`
- 지역 객체 시작: **4행**
- 핵심 세계관 `lore`: **9행**
- 수도/중심지 `capitals`: **13행**

## 포레진
- 파일: `src/data/world/regions/forezin.ts`
- 지역 객체 시작: **4행**
- 핵심 세계관 `lore`: **9행**
- 수도/중심지 `capitals`: **13행**

## 산티맥
- 파일: `src/data/world/regions/santimac.ts`
- 지역 객체 시작: **4행**
- 핵심 세계관 `lore`: **9행**
- 수도/중심지 `capitals`: **13행**

## 프로스티
- 파일: `src/data/world/regions/prosti.ts`
- 지역 객체 시작: **4행**
- 핵심 세계관 `lore`: **9행**
- 수도/중심지 `capitals`: **13행**

## 스크로제
- 파일: `src/data/world/regions/scroze.ts`
- 지역 객체 시작: **4행**
- 핵심 세계관 `lore`: **9행**
- 수도/중심지 `capitals`: **13행**

## 공통 연결 파일
- `src/data/world/regionData.ts` — 6지역을 한 데이터베이스로 합치는 파일. 보통 직접 수정할 필요 없음.
- `src/data/world/regionTypes.ts` — 지역 데이터 구조/타입. 새로운 설정 필드를 추가할 때 수정.
- `src/data/world/worldMapSystem.ts` — Hex 좌표, 레이어, 경로, 항법, 아벨라 이동 등 지도 엔진.
- `src/data/world/fateData.ts` — 종족별 시작 지역과 운명/시작 상황.
- `src/data/world/monsterData.ts` — 지역별 일반/엘리트 몬스터 풀. 지역 보스는 아직 의도적으로 비워둠.
- `src/data/world/travelEvents.ts` — 지역/지형/레이어별 이동 사건.
- `src/data/world/undergroundDevelopment.ts` — 지하 `개발 중` 잠금 상태.

## 스크로제 관련 별도 수정 포인트
- 하늘/천공 지형 생성 비율, 수직 연결, 아벨라 이동: `src/data/world/worldMapSystem.ts`
- 하늘/천공 항법 아이템: `src/data/items/itemDatabase.ts` (`sky_navigation_*`, `celestial_navigation_*`, `celestial_flight_permit`)
- 지도 UI 레이어/핀치줌/드래그: `src/components/WorldMapModal.tsx`

## 참고
현재 Hex 좌표 배치는 **기술적 플레이 가능 배치**입니다. 6지역의 정확한 대륙 윤곽을 나중에 정하면 `worldMapSystem.ts`의 생성 규칙/특수 위치 좌표만 교체하면 되고, 지역 세계관 파일은 건드릴 필요가 없습니다.
