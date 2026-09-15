# 관리자 프로비저닝 — 현업 무설정 첫 실행

`provision.yaml` 파일 하나를 배포 패키지에 동봉하면, 현업 사용자는 압축을 풀고
exe 를 실행하는 것만으로 **어떤 설정 화면도 없이** 바로 질문할 수 있다.
LLM 연결(+API 키), SAP 환경 프로파일, 현업 모드(ui_mode), CBO 공유 스캔 루트가
첫 실행 시 자동 시딩된다.

템플릿: [`scripts/cbo/provision.template.yaml`](../scripts/cbo/provision.template.yaml)

## 동작 방식

- 앱이 기동 초입(온보딩 게이트 이전)에 다음 순서로 파일을 찾는다:
  1. `SAPSTACK_PROVISION_FILE` 환경변수 (테스트/GPO 배포용 — 폴백 없음)
  2. **exe 옆의 `provision.yaml`** (배포 ZIP 표준 위치)
  3. `%USERPROFILE%\.sapstack\provision.yaml`
- 적용 결과는 `~/.sapstack/provision-applied.json` 마커에 기록된다(import-once).
  같은 version 은 다시 적용하지 않으므로 사용자가 설정에서 바꾼 값이 부팅마다
  덮어써지지 않는다. 실패한 섹션만 다음 부팅에 재시도한다.
- **키 교체(로테이션)**: 새 키를 넣고 `version` 숫자를 올려 재배포하면
  기존 연결(슬러그 `provisioned`)이 갱신된다.
- 시딩된 연결의 API 키는 머신 바운드 암호화 저장소(`credentials.enc`)로 이동하고,
  `provision.yaml` 의 `apiKey` 값은 `"<imported>"` 로 스크럽된다
  (읽기 전용 매체면 경고 로그 후 통과).
- 파싱/적용 실패 시 오류 다이얼로그를 띄운 뒤 **일반 온보딩으로 폴백**한다 —
  프로비저닝 문제로 앱이 기동 불능이 되는 일은 없다.

## LLM 공급 3가지 (llm.kind)

| kind | 언제 | 비고 |
|---|---|---|
| `api_key` | 회사 API 키 직결 또는 사내 게이트웨이(`baseUrl`) | **예산 상한 걸린 전용 키만** 사용. Anthropic 콘솔에서 워크스페이스 분리 + 지출 한도 설정 권장 |
| `local` | 폐쇄망 — 동봉 llama-server + GGUF 모델팩 | `modelFile` 을 ZIP 에 함께 동봉(`make-distribution.ps1 -ModelFile`). 품질은 클라우드 모델보다 낮음 |

> 참고: 연결이 전무한 첫 실행에서 GGUF 모델팩이 발견되면 provision.yaml 의 `llm` 섹션이
> 없어도 로컬 연결이 **자동 시딩**된다(제로 셋팅 폴백). provision.yaml 은 여전히
> SAP 환경·현업 모드·공유 경로 시딩을 위해 권장된다.
| `environment` | GPO 로 `ANTHROPIC_API_KEY`/`ANTHROPIC_BASE_URL` 환경변수를 배포하는 조직 | 파일에 키가 실리지 않음 — 가장 안전 |

## 배포 절차 (하드 룰 포함)

1. `provision.template.yaml` 을 복사해 값 채우기 (해외 법인 영어 배포는 `scripts/cbo/examples/provision-lsmtron-usa.yaml` 참조 — `language: en`, `country: US`)
2. ZIP 생성:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/cbo/make-distribution.ps1 `
     -Sid DS4 -ProvisionFile .\provision.yaml [-ModelFile .\qwen3-8b.gguf] [-Language en]
   ```
   `-Language en` 은 영문 `README.txt` 와 ZIP 접미 `-en` 을 쓴다 (영어 운영 문서: `docs/en/us-pilot-runbook.md`)
3. **[필수] 스모크 테스트 1회**: 깨끗한 PC(또는 아래 샌드박스)에서 ZIP 을 풀고
   exe 실행 → 설정 화면 없이 채팅 도달 → 질문 1개 성공 확인.
   키 무효는 프로비저닝 시점에 검증할 수 없고 첫 채팅에서야 드러난다.
4. 배포. 키가 든 ZIP 은 사내 승인된 채널로만 전달하고 배포 후 원본 삭제.

## Microsoft(Entra) 로그인 (auth, 선택)

`auth:` 블록이 있으면 앱은 온보딩 이전에 **회사 Microsoft 계정 로그인 게이트**를 띄운다.
접근 허용은 Entra(Enterprise App 할당·보안 그룹)가 결정하고, 로그인 신원은 세션 헤더
`createdBy` 에 남는다. 값은 `~/.sapstack/config.yaml` 의 `auth` 로 시딩되며 환경 프로파일
재저장에도 보존된다.

```yaml
auth:
  required: true
  tenantId: <테넌트 GUID>      # common/organizations 불가
  clientId: <Application (client) ID>
  offlineGraceDays: 14         # 0~90
  # domainHint: example.com
```

- 블록이 **없으면** 로그인 기능이 꺼진다(기존 동작). 블록이 있는데 GUID 가 잘못되면 프로비저닝이
  실패하고 앱은 **fail closed**(로그인 불가·관리자 문의) 로 멈춘다 — 오탈자에 주의.
- 앱 등록·그룹·B2B 게스트·회수 절차와 스모크 항목은 [entra-signin.md](entra-signin.md).

## 검증 샌드박스 (개발자용)

```powershell
$env:SAPSTACK_DESKTOP_CONFIG_DIR = "$env:TEMP\prov-cfg"   # config.json 격리
$env:SAPSTACK_WORKSPACE = "$env:TEMP\prov-home"           # ~/.sapstack 격리
$env:SAPSTACK_PROVISION_FILE = "C:\path\to\provision.yaml"
# 이후 dev 앱 실행 → 온보딩·SAP 환경 폼이 뜨지 않아야 정상
```

> 주의: **자격증명 저장소(`~/.sapstack-desktop/credentials.enc`)는 격리되지 않는다**
> (머신 바운드 고정 경로). 샌드박스 테스트가 남긴 더미 키는 실제 연결이 없어 무해하지만,
> 테스트에는 실제 키를 넣지 말 것.

## 문제 해결

| 증상 | 원인/조치 |
|---|---|
| 첫 실행에 온보딩이 그대로 뜸 | provision.yaml 미발견(위치 확인) 또는 파싱 실패(오류 다이얼로그·로그 확인) |
| "apiKey 가 비었거나 이미 임포트되었습니다" | version 을 올렸는데 키를 새로 안 넣음 — 새 키 기입 후 재배포 |
| 첫 채팅에서 Invalid API key | 키 무효/만료 — 새 키 + version 증가 재배포 |
| 로컬 모델이 안 뜸 | GGUF 복사 확인(`~/.sapstack/models/`), 모델 로딩에 수십 초 소요(503 정상) |
| 사용자가 연결을 지웠음 | version 을 올려 재배포하면 재생성됨 |

관련 문서: [cbo-snapshot.md](cbo-snapshot.md)(스냅샷 운영), [entra-signin.md](entra-signin.md)(Microsoft 로그인), [desktop-install.md](desktop-install.md)
