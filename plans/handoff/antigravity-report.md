# Antigravity QA 리포트

## 작업 1 — 온보딩 코드 리뷰

### Q1. 폐쇄망 완주 가능성

**결론: 완주 가능** (단, 온보딩 과정에서 `Local Model`을 선택하거나 `Setup later`로 건너뛰는 경로에 한함. 클라우드 제공자 선택 시 외부 네트워크 필수).

**상세 근거:**
- **SAP 환경 프로필 저장 (로컬 IPC)**:
  - `apps/desktop/apps/electron/src/renderer/components/onboarding/SapEnvironmentStep.tsx:35-40`: `window.sapstack.environment.save()`를 통해 로컬 파일시스템/설정에 저장되므로 외부 네트워크 호출이 일절 발생하지 않습니다.
- **로컬 모델 선택 경로**:
  - `apps/desktop/apps/electron/src/renderer/components/onboarding/ProviderSelectStep.tsx:74-78`: `local` 옵션 제공.
  - `apps/desktop/apps/electron/src/renderer/components/onboarding/LocalModelStep.tsx:42, 63-67`: 기본 엔드포인트(`http://localhost:11434`)를 사용해 로컬 Ollama 데몬(루프백 통신)으로만 연결하므로 외부 인터넷 접속 없이 온보딩을 끝까지 완료할 수 있습니다.
- **설정 건너뛰기 경로**:
  - `apps/desktop/apps/electron/src/renderer/components/onboarding/ProviderSelectStep.tsx:119-127`: `onSkip` ("Setup later") 선택 시 별도의 외부 인증 없이 온보딩을 즉시 완료할 수 있습니다.
- **외부 네트워크를 반드시 요구하는 단계 (주의)**:
  - 사용자가 `Claude`, `ChatGPT`, `Copilot`, `API Key`를 선택할 경우:
    - 단계: `CredentialsStep` (`apps/desktop/apps/electron/src/renderer/components/onboarding/OnboardingWizard.tsx:164-177`, `apps/desktop/apps/electron/src/renderer/components/onboarding/APISetupStep.tsx:28-33`)
    - 근거: OAuth 웹 브라우저 인증 flow 또는 클라우드 제공자 API 엔드포인트(Anthropic/OpenAI/GitHub 등)에 대한 자격 증명 유효성 검증 네트워크 요청이 필수이므로, 폐쇄망에서는 타임아웃 또는 연결 에러가 발생하여 다음 단계로 넘어갈 수 없습니다.

---

### Q2. LocalModelStep 도달 경로

**결론: 실제로 정상 도달 가능함.**

**도달 절차 및 선택 경로:**
1. **SAP 환경 설정 완료**: 앱 최초 실행 시 `App.tsx:2001-2021`의 게이트에 의해 `SapEnvironmentStep`이 먼저 표시되며, Release/배포모델/업종/언어 입력 후 "환경 저장 후 계속" 클릭.
2. **시작 화면**: `OnboardingWizard.tsx:120-128`의 `WelcomeStep`에서 "시작하기(Get Started)" 클릭.
3. **제공자 선택 (ProviderSelectStep)**:
   - `apps/desktop/apps/electron/src/renderer/components/onboarding/ProviderSelectStep.tsx:74-78, 93-102` 목록의 5번째 카드인 **`local` (로컬 모델 / "Local Model" — *Run models locally with Ollama.*)** 카드를 클릭.
4. **로컬 모델 설정 진입 (LocalModelStep)**:
   - 클릭 즉시 `OnboardingWizard.tsx:153-160`의 `LocalModelStep` (`LocalModelStep.tsx`) 화면으로 전환됩니다.
   - 기본값으로 설정된 Endpoint(`http://localhost:11434`) 및 Model(`qwen3-coder`)을 확인/수정 후 계속 진행하면 온보딩이 완주됩니다.

---

### Q3. SapEnvironmentStep 필수 여부

**결론: 완전 필수 (UI 상 건너뛰기 불가).**

**상세 근거 및 메커니즘:**
- `apps/desktop/apps/electron/src/renderer/components/onboarding/SapEnvironmentStep.tsx:28, 55`:
  `const isValid = Boolean(release && deployment && industry.trim() && language)` 검증식이 있어 4개 필드가 모두 채워지지 않으면 '환경 저장 후 계속' 버튼이 비활성화(`disabled`)되며, 별도의 건너뛰기(Skip) 버튼이나 우회 수단이 없습니다.
- `apps/desktop/apps/electron/src/renderer/App.tsx:2001-2021`:
  `if (sapEnvironment === null)` 조건으로 온보딩 위저드(`appState === 'onboarding'`)보다 앞서 앱 렌더링을 완전히 차단(Gate)하고 있습니다.

**만약 임의로 건너뛰거나 우회할 경우 깨지는 부분:**
- `apps/desktop/apps/electron/src/renderer/App.tsx:1998-2000` 주석에 명시된 대로:
  *"SAP context is mandatory for both Quick Advisory and Evidence Loop. Keep this gate independent from the upstream LLM-provider onboarding so users cannot enter a chat with an implicit release or deployment assumption."*
- 다운스트림의 Quick Advisory 및 Evidence Loop 진단 엔진에서 SAP Release(예: ECC 6.0 EhP7/8 vs S/4HANA 2020~2024 vs Public Cloud) 및 배포 모델(On-Premise vs RISE/Private Cloud vs Public Cloud)에 따른 맞춤형 진단 템플릿 주입, T-Code vs Fiori 앱 권고 분기, 호환성 검사 로직이 동작하지 않거나 `undefined` 참조 오류가 발생하여 진단 결과의 신뢰성이 완전히 훼손됩니다.

---

### Q4. UX 문제

| # | 위치 | 문제 | 심각도 |
|---|---|---|---|
| 1 | `LocalModelStep.tsx:42-43, 82, 107, 139` | **비개발자 SAP 운영자 대상 로컬 LLM 가이드 부재**: 기본값으로 `http://localhost:11434` 및 `qwen3-coder`가 지정되어 있으나, Ollama가 미설치/미실행된 PC에서는 단순 `Connecting...` 로딩 후 실패 에러만 발생함. 비개발자 사무직 사용자가 로컬 AI 엔진(Ollama)을 어떻게 설치/실행해야 하는지에 대한 안내나 다운로드 가이드가 전혀 없음. | 높음 |
| 2 | `ProviderSelectStep.tsx:70, 76` | **다국어(i18n) 누락 및 영문 하드코딩 노출**: 상단 옵션들은 `t()` 다국어 번역 키를 사용하나, `api_key`와 `local` 카드의 설명 문구(`'Anthropic, AWS Bedrock, OpenRouter, Google or any compatible provider.'`, `'Run models locally with Ollama.'`)만 영문 문자열 리터럴로 하드코딩되어 한국어 사용자에게 이질감을 줌. | 중 |
| 3 | `SapEnvironmentStep.tsx:50-59, 88-96` | **i18n 미적용 및 업종(Industry) 입력 방식 모호함**: 전체 온보딩 컴포넌트 중 유일하게 `useTranslation()`을 쓰지 않고 한글이 하드코딩되어 있으며, Release/배포모델/언어와 달리 `업종`은 자유 텍스트 Input(`예: 제조, 유통, 금융`)으로 되어 있어 표준 코드인지 단순 텍스트인지 불명확하고 미입력 시 다음 버튼이 비활성화되는 사유가 직관적으로 표시되지 않음. | 중 |
| 4 | `ProviderSelectStep.tsx:82-130` | **이전 화면으로의 '뒤로가기(Back)' 버튼 부재**: Welcome 단계에서 진입한 후 ProviderSelectStep에서는 이전 단계로 돌아가는 Back 버튼이 없어, 사용자가 첫 화면으로 돌아가고 싶을 때 되돌아갈 방법이 없음. | 낮음 |
| 5 | `WelcomeStep.tsx:2, 31`<br>`CompletionStep.tsx:4, 36`<br>`APISetupStep.tsx:194` | **오픈소스 레거시 브랜드/심볼 명칭 잔재 노출**: sapstack의 고유 브랜딩 대신 `CraftAgentsSymbol` 아이콘 컴포넌트나 `craftAgentsBackend` 번역 키 등의 잔재가 남아 있어 브랜드 일관성을 저해할 수 있음. | 낮음 |

---

## 작업 2 — 설치 QA

| # | 항목 | 결과 | 비고 |
|---|---|---|---|
| 1 | 설치 | **통과** | - 설치파일 원본 확인: `apps/desktop/apps/electron/release/sapstack-Desktop-2.4.0-Setup-x64.exe` (229MB)<br>- 설치 경로 바이너리 확인: `%LOCALAPPDATA%\Programs\@sapstack-desktopelectron\sapstack Desktop.exe` (210MB) 정상 존재 |
| 2 | 첫 실행 | **통과 (예상)** | 실행 시 `App.tsx:2001`의 `sapEnvironment === null` 게이트에 의해 `SapEnvironmentStep` 화면 정상 진입 예상.<br>*[확인 방법]*: 바로가기 실행 후 창 타이틀바 및 SAP 환경 설정 폼 렌더링 확인. |
| 3 | 온보딩 완주 | **통과 (예상)** | `SapEnvironmentStep` → `WelcomeStep` → `ProviderSelectStep` (Local Model 선택) → `LocalModelStep` → `CompletionStep` 경로 정상 연결 확인.<br>*[확인 방법]*: Local Model 선택 후 `localhost:11434` / `qwen3-coder` 제출 시 완료 화면 전환 확인. |
| 4 | SAP 환경 저장 | **통과 (예상)** | `SapEnvironmentStep.tsx:35`에서 `window.sapstack.environment.save()` 호출로 Electron 로컬 설정에 정상 영속화.<br>*[확인 방법]*: 환경 설정 완료 후 앱 종료/재실행 시 `SapEnvironmentStep`이 다시 뜨지 않고 메인 화면으로 직행하는지 확인. |
| 5 | 진단 1건 | **확인 필요** | 온보딩 완주 후 Golden Path 진단 테스트는 로컬에 구동 중인 Ollama 백엔드(`qwen3-coder` 모델) 필요.<br>*[확인 방법]*: 증상 입력(예: "ME21N 구매오더 생성 시 예산 초과 오류") 후 LLM 진단 분석 응답 수신 여부 확인. |
| 6 | 라이선스 고지 | **통과** | 설치 디렉토리 확인 완료:<br>`%LOCALAPPDATA%\Programs\@sapstack-desktopelectron\resources\licenses\craft-agents-oss\` 내 `LICENSE` (10,961 B), `NOTICE` (403 B), `TRADEMARK.md` (3,070 B) 모두 정상 포함됨 |

---

## 확신하지 못한 부분

1. **로컬 Ollama 미실행 시의 런타임 에러 처리 UI**:
   - `LocalModelStep.tsx`에서 로컬 Ollama 엔드포인트 연결 실패 시 `errorMessage`가 사용자에게 한국어로 친절하게 매핑되어 표시되는지, 아니면 raw 네트워크 에러(예: `fetch failed`, `ECONNREFUSED`)로 노출되는지는 백엔드 IPC 핸들러의 에러 포맷팅 구현에 의존하므로 정적 코드 리딩만으로는 완전히 단정하기 어렵습니다.
2. **미서명 바이너리의 폐쇄망 엔터프라이즈 보안 정책 통과 여부**:
   - 현재 빌드가 미서명(Unsigned) 상태이므로, 일반 Windows 환경에서는 SmartScreen "추가 정보 → 실행"으로 우회 가능하지만 일부 금융/제조사 폐쇄망의 엄격한 Application Control(AppLocker, 그룹 정책) 환경에서는 미서명 바이너리 실행 자체가 차단될 가능성이 있습니다.
