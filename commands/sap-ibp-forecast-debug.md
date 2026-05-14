---
name: sap-ibp-forecast-debug
description: IBP 통계 예측이 생성 안 됨/이상 — Planning Operator·Forecast Model·히스토리·마스터 매핑 진단
allowed-tools: Read, Grep, Glob
---

# /sap-ibp-forecast-debug — IBP 수요 예측 디버그

## 사용 시점
- 통계 예측 (Statistical Forecast)이 생성 안 됨
- 예측이 비현실적 (음수/0/극단치)
- 시즌성/추세가 안 잡힘
- Auto-ML 알고리즘 선택 이상

## 진단 체크리스트

### Step 1: Planning Operator 확인
1. IBP Web UI → Configuration → Planning Areas → [Your PA]
2. Operators 탭 → Forecast Operator 정의
3. 다음 확인:
   - Operator 활성?
   - Input/Output Key Figure 매핑 정확?
   - Time horizon (n weeks/months)?
   - Forecast Model 어떤 거?

### Step 2: Forecast Model 점검
1. Models → [Your Forecast Profile]
2. 다음 확인:
   - 알고리즘 적합? (Croston for intermittent, Triple ES for seasonal+trend)
   - 파라미터 (alpha, beta, gamma) 적절?
   - Horizon ≥ History/3 권장
   - Outlier detection 활성?

### Step 3: 히스토리 데이터
1. Planning View에서 History Key Figure 확인
2. 다음 확인:
   - 최소 12-24 주기 히스토리 확보?
   - 결측치 (gap) 있나? (있으면 0으로 처리됐는지 vs 매핑 실패)
   - 단위 일관성? (단가 변경, 단위 변경)

### Step 4: 마스터 매핑
1. Master Data → Product / Location / Customer 확인
2. 다음 확인:
   - Planning Object 정의된 조합 (e.g., Product × Location) 활성?
   - 매핑 깨진 객체 없음? (S/4 ↔ IBP)

### Step 5: 실행 로그
1. Application Jobs → 최근 Forecast Run
2. 다음 확인:
   - 상태: Success / Warning / Failed?
   - 실행 시간 평소 대비?
   - 처리한 Combination 수?
   - Warning 메시지 (예: "no history", "model degenerate")?

## 흔한 원인

| 원인 | 증상 | 해결 |
|---|---|---|
| History 부족 | 0 또는 NaN 예측 | 최소 12 주기 보장 |
| Outlier | 폭발적 예측 | Outlier detection 활성 |
| 매핑 오류 | 일부 조합 누락 | External Codes 재매핑 |
| Operator 비활성 | 예측 안 생성 | Operator activate |
| Time profile 불일치 | period shift | Time profile 정합성 |

## Output 형식 (Quick Advisory mode)

```
### Issue
[증상 요약]

### Root Cause
[원인]

### Check (T-code/UI + Field)
- Planning Area: ...
- Operator: ...
- ...

### Fix (Steps)
1. ...
2. ...

### Prevention
- ...

### SAP Note (if known)
- ...
```

복잡한 경우 (가설 2+ 가능) → `/sap-session-start` 호출.

## 참조
- `plugins/sap-ibp/skills/sap-ibp/SKILL.md`
- `agents/sap-ibp-consultant.md`
