# 판타지악 지하·심층·던전 패치 가이드

## 핵심 구조
- 지하 1층: `UNDERGROUND` — 거대한 지역별 미로형 동굴망.
- 지하 2층: `DEEP_UNDERGROUND` — 1층보다 넓고 위험하며 광맥/보상이 강화된 심층.
- 지하 3층: `HELL` — 데이터/봉인문/클리어 플래그만 존재하며 **미구현**.
- 지역별 1층 보스를 쓰러뜨려야 해당 지역의 심층으로 내려갈 수 있다.
- 심층 보스를 쓰러뜨리면 지옥층 봉인 해제 플래그가 기록되지만 지옥 타일은 아직 생성되지 않는다.
- 일부 1층 공동은 특정 싱크홀로만 진입 가능한 고립 구역이다.

## 주요 수정 파일
- 지하 입구/층 보스/지옥 잠금: `src/data/world/undergroundDevelopment.ts`
- 지하·심층 미로/광맥/마을/던전 월드 배치: `src/data/world/worldMapSystem.ts`
- 지하/심층 섹터 인카운터: `src/data/world/sectorEncounters.ts`
- 채굴: `src/data/world/miningSystem.ts`
- 110종 몬스터: `src/data/world/monsterData.ts`
- 몬스터 전리품: `src/data/world/monsterLootSystem.ts`
- 던전 정의/고정 타일 생성: `src/data/dungeons/dungeonSystem.ts`
- 일반 함정 6종 + 사용자 작성용 특수 함정 5슬롯: `src/data/dungeons/dungeonTrapReferences.ts`
- 던전 탐사 UI: `src/components/DungeonExplorerModal.tsx`
- 지도 UI: `src/components/WorldMapModal.tsx`
- 몬스터 연계 장비 20종: `src/data/equipment/undergroundMonsterEquipment.ts`
- 장비 삽화: `public/assets/equipment/underground/*.svg`

## 지하 마을
지역별 1개, 총 5개. 각각 7 Hex 생활권이다.
- 그란디아: 암석등 마을
- 포레진: 뿌리샘 부락
- 세이레: 청해굴 마을
- 산티맥: 석풍 마을
- 프로스티: 빙등 취락

## 던전
총 30개.
- 심층 던전 15
- 하늘 신전 8
- 천공 대신전 7

크기별 고정 정사각 격자:
- 소형: 7×7 = 49 타일, 14개
- 중형: 9×9 = 81 타일, 9개
- 대형: 11×11 = 121 타일, 5개
- 초대형: 15×15 = 225 타일, 2개

각 던전 ID가 시드이므로 통로/방/적/엘리트/보물/문/버튼/제단/함정/보스/전리품방 배치가 고정된다. 각 던전은 개별 `gimmickId`와 고정 퍼즐 배치를 가진다.

## 함정 편집
일반 함정 6종은 `NORMAL_DUNGEON_TRAPS`에서 수정한다.
사용자 작성용 특수 함정 5개는 `ADULT_DUNGEON_TRAP_SLOTS`에 비어 있다. 신체적 나이가 18세 미만인 플레이어에게는 참조가 전달되지 않는다.

## 던전 진행도
`PlayerState.dungeonRecords`에 던전별 탐사/문/버튼/보물/보스 상태를 저장한다. 다른 던전에 들어가도 이전 진행도가 보존된다.

## 광맥
1층과 심층 모두 생성되며 심층에서 더 자주 등장한다. 현재 채굴 보상은 지역 광석/재료, 강화 결정편(후속 강화재료용), 희귀 보석 원석이다.

## 지하 전용 곤충
15종. `INSECTOID + UNDERGROUND_ONLY` 태그로 관리한다. 지하/심층 필드 조우에서는 곤충류 가중치가 가장 높게 적용된다.

## 몬스터 장비
촉수형 5종 + 신규 지하 곤충 15종을 기준으로 전용 장비 20종을 추가했다. `sourceMonsterId`로 실제 전리품 시스템에 연결된다.
