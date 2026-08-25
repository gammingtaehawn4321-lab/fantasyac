# 판타지악 UI 2.0 패치 요약

## 1. 하단 1차 메뉴
행동 입력창 위에 독립 버튼 5개가 항상 표시됩니다.

- 상태
- 가방
- 성장
- 모험
- 동료

한 버튼을 누르면 해당 버튼의 서브메뉴만 위쪽에 펼쳐집니다. 다른 버튼을 누르면 이전 서브메뉴는 자동으로 닫힙니다.

### 상태
- 기본: 기존 캐릭터 정보창
- 장비: 캐릭터 장비창
- 내부상태: 새 내부 상태 전용창
- 스탯 상세

### 가방
- 인벤토리
- 야영지 보관함: 현재는 야영지 창으로 연결되며 보관함 시설을 이용합니다.

### 성장
- 재능
- 전직
- 생활직업
- 스킬트리: 다음 개편을 위해 자리만 확보, 현재 비활성

### 모험
- 퀘스트
- 야영지

### 동료
중간 서브메뉴 없이 동료 관리창을 바로 엽니다.

## 2. 기본 상태창
- 캐릭터 초상화/기본 정보 유지
- 내부 payload 카드 제거: 내부상태 전용창으로 분리
- 성욕은 effectiveDesire를 우선 표시하고, 보정이 있을 때 기초 desire도 작게 표시
- 타락도는 effectiveCorruption을 우선 표시하고, 보정이 있을 때 영구 corruption도 작게 표시
- 미약/중독 카드 추가

## 3. 내부 상태 전용창
신규 파일: `src/components/InternalStatusModal.tsx`

- 3개 구획에 큰 이미지 프레임 제공
- 내부 코드명 COMPARTMENT_1/2/3을 화면에 노출하지 않음
- 설정 label이 비어도 `미지정 부위`만 표시
- 구획별 현재량 / 최대량 / 한국어 부하 단계 표시
- payload 종류별 수치 표시
- 0인 payload는 기본 숨김, `0값 표시` 버튼으로 확인 가능
- 임신 상태 카드
- 기생체 상태 카드
- 플레이어 자신의 소변 욕구/방광 상태는 외부 URINE payload와 분리된 별도 카드

### 부하 단계 UI 라벨
- EMPTY: 없음
- TRACE: 미량
- LOW: 적음
- MEDIUM: 보통
- HIGH: 많음
- SATURATED: 포화

### payload UI 라벨
- STANDARD_FLUID: 일반 내용물
- INSECTOID_SECRETION: 곤충형 분비물
- URINE: 외부 소변
- EGG: 알
- PARASITE: 기생체
- OTHER: 기타

## 4. 상태 이미지 설정
`src/data/bodySystemConfig.ts`

현재 기본 표시명:
- COMPARTMENT_1: 미지정 부위 1
- COMPARTMENT_2: 미지정 부위 2
- COMPARTMENT_3: 미지정 부위 3

실제 표시명을 쓰려면 `label`만 수정하세요.
이미지는 `imageSrc`에 프로젝트 내부 경로를 입력하면 됩니다.

예시:
```ts
COMPARTMENT_1: {
  label: '원하는 표시명',
  imageSrc: '/assets/status/body/example.png',
  imageAlt: '상태 이미지',
},
```

내부 코드 ID 자체는 변경하지 마세요.

## 5. 이번 패치에서 보존한 것
성인 시스템 1.0의 계산/시간/payload/기생/임신/파생 수치 로직은 UI 개편 때문에 변경하지 않았습니다.
