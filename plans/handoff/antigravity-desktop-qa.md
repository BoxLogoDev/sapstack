# Antigravity 지시서 — 데스크톱 설치 QA + 온보딩 리뷰 (report-only)

> 이 문서를 Antigravity 창에 붙여넣으세요.
> 저장소: `C:\Users\chois\orca\projects\boxlogo\sapstack`
>
> ⚠️ **이전 지시서(`antigravity-surfaces.md`, extension+web)는 보류합니다.**
> 이 문서가 현재 유효한 유일한 지시서입니다.

---

## 당신의 역할 — 검증자 (코드를 고치지 않습니다)

sapstack Desktop(Electron 앱)이 **미서명 파일럿 배포를 앞두고 있습니다.**
당신은 제3자 시선으로 이 앱의 온보딩과 설치 경험을 검증하고 리포트합니다.

**토큰 예산이 제한적입니다.** 그래서 범위를 일부러 좁게 잘랐습니다:

- 넓게 탐색하지 말고 아래 명시된 파일만 읽으세요
- 코드를 수정하지 마세요 — 발견만 기록합니다
- 쓰기가 허용된 파일은 정확히 하나입니다: `plans/handoff/antigravity-report.md`

4개 AI가 같은 저장소에서 병렬 작업 중입니다. 다른 디렉토리는 각자 소유자가
있으므로 절대 편집하지 마세요.

---

## 배경 (30초 요약)

- sapstack = SAP 운영자·컨설턴트용 진단 도구. **라이브 SAP에 접속하지 않고**
  운영자가 붙여넣은 증거로 진단하는 구조
- 주 고객은 **폐쇄망(망분리)** 환경 — 금융·공공·제조. 인터넷이 없다
- 따라서 이 앱의 성패는: **인터넷 없이 온보딩을 완주하고 진단까지 갈 수 있는가**

---

## 작업 1 — 온보딩 코드 리뷰 (지금 바로)

읽을 파일 (이것만, 순서대로):

```
apps/desktop/apps/electron/src/renderer/components/onboarding/OnboardingWizard.tsx
apps/desktop/apps/electron/src/renderer/components/onboarding/WelcomeStep.tsx
apps/desktop/apps/electron/src/renderer/components/onboarding/ProviderSelectStep.tsx
apps/desktop/apps/electron/src/renderer/components/onboarding/LocalModelStep.tsx
apps/desktop/apps/electron/src/renderer/components/onboarding/APISetupStep.tsx
apps/desktop/apps/electron/src/renderer/components/onboarding/SapEnvironmentStep.tsx
apps/desktop/apps/electron/src/renderer/components/onboarding/CompletionStep.tsx
```

답할 질문 (이 4개가 전부입니다):

1. **폐쇄망 완주 가능성** — 인터넷이 전혀 없는 PC에서 이 온보딩을 끝까지
   진행할 수 있는가? 외부 네트워크를 반드시 요구하는 단계가 있다면 어디인가?
   (단계 이름 + 파일 + 근거 코드 줄)
2. **LocalModelStep 우회 경로** — 클라우드 API 대신 로컬 모델
   (기본값 `http://localhost:11434`)을 선택하는 경로가 온보딩 흐름에서
   실제로 도달 가능한가? ProviderSelectStep 에서 어떤 선택을 해야 하는가?
3. **SapEnvironmentStep 검증** — SAP 환경 입력(release/deployment/industry)이
   필수인가 건너뛸 수 있는가? 건너뛰면 이후 무엇이 깨지는가?
4. **UX 문제 3~5건** — SAP 운영자(개발자 아님, 한국 사무직) 관점에서
   막히거나 혼란스러울 지점. 각각 파일·줄과 함께.

## 작업 2 — 설치 QA (설치파일이 준비되면 별도 신호를 받습니다)

Claude 가 미서명 설치파일(`sapstack-Desktop-*.exe`)을 만들면 경로를 알려줍니다.
그때 아래 체크리스트를 실행하고 결과를 리포트에 추가하세요:

| #   | 항목          | 통과 기준                                                                    |
| --- | ------------- | ---------------------------------------------------------------------------- |
| 1   | 설치          | per-user 설치 완료, 에러 없음 (SmartScreen 경고는 예상됨 — "추가 정보→실행") |
| 2   | 첫 실행       | 앱이 뜨고 온보딩 시작                                                        |
| 3   | 온보딩 완주   | Local Model 경로로 끝까지                                                    |
| 4   | SAP 환경 저장 | 입력 후 재시작해도 유지                                                      |
| 5   | 진단 1건      | Golden Path 에서 증상 입력 → 응답 수신                                       |
| 6   | 라이선스 고지 | 설치 폴더 `resources/licenses/craft-agents-oss/` 에 LICENSE·NOTICE 존재      |

각 항목: 통과/실패 + 실패 시 **재현 절차**(스크린샷 있으면 첨부 경로).

---

## 보고 형식 — `plans/handoff/antigravity-report.md` 에 작성

```markdown
# Antigravity QA 리포트

## 작업 1 — 온보딩 코드 리뷰

### Q1. 폐쇄망 완주 가능성

(결론 한 줄 + 근거: 파일:줄)

### Q2. LocalModelStep 도달 경로

### Q3. SapEnvironmentStep 필수 여부

### Q4. UX 문제

| # | 위치 | 문제 | 심각도(높/중/낮) |

## 작업 2 — 설치 QA (신호 수신 후)

| # | 항목 | 결과 | 비고 |

## 확신하지 못한 부분

(정직하게. 비어 있으면 오히려 의심합니다)
```

## 금지

1. ⛔ `plans/handoff/antigravity-report.md` 외 모든 파일 편집
2. ⛔ 위 목록 밖의 대량 파일 탐색 (토큰 예산)
3. ⛔ 문제의 수정 시도 — 발견과 기록만
4. ⛔ 추측을 사실처럼 쓰기 — 코드 근거(파일:줄) 없는 주장은 "추정"으로 표시
