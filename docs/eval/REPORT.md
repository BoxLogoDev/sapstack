# sapstack 진단 품질 eval — REPORT

> `scripts/eval-diagnosis.sh` 실행 시 이 파일에 run 결과가 자동 누적됩니다.
> 방법론: [`methodology.md`](methodology.md)

_아직 실측 run 이 기록되지 않았습니다._ baseline 을 만들려면:

```bash
export ANTHROPIC_API_KEY=sk-...
./scripts/eval-diagnosis.sh --all
```

실행하면 이 줄 아래에 `## Run <timestamp>` 섹션이 추가되고, 평균 score·root cause
full rate·tcode recall·ETHOS 위반 수와 case 별 표가 누적됩니다.
