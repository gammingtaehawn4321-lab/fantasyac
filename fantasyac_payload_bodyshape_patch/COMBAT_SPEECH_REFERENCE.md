# 판타지악 v1.0 — 전투 카드 말풍선 참조표

실제 말풍선 문장은 `src/data/combatSpeechReferences.ts` 한 곳에서 관리한다. UI나 전투 엔진에는 문장을 직접 쓰지 않는다.

## 참조 조건

- `BATTLE_START` — 전투 시작
- `ACTION_HP_HIGH` — 행동 시작 시 HP 70% 이상
- `ACTION_HP_MID` — 행동 시작 시 HP 35~69%
- `ACTION_HP_LOW` — 행동 시작 시 HP 15~34%
- `ACTION_HP_CRITICAL` — 행동 시작 시 HP 15% 미만
- `ATTACK_SUCCESS` — 공격 적중
- `ATTACK_CRITICAL` — 치명타 적중
- `ATTACK_MISS` — 명중 부족으로 빗나감
- `TARGET_EVADED` — 상대의 회피 때문에 공격 실패
- `HIT_RECEIVED` — 일반 피격
- `HEAVY_HIT_RECEIVED` — 한 번에 최대 HP 15% 이상 손실
- `EVADE_SUCCESS` — 자신의 회피로 공격 회피
- `DEFEND_SUCCESS` — 방어/보호막이 켜진 상태에서 공격을 받아냄
- `DEFEND` — 방어 행동 사용
- `SUPPORT` — 회복/버프/지원 행동 사용
- `ITEM_USE` — 아이템 사용
- `ENEMY_DEFEATED` — 자신이 공격한 대상이 전투 불능
- `ALLY_DEFEATED` — 같은 편 카드가 전투 불능
- `VICTORY` / `DEFEAT` — 전투 종료
- `ESCAPE_ATTEMPT` / `ESCAPE_SUCCESS` / `ESCAPE_FAIL` — 도주 관련

## 기본 참조 우선순위

1. 무희 성인 변형 참조 — 사용자가 문구를 채운 경우만 사용
2. 여성 고성욕 변형 참조 — 사용자가 문구를 채운 경우만 사용
3. 현재 활성 장비 세트 참조
4. 성별 + 전직 참조
5. 기본 참조
6. 종족 참조는 최종 문장 뒤에 짧게 추가

세트가 둘 이상 동시에 활성화되어 있으면 가장 높은 피스 단계(4 > 3 > 2)의 세트 대사를 우선한다.

## 참조 키 형식 예시

- `COMBAT.GENERIC.ATTACK_SUCCESS`
- `COMBAT.CLASS.WARRIOR.FEMALE.ACTION_HP_LOW`
- `COMBAT.RACE.ELF.EVADE_SUCCESS`
- `COMBAT.SET.IRON_BASTION.DEFEND_SUCCESS`
- `COMBAT.USER.FEMALE_HIGH_DESIRE.ATTACK_SUCCESS`
- `COMBAT.USER.DANCER_ADULT.ACTION_HP_CRITICAL`

실제 카드 말풍선 DOM의 `title`에는 사용된 참조 키가 들어가므로 개발 중 어떤 문구가 선택됐는지 바로 확인할 수 있다.

## 사용자 작성용 빈 영역

다음 영역은 의도적으로 **전부 빈 문자열**이다.

### 여성 고성욕 변형

`FEMALE_HIGH_DESIRE_REFERENCES`

조건: 성인 상태 컨텍스트가 존재하고 `effectiveDesire >= 70`, 성별이 여성일 때.

빈 값을 유지하면 자동으로 일반 성별/전직/종족 대사로 폴백한다.

### 무희 성인 상태 변형

`DANCER_ADULT_VARIANT_REFERENCES`

현재 모든 참조 칸이 비어 있다. 사용자가 문구를 입력하면 무희의 성인 상태 변형 대사로 일반 대사보다 먼저 적용된다.

### 무희 세트 4종

아래 세트의 `references`는 모든 조건이 빈 문자열이다.

- `SILK_MOON` — 월견비단의 춤
- `PETAL_TEMPEST` — 화람폭풍의 선율
- `MIRAGE_LOTUS` — 신기루연화의 환무
- `CELESTIAL_DANCE` — 천상무도의 궤적

빈 상태에서는 정상 무희 대사로 폴백한다.

## 정상 대사가 작성된 세트

- 철벽수호대의 맹세
- 잿불군단의 전열
- 심연거병의 외피
- 천붕파쇄자의 유산
- 질풍추적자의 발자국
- 월하사냥꾼의 침묵
- 뇌익독수리의 비상
- 별비명사수의 관측
- 밤여우의 잔영
- 독낫사냥꾼의 흔적
- 혈무신기루의 장막
- 공허암살자의 무흔
- 새벽사제의 기도
- 성역수호자의 서약
- 천익성가대의 화음
- 최후성역의 빛
- 룬학자의 해석
- 빙점점성가의 관측
- 혜성대마도의 낙광
- 근원직조자의 공식

## UI 동작

- 전투 시작: 각 카드가 `BATTLE_START` 참조를 한 번 표시
- 행동 시작: 행동자의 현재 HP 구간 참조 표시
- 공격 결과 확정: 공격자에게 성공/치명/빗나감/상대 회피 참조 표시
- 대상: 피격/강피격/회피/방어 성공 참조 표시
- 지원/방어/아이템/도주도 각각 별도 참조
- 승패 시 전투 화면이 사라지기 전에 종료 대사를 확인할 수 있도록 짧은 표시 시간을 둔다.
