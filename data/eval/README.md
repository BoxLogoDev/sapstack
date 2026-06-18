# data/eval — 진단 품질 Gold Set

진단 품질을 측정하기 위한 정답셋. 방법론은 [`../../docs/eval/methodology.md`](../../docs/eval/methodology.md).

## 파일

- [`gold-set.yaml`](gold-set.yaml) — 케이스 정답셋
- 스키마: [`../../schemas/eval-gold-set.schema.yaml`](../../schemas/eval-gold-set.schema.yaml)

## 케이스 한 건의 구조

```yaml
- id: eval-fi-f110-no-payment-method   # eval-<module>-<slug>, 유일
  symptom_ref: sym-f110-no-payment-method  # symptom-index.yaml 참조 (증상 본문 단일출처)
  module: FI
  difficulty: easy                     # easy | medium | hard
  env: { release: both, deployment: on-prem, country: KR }
  prompt: "F110 돌렸는데 벤더 하나만 'No valid payment method' 떠요."  # 에이전트 입력
  expected:
    primary_root_cause: "..."          # symptom-index typical_causes[0] 에서 파생
    must_tcodes: [XK03, FBZP]          # 각 T-code 는 tcodes.yaml 에 실재해야 함
    must_checks: ["...", "..."]        # 답변이 다뤄야 할 검증 포인트
    sap_note: null                     # 확정된 Note 있으면 id, 없으면 null
  ethos_flags: [no_hardcode]           # 채점 시 적극 감점할 ETHOS 위반
```

## 기여 가이드 (케이스 추가)

현재 **21건**(대표 모듈 시드). 목표 **30~50건**. 추가 절차:

1. `data/symptom-index.yaml` 에서 ground-truth 가 명확한 증상을 고른다
   (`typical_causes` 첫 항목이 단일·확실한 것).
2. 그 `symptom_ref` 로 케이스를 만들고, `primary_root_cause` 는 **추측하지 말고**
   typical_causes 에서 파생한다 (ETHOS ① Ground-truth).
3. `must_tcodes` 는 반드시 `data/tcodes.yaml` 에 실재하는 코드만. 없으면 먼저 등록.
4. 무결성 검증:

   ```bash
   ./scripts/check-eval-goldset.sh --strict
   ```

   symptom_ref·must_tcode 참조 오류, id 중복을 잡아준다 (API 불필요).
5. (선택) 실제 채점으로 케이스가 합리적인지 확인:

   ```bash
   ./scripts/eval-diagnosis.sh --case <새 id>
   ```

## 원칙

- **단일출처**: 증상 텍스트는 symptom-index 에만. gold-set 은 참조 + 채점 정답만.
- **과소가 과잉보다 낫다**: 애매한 케이스는 넣지 않는다. 확실한 것만.
- **회사 식별자 금지**: 실제 회사코드/G/L 계정/벤더번호를 prompt·expected 에 넣지 않는다.
