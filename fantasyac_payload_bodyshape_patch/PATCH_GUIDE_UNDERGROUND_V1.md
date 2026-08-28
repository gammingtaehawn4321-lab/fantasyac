# 판타지악 v1.2 지하 시스템 1차 패치

## 핵심
- 기존 `UNDERGROUND` 개발중 잠금을 해제하고 실제 Hex 탐험 레이어로 전환.
- 스크로제를 제외한 그란디아 / 포레진 / 세이레 / 산티맥 / 프로스티에 독립 지하망 생성.
- 기존 지도에 예약했던 광산·협곡·싱크홀·던전 입구 19개를 실제 수직 이동 링크로 사용.
- 각 지역 지하망은 현재 서로 독립되어 있으며 지상을 거쳐 이동한다.
- 지역마다 추후 더 깊은 지하층으로 연결할 `DEEP_UNDERGROUND_FUTURE_HOOK`를 1개 이상 예약.

## 지하 지형
`src/types.ts`의 `HexTerrain`에 다음이 추가됨.
- `CAVE` — 자연 동굴
- `TUNNEL` — 이동이 빠른 주 갱도/통로
- `UNDERGROUND_RIVER` — 지하수맥
- `CHASM` — 이동 비용과 위험도가 높은 지하 균열
- `CRYSTAL_CAVE` — 결정/광맥 공동

지도 삽화는 `src/components/worldMap/HexTerrainArt.tsx`에서 SVG 벡터로 직접 렌더링한다.

## 입구 설정 위치
`src/data/world/undergroundDevelopment.ts`

`UNDERGROUND_ENTRANCES` 배열의 각 항목이:
- 지상/해저 입구 위치
- `undergroundHookId`
- 입구 종류
- 연결되는 지하 섹터
- 지하 입구 이름
을 가진다.

## 지하 섹터 15개
`src/data/world/sectorEncounters.ts`

### 그란디아
- `grandia_underground_mines`
- `grandia_underground_caverns`
- `grandia_underground_depths`

### 포레진
- `forezin_underground_roots`
- `forezin_underground_river`
- `forezin_underground_depths`

### 세이레
- `seire_underground_flooded`
- `seire_underground_trench`
- `seire_underground_ruins`

### 산티맥
- `santimac_underground_mines`
- `santimac_underground_chasm`
- `santimac_underground_ruins`

### 프로스티
- `prosti_underground_icecave`
- `prosti_underground_crystal`
- `prosti_underground_depths`

모든 섹터는 독립적인 사건 목록과 몬스터 풀을 가진다.

## 지하 지도 해금
- 처음에는 지하 탭 잠금.
- 광산/협곡/싱크홀/던전 입구 Hex를 직접 탐사하면 연결된 지하 입구 Hex가 발견된다.
- 그 순간 지도 UI의 `지하` 탭이 열림.
- 지하에서도 기존과 동일하게 드래그, 핀치줌, Hex 목적지 선택, 최단/최속/안전 경로 계산, 타일 단위 시간 경과/인카운터를 사용한다.

## TENTACLE 추가
`src/data/world/monsterData.ts`

`MonsterRaceSubtype`에 `TENTACLE` 추가.
스크로제를 제외한 5지역에 신규 1종씩 추가:
- 그란디아 — 왕도 암거 촉수체
- 포레진 — 심근 촉수덩굴
- 세이레 — 청색 심공 촉수체
- 산티맥 — 사암 심층 촉수체
- 프로스티 — 빙맥 촉수체

현재 몬스터 총수: 95종.

성인 참조 빈칸도 `src/data/world/monsterAdultSceneReferences.ts`에 추가되어:
`개별 몬스터 → TENTACLE → ABERRANT → 없음`
순으로 폴백한다. 내용은 비어 있다.

## 전리품
신규 5종은 기존 `monsterLootSystem.ts`의 자동 생성 파이프라인을 그대로 사용한다.
각 몬스터에:
- 고유 제작재료
- 실제 장비 DB 기반 장비 드랍 후보
- EXP / 루피
- 기존 희귀 부활의 물약 판정
이 자동 연결된다.

## 추후 확장 포인트
현재 `UNDERGROUND`는 1차 지하망이다. 더 깊은 지하층/대형 던전/지역 보스는 봉인 균열과 `DEEP_UNDERGROUND_FUTURE_HOOK`를 기준으로 추가할 수 있다.
