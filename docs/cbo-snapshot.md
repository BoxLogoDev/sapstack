# CBO 스냅샷 — 커스텀 코드를 오프라인으로 질문하기

현업은 ADT도 개발 권한도 없다. 그래서 관리자가 커스텀 ABAP 소스(CBO, Z/Y 오브젝트)를
주기적으로 **스냅샷 폴더**로 내보내고, sapstack Desktop 은 그 폴더만 읽어 질문에 답한다.
ADT 라이브 브리지(`docs/adt-bridge.md`)의 오프라인 보완재다. 아키텍처·계약: `bridge/abapgit-pattern.md`.

```
[관리자 PC] vsp lua export ──▶ ~/.sapstack/cbo/{SID}/ ──┬─(앱 배포 동봉)──────▶ [현업 PC] Desktop 로컬 소스
                                                        ├─(공유폴더 게시)─────▶ 앱이 기동 시 자동 임포트
                                                        └─(스냅샷 ZIP)───────▶ 설정 > "ZIP에서 가져오기"
```

## 준비물

1. Node.js 20+ 및 이 저장소 (`npm install` 1회)
2. [vsp](https://github.com/oisee/vibing-steampunk) 단일 바이너리 — 경로를 `VSP_BIN` 환경변수로 지정 (미지정 시 `~/vibing-steampunk/build/vsp.exe` → PATH 순)
3. SAP 접속 프로필 `~/.sapstack/.env` — `setup.sh`/`setup.ps1` 의 [3/5] 단계 또는 Desktop 설정 > SAP 접속이 생성
   - 시스템이 여럿이면 `~/.sapstack/.env.<SID>`(예: `.env.QS4`)에 `SAP_URL`/`SAP_CLIENT` 만 적는다 — 나머지 키는 `.env` 를 상속
4. (선택) `~/.sapstack/config.yaml` 의 `cbo:` 블록 — 시스템별 패키지 목록 (`.sapstack/config.example.yaml` 참고)

## 실행

```powershell
# 소규모 검증 (특정 패키지)
node scripts/cbo/export-cbo.mjs --system DS4 --packages "ZFI1" --dry-run   # 열거·카운트만
node scripts/cbo/export-cbo.mjs --system DS4 --packages "ZFI1"             # 실제 수집

# 전 모듈 Z/Y (최초 수집은 수 시간 — 야간 권장)
node scripts/cbo/export-cbo.mjs --system DS4

# 카탈로그/guide 만 재생성 (SAP 미접속)
node scripts/cbo/export-cbo.mjs --system DS4 --catalog-only
```

| 플래그 | 의미 |
|---|---|
| `--packages "A,B"` | config 대신 이 패턴 사용 (`Z*` = 프리픽스, `ZFI1` = 정확) |
| `--scrub mask\|report\|off` | PII 처리 (기본 mask — 주민번호·카드·사업자번호·하드코딩 비밀번호 마스킹, 계좌·연락처·이메일은 리포트) |
| `--limit N` | 테스트용 객체 수 상한 |
| `--allow-prd` | landscape_role: prd 시스템 수집 허용 (기본 거부) |

종료코드: `0` 완전 성공 · `1` 치명 실패(직전 스냅샷 자동 복원) · `2` 부분 실패(`meta/failures.json` 확인 후 재실행)

## 주기 실행 (권장: 평일 06:30)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/cbo/register-task.ps1            # 등록
powershell -ExecutionPolicy Bypass -File scripts/cbo/register-task.ps1 -PrintOnly # 명령만 출력

# export 후 공유폴더 자동 게시까지 (아래 "공유폴더 채널" 참고)
powershell -ExecutionPolicy Bypass -File scripts/cbo/register-task.ps1 -Publish unc -ShareRoot \\fileserver\sapstack\cbo
```

Desktop 앱이 켜져 있는 관리자는 앱의 자동화(예약됨 · cron)로도 같은 명령을 걸 수 있다 —
단, 앱이 실행 중일 때만 트리거된다.

## 현업 배포 — 3가지 채널

**① 앱 파일 동봉 (최초 배포)**

```powershell
powershell -ExecutionPolicy Bypass -File scripts/cbo/make-distribution.ps1 -Sid DS4 `
  [-ProvisionFile .\provision.yaml]   # 무설정 첫 실행 — docs/provisioning.md
```

`sapstack-Desktop-…-Portable-x64.exe` + `cbo/DS4/`(.git 제외) + 안내문을 하나의 ZIP 으로 만든다.
현업은 ZIP 을 풀고 exe 를 실행하면 앱이 exe 옆의 `cbo/` 를 자동 임포트·등록한다.

**② 공유폴더 게시 (지속 갱신 — 권장)**

관리자: `register-task.ps1 -Publish unc -ShareRoot \\서버\공유\cbo` 로 야간 export 후 자동 게시.
현업: `~/.sapstack/config.yaml` 에 `cbo.share_roots` 가 있으면(프로비저닝으로 시딩 가능)
앱이 기동 시 공유폴더를 스캔해 **더 새 스냅샷만 로컬로 복사**한다 — 이후 오프라인에서도 동작.
공유는 현업 계정에 **읽기 전용**으로 열고, `~/.sapstack` 자체를 공유/동기화 경로에 두지 않는다.

**③ 스냅샷 ZIP (공유 접근이 없는 사용자용 폴백)**

```powershell
powershell -ExecutionPolicy Bypass -File scripts/cbo/make-distribution.ps1 -Sid DS4 -SnapshotOnly
```

산출물 `sapstack-CBO-snapshot-DS4-*.zip` 을 전달하면 현업이 **설정 → CBO 스냅샷 →
"ZIP에서 가져오기"** 로 직접 임포트한다 (zip-slip 가드·status:failed 거부 내장).

**배포 전 점검**: ① `manifest.yaml` 의 `status: complete` 확인 ② `meta/pii-report.json` 의
리포트 항목(계좌·연락처·비밀번호 의심) 검토 ③ 커스텀 소스는 회사 자산 — 사내 반출 정책 확인.
공유폴더·ZIP 채널은 소스 유통 범위를 넓히므로 ③의 정책 확인이 특히 중요하다.

## 보안 수칙

- SAP 계정은 **조회 전용**(S_DEVELOP ACTVT 03) 권장 — vsp export 경로에는 `--read-only` 류
  안전 플래그가 적용되지 않으므로 계정 권한이 실질 경계다
- 스냅샷 폴더 접근 제한: `icacls "%USERPROFILE%\.sapstack\cbo" /inheritance:r /grant:r "%USERNAME%:(OI)(CI)F"`
- `~/.sapstack` 은 OneDrive 동기화 경로로 옮기지 말 것
- PC 반납/이관 시 `~/.sapstack/cbo` 삭제
- 스냅샷 내용은 절대 이 저장소에 커밋하지 않는다 (`check-hardcoding.sh` 게이트와도 충돌)

## 문제 해결

| 증상 | 조치 |
|---|---|
| `치명: 수집 0건 (열거 전패…)` | 사내망/VPN 미연결 상태 — 직전 스냅샷이 자동 복원되며 exit 1. 망 연결 후 재실행 |
| `SAP_URL/SAP_USER 필요` | `~/.sapstack/.env` 생성 — setup 스크립트 [3/5] |
| status: partial | `meta/failures.json` 의 reason 확인 → 재실행 (성공분은 유지) |
| 열거 0건 | SAP 계정의 S_DEVELOP 조회 권한, `vsp search "Z*"` 로 단독 확인 |
| 특정 패키지 제외하고 싶다 | config `exclude_packages` 또는 `--packages` 로 명시 목록 |
| 스냅샷이 이상하다 | 스냅샷 폴더에서 `git log` / `git diff HEAD~1` — 매 수집이 커밋으로 남는다 |
