# setup.ps1 — sapstack 5분 온보딩 (Windows PowerShell)
# setup.sh 의 Windows 등가물. 동작 동일: 사전요건 → config 생성 → SAP ADT 접속(선택) → MCP(선택) → 첫 진단 안내.
#
# 사용:
#   ./setup.ps1            # 대화형 온보딩
#   ./setup.ps1 -Check     # 비대화 환경 점검만
#   ./setup.ps1 -Help

param(
  [switch]$Check,
  [switch]$Help
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot

if ($Help) {
  Get-Content $MyInvocation.MyCommand.Path | Select-Object -Skip 1 -First 10 | ForEach-Object { $_ -replace '^# ?', '' }
  exit 0
}

function Ok($m)   { Write-Host "  [OK]   $m" }
function Warn($m) { Write-Host "  [WARN] $m" }

Write-Host "========================================"
Write-Host " sapstack 온보딩 — SAP 운영자를 위한 AI 어드바이저"
Write-Host "========================================"

# 1. 사전 요건
Write-Host ""
Write-Host "[1/5] 사전 요건 점검"
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
  $major = [int]((node -p "process.versions.node.split('.')[0]"))
  if ($major -ge 20) { Ok "node $(node -v)" } else { Warn "node $(node -v) — MCP 서버는 20+ 권장" }
} else {
  Warn "node 없음 — MCP 서버/Learning Loop 사용 시 필요 (지식 조회는 node 없이도 가능)"
}
$git = Get-Command git -ErrorAction SilentlyContinue
if ($git) { Ok "git 설치됨" } else { Warn "git 없음 (업데이트에 권장)" }

$Config = Join-Path $RepoRoot ".sapstack/config.yaml"
if (Test-Path $Config) { Ok ".sapstack/config.yaml 존재" } else { Warn ".sapstack/config.yaml 없음 (아래에서 생성)" }

if ($Check) {
  Write-Host ""
  Write-Host "환경 점검 완료. 대화형 온보딩: ./setup.ps1"
  exit 0
}

# 2. config 생성
Write-Host ""
Write-Host "[2/5] 환경 프로필 생성 (.sapstack/config.yaml)"
$skip = $false
if (Test-Path $Config) {
  $ow = Read-Host "  이미 config.yaml 이 있습니다. 덮어쓸까요? (y/N)"
  if ($ow.ToLower() -ne "y") { Write-Host "  → 기존 config 유지."; $skip = $true }
}

if (-not $skip) {
  Write-Host "  SAP 릴리스를 고르세요:"
  Write-Host "    1) ECC 6.0 EhP7   2) ECC 6.0 EhP8   3) S/4HANA 2022"
  Write-Host "    4) S/4HANA 2023   5) S/4HANA 2024   6) S/4HANA Cloud PE"
  $r = Read-Host "  번호 [4]"; if (-not $r) { $r = "4" }
  $release = switch ($r) { "1"{"ECC_6_EHP7"} "2"{"ECC_6_EHP8"} "3"{"S4HANA_2022"} "4"{"S4HANA_2023"} "5"{"S4HANA_2024"} "6"{"S4HANA_2024"} default{"S4HANA_2023"} }

  Write-Host "  배포 형태:"
  Write-Host "    1) On-premise   2) RISE   3) Cloud PE(Public)   4) Private Cloud"
  $d = Read-Host "  번호 [1]"; if (-not $d) { $d = "1" }
  $deploy = switch ($d) { "1"{"on_premise"} "2"{"rise"} "3"{"cloud_pe"} "4"{"private_cloud"} default{"on_premise"} }
  if ($r -eq "6") { $deploy = "cloud_pe" }

  $cc = Read-Host "  주 회사코드 (예: 1000) — 로컬에만 저장, 커밋 안 됨"
  if (-not $cc) { $cc = "1000" }

  $lang = Read-Host "  답변 언어 (ko/en/auto) [ko]"; if (-not $lang) { $lang = "ko" }
  if ($lang -notin @("ko","en","auto")) { $lang = "ko" }

  New-Item -ItemType Directory -Force (Join-Path $RepoRoot ".sapstack") | Out-Null
  @"
# sapstack 환경 프로필 — setup.ps1 가 생성. 검증: ./scripts/validate-config.sh
# ⚠ 실 회사코드 포함 — .gitignore 로 커밋 차단됨. 공유 금지.
system:
  release: $release
  deployment: $deploy
organization:
  primary_company_code: "$cc"
preferences:
  language: $lang
  verbosity: standard
  only_confirmed_notes: true
"@ | Set-Content -Path $Config -Encoding UTF8
  Ok "생성됨: .sapstack/config.yaml ($release / $deploy / $lang)"

  $bash = Get-Command bash -ErrorAction SilentlyContinue
  if ($bash) {
    $out = & bash ./scripts/validate-config.sh 2>&1 | Out-String
    if ($out -match "❌") { Warn "config 검증 오류 — 확인: bash ./scripts/validate-config.sh" }
    else { Ok "config 검증 통과 (필수 항목 OK, 선택 항목은 나중에 보강 가능)" }
  }
}

# 3. SAP ADT 접속 (선택) — AI가 CBO 소스를 직접 읽는 연동 (읽기 전용)
Write-Host ""
Write-Host "[3/5] SAP 시스템 접속 (선택) — AI가 CBO 소스를 직접 읽는 ADT 연동 (읽기 전용)"
$sap = Read-Host "  SAP ADT 접속을 설정할까요? (y/N)"
if ($sap.ToLower() -eq "y") {
# Desktop 앱(설정 > SAP 접속)과 vsp 브리지가 같은 파일을 읽는다 — 위치 통일
  $SapstackHome = Join-Path $HOME ".sapstack"
  $EnvFile = Join-Path $SapstackHome ".env"
  $skipEnv = $false
  if (Test-Path $EnvFile) {
    $eo = Read-Host "  이미 ~/.sapstack/.env 가 있습니다. 덮어쓸까요? (y/N)"
    if ($eo.ToLower() -ne "y") { Write-Host "  → 기존 .env 유지."; $skipEnv = $true }
  }

  if (-not $skipEnv) {
    Write-Host "  ADT URL — SAP GUI: SMICM > Goto > Services 의 HTTP(S) 포트 (예: https://sapdev:44300)"
    $SapUrl = Read-Host "  ADT URL"
    $SapClient = Read-Host "  클라이언트 [100]"; if (-not $SapClient) { $SapClient = "100" }
    $SapUser = Read-Host "  사용자명"
    $sec = Read-Host "  비밀번호 (입력 숨김)" -AsSecureString
    $SapPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
    $SapLang = Read-Host "  언어 (KO/EN) [KO]"; if (-not $SapLang) { $SapLang = "KO" }

    New-Item -ItemType Directory -Force $SapstackHome | Out-Null
    @"
# sapstack SAP 접속 프로필 — setup.ps1 가 생성. Desktop 앱(설정 > SAP 접속)과 공유.
# ⚠ 비밀번호 평문 저장 — 조회 전용 계정 사용 권장, 파일 공유 금지.
SAP_URL=$SapUrl
SAP_USER=$SapUser
SAP_PASSWORD=$SapPassword
SAP_CLIENT=$SapClient
SAP_LANGUAGE=$SapLang
SAP_INSECURE=true
SAP_READ_ONLY=true
"@ | Set-Content -Path $EnvFile -Encoding UTF8
    Ok "생성됨: ~/.sapstack/.env"

    # 접속 테스트 — ADT discovery 엔드포인트 (Windows 10+ 은 curl.exe 내장)
    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    if ($curl) {
      $code = & curl.exe -k -s -o NUL -w "%{http_code}" --connect-timeout 8 `
        -u "${SapUser}:${SapPassword}" "$SapUrl/sap/bc/adt/discovery?sap-client=$SapClient" 2>$null
      switch ($code) {
        "200" { Ok "ADT 접속 성공 (discovery 200)" }
        "401" { Write-Host "  [ERR]  인증 실패 (401) — 계정/비밀번호/클라이언트 확인 후 .env 수정" }
        "403" { Warn "권한 부족 (403) — 계정에 S_DEVELOP 조회(ACTVT 03) 권한 필요" }
        "000" { Write-Host "  [ERR]  서버 연결 불가 — URL/포트/방화벽/DNS 확인 (IP 직접 입력도 가능)" }
        default { Warn "예상외 응답 (HTTP $code) — SICF 에서 /sap/bc/adt 서비스 활성화 확인" }
      }
    } else {
      Warn "curl.exe 없음 — 접속 테스트 건너뜀"
    }
  }

  # vsp(ADT-MCP 브리지) 연동 — 있으면 런처 생성, 없으면 안내
  $vspCmd = Get-Command vsp.exe -ErrorAction SilentlyContinue
  $VspBin = if ($vspCmd) { $vspCmd.Source } else { Read-Host "  vsp.exe 경로 (없으면 Enter — 나중에 설치)" }
  if ($VspBin -and (Test-Path $VspBin)) {
    $Launcher = Join-Path $RepoRoot ".sapstack\vsp-mcp.cmd"
    New-Item -ItemType Directory -Force (Join-Path $RepoRoot ".sapstack") | Out-Null
    @"
@echo off
rem vsp MCP 런처 — setup.ps1 가 생성. %USERPROFILE%\.sapstack\.env 의 접속 프로필을 읽는다.
cd /d "%USERPROFILE%\.sapstack"
"$VspBin" --read-only --allowed-packages Z*
"@ | Set-Content -Path $Launcher -Encoding ASCII
    Ok "생성됨: .sapstack\vsp-mcp.cmd (읽기 전용, Z* 패키지 한정)"
    Write-Host "  Claude Code 등록 (아래 한 줄 실행):"
    Write-Host "    claude mcp add sap-adt --scope user -- cmd /c `"$Launcher`""
  } else {
    Write-Host "  → vsp 미설치. ADT-MCP 브리지: https://github.com/oisee/vibing-steampunk (Releases 에서 단일 바이너리)"
    Write-Host "    설치 후 ./setup.ps1 재실행 또는 docs/adt-bridge.md 참고"
  }
} else {
  Write-Host "  건너뜀. 나중에: ./setup.ps1 재실행 (기존 config 는 유지 선택 가능)"
}

# 4. MCP (선택)
Write-Host ""
Write-Host "[4/5] MCP 서버 (Evidence Loop / 세션 저장에 사용 — 선택)"
$mi = Read-Host "  Claude Desktop 에 sapstack MCP 를 설치할까요? (y/N)"
if ($mi.ToLower() -eq "y") {
  $ps1 = Join-Path $RepoRoot "scripts/install-claude-desktop.ps1"
  if (Test-Path $ps1) { & $ps1 } else { Warn "install 스크립트 없음 — 수동: docs/mcp-server.md" }
} else {
  Write-Host "  건너뜀. 나중에: ./scripts/install-claude-desktop.ps1 (또는 docs/mcp-server.md)"
}

# 5. 첫 진단
Write-Host ""
Write-Host "[5/5] 첫 진단 — 5분 안에"
Write-Host "========================================"
Write-Host " 준비 완료! 이제 이렇게 물어보세요 (Claude Code / Desktop 에서):"
Write-Host ""
Write-Host '   "F110 돌렸는데 벤더 하나만 No valid payment method 떠요"'
Write-Host ""
Write-Host " 자세한 첫걸음: docs/quickstart-5min.md"
Write-Host " 전체 진단 여정(Golden Path): docs/workflow.md"
Write-Host "========================================"
