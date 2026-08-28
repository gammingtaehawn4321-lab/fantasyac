# 판타지악 월드맵 비주얼/섹터 패치 v1.1

## 핵심 변경
- 이미지 생성 모델/외부 래스터 이미지 사용 없음.
- 지도 삽화는 React SVG 벡터로 프로젝트 내부에서 직접 렌더링.
- Hex 총량: 1,655 -> 2,483 (1.5003배, 정수 반올림 기준 1.5배).
- 지상 875 / 하늘 875 / 천공 475 / 해저 153 / 심해 105 / 지하 0.
- 지하는 개발 중 유지. 광산·협곡·싱크홀·던전 예약지의 `undergroundHookId`만 선행 배치.

## 지도 비주얼
`src/components/worldMap/HexTerrainArt.tsx`
- 초원: 풀결/초지
- 구릉: 겹치는 언덕
- 숲: 수목 군집
- 강: 연결 수로
- 도시: 건물·지붕
- 바다/해안/심해: 파도·해안선·기포
- 설원/설산: 눈결정·산봉우리
- 하늘/천공: 구름·폭풍·부유대지
- 신사: 신사 구조
- 도로는 이웃 Hex의 ROAD 태그를 읽어 실제로 이어짐.
- 포레진 강은 WATERWAY 연결을 통해 연속된 강줄기로 표시.

## 도시/부락 규모
대도시/도시는 radius 2 Hex 군집 = 19칸:
- 더 펠리스 19
- 수상도시 스카이 19
- 아쿠아리아 19
- 레무시안 19
- 데저트 알토 19
- 아벨라 19 (천공에서 날짜에 따라 도시권 전체 이동)

마을/부락은 radius 1 Hex 군집 = 7칸:
- 포레진 5개 부락
- 프로스티 공생 취락
- 스크로제 하늘 부유 부락 3개

## 독립 인카운터
`src/data/world/sectorEncounters.ts`
- 총 30개 섹터 전용 인카운터 프로필.
- 각 Hex는 고유 `encounterKey = sectorId:layer:q:r` 보유.
- 이동 시 각 Hex에서 독립 판정.
- 몬스터/사건 선택은 현재 Hex의 섹터 전용 풀을 우선 사용.
- 이동하는 아벨라의 현재 19칸은 동적으로 `scroze_abella` 섹터가 됨.

## 후속 지하용 예약 요소
지도에 시각적으로 표시되며 현재는 진입 불가:
- 광산 5
- 협곡 4
- 싱크홀 5
- 던전 예약지 7
- `undergroundHookId` 총 21개

추후 UNDERGROUND Hex를 추가할 때 이 훅 ID에 수직 링크를 연결하면 됨.

## 주요 코드 위치
- 월드 생성/경로/인카운터: `src/data/world/worldMapSystem.ts`
- 섹터별 독립 인카운터: `src/data/world/sectorEncounters.ts`
- 지도 SVG 삽화: `src/components/worldMap/HexTerrainArt.tsx`
- 지도 UI: `src/components/WorldMapModal.tsx`
- 지하 개발중 설정: `src/data/world/undergroundDevelopment.ts`
