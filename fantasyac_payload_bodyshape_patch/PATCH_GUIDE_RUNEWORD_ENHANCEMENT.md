# 판타지악 v1.0 — 장비 강화 / 룬워드 / 무희 상태 연동 패치

## 적용 범위

기존 400종 장비 카탈로그를 유지하면서 모든 장비에 +20 강화와 8종 룬워드 시스템을 추가했다. 기존 세트 옵션, 숨은 장비 공명, 스킬 전용 장신구, 명중/회피, CTB, COST 시스템과 동시에 작동한다.

## 강화 시스템

- 최대 강화: +20
- 확정 강화
- 비용: 루피
- +5/+10/+15/+20에서 추가 마일스톤 배율 및 룬 슬롯 해금
- 일반적인 기초 전투 수치는 +20에서 x2.55
- 치명/회피 등 확률형 수치와 COST 계열은 별도 완만한 성장 계수를 사용해 과도한 폭증 방지
- 구 세이브에는 `equipmentEnhancements: {}`가 자동 생성되어 +0 상태로 호환

## 룬워드

8종: 독 / 화염 / 광명 / 암흑 / 용 / 빙결 / 폭풍 / 비전

장비 한 개의 룬 슬롯 레벨은 +5=1, +10=2, +15=3, +20=4이다. 전신 장비의 동일 키워드 레벨을 합산하며 5/12/24/40에서 누적 임계 능력을 연다.

룬워드는 단순 스탯 보너스가 아니라 다음 런타임에 직접 연결된다.
- 상태이상 위력/지속시간
- Action Delay 변경
- Timeline 행동 게이지 전진/후퇴
- COST 감소/회복 및 HP 대체 지불
- 초과 회복 보호막
- 치명상 1회 방지
- 속성 연쇄 피해
- 저HP 각성
- 다속성 조합식

## 무희 성인 상태 연동 장비

무희 추천 장비 59종 중 48종에 조건형 성인 상태 장비 기믹을 배정했다. 약 81%이며, 나머지 11종은 일반 무희 장비로 남겨 빌드를 강제하지 않는다.

5개 계열:
1. `DANCER_ADULT_CORRUPTION_FLOW` — 현재 타락도에 비례해 공격력/마법 공격력/속도 증가.
2. `DANCER_ADULT_FLUID_RESONANCE` — 세 신체 구획의 추적 fluid 총합 90/150/220 임계에서 COST/속도/치명 강화. `dancer_spinning_dance`의 피해/COST/Action Delay/행동 게이지 효과도 조건에 따라 변형.
3. `DANCER_ADULT_PREGNANCY_TEMPO` — 임신 활성 시 최대 HP, 물리/마법 방어, 행동 속도 상승. 무희 스킬 Action Delay도 감소.
4. `DANCER_ADULT_DESIRE_RHYTHM` — 현재 성욕 50/80 임계에서 COST 회복과 치명 보너스, 고단계에서 무희 스킬 COST 추가 감소.
5. `DANCER_ADULT_LEWDNESS_PERFORMANCE` — 현재 음란도에 비례해 상태이상 적중과 회피 상승.

### 연령 안전장치

위 다섯 장비 계열은 **플레이어의 physicalAge가 18 이상일 때만** BattleActor로 전달된다. 18 미만에서는 adultEquipmentContext 자체를 만들지 않고 `DANCER_ADULT_*` trait도 제거한다. 런타임 검증에서 17세 캐릭터의 관련 컨텍스트/trait가 모두 차단됨을 확인했다.

## UI

`EquipmentTab`에 강화/룬워드 UI를 추가했다.
- 강화 버튼 및 비용
- 강화 배율
- 4개 마일스톤 룬 슬롯
- 룬 선택
- 전신 룬 레벨 요약
- 임계 능력 목록

`CombatScreen`의 장비 상세에도 +강화 수치와 장착 룬이 표시된다.

## 주요 수정 파일

- `src/data/equipment/equipmentTypes.ts`
- `src/data/equipment/runewordSystem.ts` (신규)
- `src/data/equipment/equipmentDatabase.ts`
- `src/data/equipment/index.ts`
- `src/types.ts`
- `src/gameEngine.ts`
- `src/combat/combatTypes.ts`
- `src/combat/battleEngine.ts`
- `src/combat/battleActions.ts`
- `src/combat/equipmentRuntime.ts`
- `src/components/EquipmentTab.tsx`
- `src/components/CombatScreen.tsx`
- `src/App.tsx`

## 이미지

이번 패치에서는 PNG/장비 삽화/전투 이펙트를 새로 만들지 않았다. 이미지 및 이펙트 제작은 다음 패치 단계로 분리한다.
