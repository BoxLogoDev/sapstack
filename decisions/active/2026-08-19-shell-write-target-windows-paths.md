# 셸 리다이렉트 경로 추출은 백슬래시를 허용한다 (Windows 경로 절단 수리)

**날짜** 2026-08-19 · **범위** `packages/shared/src/agent/mode-manager.ts` `extractBashWriteTarget`

## 배경

이 브랜치(`feat/desktop-release-and-knowledge`)는 **2026-08-16 이후 CI 20회 연속 실패,
성공 0건**이었다. 릴리스를 준비하며 원인을 팠다.

실패는 typecheck 가 아니라 테스트 1건이었다 — 4,803 통과 / 1 실패:

```
(fail) shouldAllowToolInMode - Bash plans folder exception
       > should allow Codex-style zsh write to plans folder
```

## 근본 원인

Codex 가 쓰는 서브셸 패턴에서 쓰기 대상 경로를 뽑는 정규식이 **문자 클래스에서
백슬래시를 전부 제외**하고 있었다:

```
/(?:\/bin\/)?(?:zsh|bash|sh)\s+(?:-\w+\s+)*["'].*?>\s*([^\s'"\\]+)/
```

의도는 이스케이프 문자에서 멈추는 것이었으나, **Windows 경로 구분자와 충돌**한다.
실측:

| 입력 경로                     | 추출 결과                      |
| ----------------------------- | ------------------------------ |
| `/Users/t/plans/my-plan.md`   | `/Users/t/plans/my-plan.md` ✅ |
| `C:\Users\t\plans\my-plan.md` | **`C:`** ❌                    |

경로가 `C:` 로 잘리니 `isPathWithinDirectory(targetPath, plansFolderPath)` 가 거짓이 되고,
safe 모드에서 plans 폴더 쓰기 예외가 적용되지 않는다.

## 결정

백슬래시를 경로 문자로 허용하되, **이스케이프된 따옴표(`\"`, `\'`)에서만 멈추도록**
negative lookahead 로 좁힌다.

```
((?:\\(?!["'])|[^\s'"\\])+)
```

## 근거 (네 케이스 실측)

| 케이스                           | 결과                             |
| -------------------------------- | -------------------------------- |
| POSIX 경로                       | `/Users/t/plans/my-plan.md` ✅   |
| Windows 경로                     | `C:\Users\t\plans\my-plan.md` ✅ |
| 이스케이프 따옴표 뒤 잔여 문자열 | `/tmp/a.md` 에서 정지 ✅         |
| `/dev/null`                      | 추출 후 상위 분기가 제외 ✅      |

`bun test packages/shared/tests/mode-manager.test.ts` → **444 pass / 0 fail**
(수정 전 443/1).

## 왜 오래 안 잡혔나

- **개발자가 Windows 에서 이 테스트를 돌리면 실패하지만, CI 도 ubuntu 인데 실패했다** —
  테스트가 `plansFolderPath` 를 OS 경로로 만들기 때문이다. 즉 어디서 돌려도 실패했고,
  그냥 **20번 동안 아무도 로그를 끝까지 안 봤다**
- `gh run view --log-failed` 가 요약(`1 fail`)만 주고 실패 테스트명을 안 준다.
  실패를 특정하려면 로컬에서 같은 명령(`bun test`)을 재현해야 했다

## 뒤집는 조건

- 경로 추출을 정규식이 아니라 셸 파서로 대체하면 이 규칙 자체가 사라진다
  (`shell-quote` 류 도입 시 재검토)
