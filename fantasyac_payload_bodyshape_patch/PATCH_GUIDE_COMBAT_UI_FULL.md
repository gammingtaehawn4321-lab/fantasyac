# 판타지악 전투 시스템 + 전투 UI 전면 개편

기준: `fantasyac_combat_ctb_cost_element_patch.zip` 이후 전투 전면 개편본

## 이번 패치 범위

이번 패치는 외부 PNG/삽화를 새로 생성하지 않는다. 기존 `portraitUrl`이 있으면 카드 삽화로 사용하고, 없으면 아이콘 폴백을 사용한다. 전투 이펙트는 현재 DOM/CSS 기반 절차형 프리셋으로 동작하며, 나중에 이미지 자산을 추가해도 `effectId` 연결 구조를 그대로 사용할 수 있다.

### 1. 전투 진행을 Actor 1행동 단위 CTB로 변경

기존 엔진은 플레이어 행동 뒤 동료/적 행동을 연속 계산할 수 있어 UI에서 개별 행동 애니메이션을 보여주기 어려웠다.

이제 전투는 다음 순서로 진행한다.

1. CTB에서 다음 행동자 결정
2. 해당 Actor의 턴 시작 처리
3. 수동 Actor면 입력 대기 / AI Actor면 행동 계획 생성
4. 카드 모션 WINDUP
5. 행동 1회만 확정
6. IMPACT/피격 모션
7. 턴 종료 + Action Delay
8. Timeline 재계산
9. 다음 Actor

`processActorSkillTurn()`과 `processAutomaticTurn()`은 정확히 한 Actor의 한 행동만 처리한다.

### 2. 상단 CTB Timeline

- 기본 12개의 예상 행동 표시
- 같은 Actor가 여러 번 나타날 수 있음
- NOW 표시
- 현재 선택 중인 스킬/아이템의 Action Delay를 반영한 실시간 미리보기
- 빠른 행동은 다음 행동이 앞으로, 느린 행동은 뒤로 이동

### 3. 전투 화면 진영 배치

- 화면 상단 절반: 적군 진영
- 화면 하단 절반: 아군 진영
- 중앙 경계와 가장 가까운 적: 우두머리/엘리트/첫 적, 큰 카드
- 중앙 경계와 가장 가까운 아군: 메인 플레이어, 큰 카드
- 적 우두머리 뒤: 일반 적 최대 4
- 플레이어 뒤: 활성 동료 최대 4

### 4. 카드 기반 전투 UI

각 카드에는 현재 상태를 간결하게 표시한다.

- HP
- COST
- 현재 행동자 표시
- 상태이상
- 대상 선택 표시
- 기존 portraitUrl이 있으면 삽화 사용

평상시 카드를 누르면 상세 패널을 열어 다음 정보를 볼 수 있다.

- HP / COST / 속도
- 공격·방어 관련 능력치
- 치명타 확률 / 치명타 피해
- 상태효과
- 장착/사용 가능 스킬과 효과
- 특성
- 장비 요약

### 5. 하단 행동 메뉴

수동 조작 Actor 차례에는 기본적으로 다음 4개 명령만 표시한다.

- 공격
- 방어
- 아이템
- 도주

공격/방어/아이템을 누르면 기본 4버튼은 사라지고 해당 하위 목록이 나타난다. 뒤로가기로 기본 메뉴로 복귀한다.

스킬 목록 표시 정보:

- 이름
- 속성
- 위력 또는 효과형
- COST
- 현재/기본 쿨다운
- Action Delay
- 설명

COST 부족 또는 쿨다운 중인 스킬은 선택할 수 없다.

### 6. 대상 선택

스킬/아이템을 선택하면 TARGET SELECT 상태로 전환된다.

- 적 대상 스킬: 살아있는 적 카드
- 자기 대상: 시전자
- 아군 대상: 살아있는 아군
- 전체 대상: 엔진 targetType에 따라 자동 처리
- 아이템: 살아있는 대상 카드 선택

아이템은 자가 사용과 투척 사용을 구분한다.

### 7. 카드 모션

이미지 파일 없이 카드 자체의 모션으로 행동 종류를 구분한다.

- MELEE: 중앙/대상 방향 돌격 → 충돌 → 복귀
- RANGED: 뒤로 물러남 → 발사 → 복귀
- MAGIC: 제자리 진동/시전
- SUPPORT: 지원 오라
- DEFEND: 방어 자세
- ITEM_SELF: 자가 사용 모션
- ITEM_THROW: 대상 방향 투척 모션
- ESCAPE: 전장에서 멀어지는 모션
- HIT: 피격 카드는 자신의 진영 바깥 방향으로 반동

### 8. 스킬별 이펙트 프리셋

모든 스킬은 기존 `effectId`를 시각 식별 키로 유지한다.

`combatPresentation.ts`에서 `effectId + skillId` 기반 해시로 다음을 결정한다.

- 7종 기본 형태 변형
- 회전 각도
- 보조 회전
- 입자 수
- 입자 확산
- 속성 색상

따라서 PNG가 없어도 스킬별로 동일한 이펙트가 반복 재현되며, 속성에 따라 색을 공유/변형할 수 있다.

### 9. 동료 AI / 수동 조작

동료 상세 패널에서 수동 조작 ON/OFF를 전환할 수 있다.

AI 모드 전술:

- 공격적
- 방어적
- 지원
- 자원 절약

`RESOURCE_SAVING`은 실제 AI 로직에 추가되어 기본 공격 및 낮은 COST 행동을 우선한다.

동료 수동 설정은 `CompanionData.manualCombatControl`에 저장된다.

### 10. 장착 전투 스킬 필드

플레이어와 동료에 `equippedCombatSkillIds?: string[]`을 추가했다.

- 필드가 있으면 해당 스킬만 전투 UI에 장착 스킬로 노출
- 구 세이브처럼 필드가 없으면 기존 `learnedSkills` 전체를 사용

따라서 기존 저장 데이터는 깨지지 않는다.

## 주요 변경 파일

- `src/components/CombatScreen.tsx`
- `src/combat/battleEngine.ts`
- `src/combat/combatTypes.ts`
- `src/combat/combatPresentation.ts` (신규)
- `src/App.tsx`
- `src/types.ts`

이전 CTB/COST/속성 패치에서 변경한 다음 파일은 그대로 기반으로 사용한다.

- `src/combat/turnManager.ts`
- `src/combat/battleActions.ts`
- `src/combat/damageCalculator.ts`
- `src/combat/statusEffectEngine.ts`
- `src/data/combatConfig.ts`
- `src/data/skills/index.ts`
- 장비 관련 데이터/계산 파일

## 검증 결과

### 실제 런타임형 검증

132개 단언 통과.

검사 항목:

- 전투 시작 시 현재 Actor 존재
- 12행동 CTB Timeline 생성
- 수동 스킬 1회가 정확히 CTB 행동 1회만 소비
- Action Delay 0.75가 1.50보다 빠른 다음 행동을 예측
- 아이템 행동이 정확히 1행동만 소비
- 소비 아이템 결과가 App 인벤토리 동기화용으로 반환
- 자가 회복 아이템 실제 HP 회복
- 빠른 보스가 플레이어보다 먼저 행동 가능
- AI 행동 계획 생성
- AI 행동이 정확히 1행동만 처리
- 액티브 스킬 40개 전부 메뉴 분류 보유
- 액티브 스킬 40개 전부 카드 모션 보유
- 액티브 스킬 40개 전부 기존 effectId 유지

### 정적 검사

- `src`의 TypeScript/TSX 전체 구문 오류: 0
- 핵심 combat 모듈 TypeScript 검사: 통과
- `CombatScreen.tsx` 타입 검사(외부 React/UI 패키지 선언 스텁 사용): 통과

### 빌드 환경 참고

현재 작업 환경에서는 npm 의존성 설치가 제한되어 `node_modules`를 준비하지 못했기 때문에 실제 `vite build`까지는 실행하지 못했다. 소스 자체에 대한 위 정적/런타임 검증은 완료했다.

## 다음 확장 지점

현재 구조에서 이후 추가하기 쉬운 항목:

- 실제 PNG/애니메이션 자산을 effectId에 연결
- 모바일 해상도별 카드 크기 세부 튜닝
- 스킬 장착 UI
- 장비/패시브 기반 행동 게이지 직접 조작
- 행동 당기기/밀기 스킬
- 속성 상성표가 확정될 경우 속성 저항 엔진 위에 상성 계수 추가
