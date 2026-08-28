# 판타지악 복구 + 타락도 안정화 패치

## 복구
- 구버전 `server.ts` 231~400의 `ADULT_EVENT_STYLE` 어휘/표현/분위기/집중 요소를 `src/data/adultNarrativeStyle.ts`로 그대로 이전했습니다.
- 최신 `adultNarrativeDirectives.ts` 및 `bodyLoadNarrativeDirectives.ts` reference 파이프라인과 함께 작동합니다.
- 구형 전역 스타일은 성인 이벤트 창이 OPEN일 때 적용되고, 상태/사건 reference는 기존 조건대로 추가됩니다.
- 현재 상태 전달은 `effectiveDesire`, `effectiveCorruption`을 우선 사용하고 기반값도 함께 전달합니다.

## 영구 타락도 안정화
- 일반/반복 상태 변화만으로 영구 타락도가 오르지 않도록 GM 지침을 강화했습니다.
- 한 로그에서 양의 영구 타락도 상승은 최대 +0.5입니다.
- 현재 영구 타락도가 높을수록 추가 상승 배율이 감소합니다.
  - 0~<2: x1.0
  - 2~<4: x0.8
  - 4~<6: x0.6
  - 6~<8: x0.4
  - 8~10: x0.25
- payload/알/기생체/외부 내용물 영향은 영구 `corruption`이 아니라 기존 `effectiveCorruption` 파생값으로만 반영됩니다.
