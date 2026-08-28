# 판타지악 v2.0.5 — 용족 시스템 패치

## 추가
- 플레이어블 종족 `DRAGONKIN` / UI 표기 `용족`
- 시작 지역: 6지역 전부 선택 가능. 용족은 선택 지역의 기존 운명 시작 상황을 자유롭게 선택한다.
- 종족 패시브: `영물의 육신`, `숭배받는 수호신`
- 종족 액티브: `신성한 용숨결`, `용린 수호`
- 용족 전용 기본 전직: `용왕`; 다른 6개 기본 직업 선택 차단, 비용족의 용왕 선택 차단. Lv.20 이후 4종 심화 전직과 공통 『용제』 현현 시스템으로 이어진다.
- 용제 전용 액티브: `용제의 포효`, `조룡의 성화`, `용린 성역`
- 전용 상태 UI: 전용 전직 / 사냥 위협도 / 전용 조우 누적 / 사회적 인식
- 여행 중 용족에게만 발생하는 전문 사냥 세력 판정
- 전용 비전투 인카운터 7종
- 전용 사냥꾼/포획 기계 적 10종. 일반 몬스터 풀에서는 제외되어 비-용족에게 자연 발생하지 않는다.

## 서사 참조 위치
`src/data/dragonkin/dragonkinNarrativeReferences.ts`

- `DRAGONKIN_WORLD_REFERENCE`: 기본 세계관 참조.
- `DRAGONKIN_HUNTER_ENCOUNTER_REFERENCES`: 7개 사냥꾼 인카운터별 참조.
- `DRAGONKIN_USER_TODO_REFERENCES`: 사용자가 직접 쓸 수 있는 추가 서사 슬롯.
  - `captureAftermath`
  - `captivityLife`
  - `blackMarket`

`USER_TODO` 값이 공란이면 Gemini 참고자료에 포함되지 않는다.

## 지역별 사냥꾼/포획기계 출현 풀
- 그란디아: 용흔 추적사 / 용혈 공명견
- 세이레: 용각 채취자
- 포레진: 용맥 봉인술사 / 용맥 억제기
- 산티맥: 봉인망 포획꾼 / 용족 포획 골렘
- 프로스티: 쇄룡 기사
- 스크로제: 쇄룡 발리스타 / 비늘 공명 드론

지역 전용 풀은 `src/data/dragonkin/dragonkinEncounterSystem.ts`의
`DRAGONKIN_HUNTER_MONSTERS_BY_REGION`에서 관리한다.

## 검증
- 핵심 TypeScript 단독 컴파일: PASS
- 런타임 검증: 23/23 PASS
- 일반 몬스터 풀에 용족 전용 적 혼입: 0
- 비용족 전용 사냥 이벤트 발생: 0
