# 판타지악 v2.0.5 — CC0 장비 픽셀아트 연결 패치

## 적용 범위

- 입력 자산: `496_RPG_icons.zip`
- 원본: **496 pixel art icons for medieval/fantasy RPG**
- 원작자: **Henrique Lazarini (7Soul1)**
- 라이선스: **CC0 / Public Domain**
- 원본 아이콘: 496개 / 34×34 / RGBA PNG

## 판타지악 연결

현재 장비 DB 총 424종 중:

- 기존 장비 카탈로그 400종: CC0 픽셀아트 연결
- 생활·이동 장비 4종: CC0 픽셀아트 연결
- 지하 몬스터 장비 20종: 기존 몬스터 전용 SVG 유지
- 삽화 누락: 0종

### 자산 경로

- 원본 보존: `public/assets/equipment/cc0/source/*.png`
- 판타지악 매핑본: `public/assets/equipment/cc0/mapped/*.png`
- 매핑 메타데이터: `public/assets/equipment/cc0/manifest.json`
- 코드 매핑: `src/data/equipment/equipmentIllustrations.ts`

## 매핑 방식

- 주무기는 장비명에서 검/단도/활/창/지팡이/케인/마도구/격투/투척 계열을 판정해 원본 무기 아이콘을 우선 사용한다.
- 방어구는 머리/상의/하의/신발/장갑 슬롯 실루엣을 우선한다.
- 액세서리는 반지/목걸이/메달 계열 원본을 슬롯별로 사용한다.
- 장비명의 화염/냉기/폭풍/신성/암흑/독/비전/자연/대지 계열 키워드를 판정해 같은 CC0 팩의 테마 아이콘을 조합한다.
- 일반/엘리트/레전더리 등급에 따라 같은 CC0 팩의 재료·보석 아이콘을 작은 보조 표식으로 사용한다.
- 매핑본은 최근접 보간으로만 확대하며 AI 이미지 생성은 사용하지 않는다.
- 기존 `illustrationUrl`이 이미 있는 장비는 `??=` 처리로 덮어쓰지 않는다. 따라서 지하 몬스터 장비의 고유 SVG가 우선된다.

## UI 연결

`EquipmentDefinition.illustrationUrl`을 기존 UI가 이미 읽고 있으므로 다음 화면에 자동 반영된다.

- 장비 탭
- 인벤토리 장비 목록/썸네일
- 장비 상세
- 아이템 상세

## 검증

- 장비 DB: 424종
- CC0 매핑: 404/404
- 지하 전용 SVG 유지: 20/20
- 삽화 누락: 0
- CC0 원본 보존: 496/496
- 원본 파일 SHA-256 동일성: PASS
- 매핑 PNG: 404개
- 매핑 PNG 해상도: 전부 256×256
- 매핑 PNG 모드: 전부 RGBA
- 매핑 PNG SHA-256: 404/404 고유
- 모든 `illustrationUrl` 실제 파일 존재: PASS
- 장비 DB + 매핑 TypeScript 컴파일: PASS
