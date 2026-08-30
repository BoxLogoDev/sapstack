# make-distribution.ps1 — 현업 배포용 ZIP 생성 (포터블 exe + CBO 스냅샷 동봉)
# 사용:
#   powershell -ExecutionPolicy Bypass -File scripts/cbo/make-distribution.ps1 -Sid DS4 [-OutDir .\dist-cbo]
#     [-ProvisionFile .\provision.yaml]   # 관리자 프로비저닝 동봉 → 현업 무설정 첫 실행 (docs/provisioning.md)
#     [-ModelFile .\models\qwen3-8b.gguf] # 로컬 LLM 모델팩 동봉 (provision.yaml 의 llm.kind: local 과 짝)
#     [-SnapshotOnly]                     # exe 없이 스냅샷만 ZIP — 갱신 배포용 (앱의 "ZIP에서 가져오기"로 임포트)
param(
  [string]$Sid = "DS4",
  [string]$OutDir = "",
  [string]$ProvisionFile = "",
  [string]$ModelFile = "",
  [switch]$SnapshotOnly
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))
$Snapshot = Join-Path $HOME ".sapstack\cbo\$Sid"
$Portable = Get-ChildItem (Join-Path $RepoRoot "apps\desktop\apps\electron\release") -Filter "sapstack-Desktop-*-Portable-x64.exe" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $OutDir) { $OutDir = Join-Path $RepoRoot "dist-cbo" }

# ── 배포 전 점검 ──
if (-not (Test-Path (Join-Path $Snapshot "manifest.yaml"))) { Write-Host "중단: 스냅샷 없음 — 먼저 export 실행 (docs/cbo-snapshot.md)"; exit 1 }
if (-not $SnapshotOnly -and -not $Portable) { Write-Host "중단: 포터블 exe 없음 — apps/desktop 에서 dist:win 빌드 필요"; exit 1 }
$manifest = Get-Content (Join-Path $Snapshot "manifest.yaml") -Raw
if ($manifest -match "status:\s*failed") { Write-Host "중단: 스냅샷 status=failed"; exit 1 }
if ($manifest -match "status:\s*partial") { Write-Host "경고: status=partial — meta/failures.json 확인 권장" }
Write-Host "배포 전 점검: meta/pii-report.json 의 리포트 항목을 검토했습니까? (계좌·연락처·비밀번호 의심)"

if ($ProvisionFile) {
  if (-not (Test-Path $ProvisionFile)) { Write-Host "중단: ProvisionFile 없음 — $ProvisionFile"; exit 1 }
  $prov = Get-Content $ProvisionFile -Raw
  if ($prov -notmatch "(?m)^\s*version\s*:" -or $prov -notmatch "(?m)^\s*llm\s*:") {
    Write-Host "중단: provision.yaml 에 version:/llm: 이 없습니다 (scripts/cbo/provision.template.yaml 참조)"; exit 1
  }
  if ($prov -match "(?m)^\s*apiKey\s*:\s*(?!\x22?<imported>)\S") {
    Write-Host "=================================================================="
    Write-Host "경고: ZIP 에 API 키가 평문으로 동봉됩니다."
    Write-Host "  - 반드시 예산 상한이 걸린 전용 키 또는 게이트웨이 키만 사용하세요."
    Write-Host "  - 앱이 첫 실행 시 키를 머신 바운드 저장소로 옮기고 파일에서 스크럽합니다."
    Write-Host "  - 배포 전 이 ZIP 으로 스모크 테스트 1회가 런북 필수 절차입니다."
    Write-Host "=================================================================="
  }
}
if ($ModelFile -and -not (Test-Path $ModelFile)) { Write-Host "중단: ModelFile 없음 — $ModelFile"; exit 1 }

# ── 스테이징 ──
$exportDate = if ($manifest -match "exported_at:\s*\x22?([0-9]{4}-[0-9]{2}-[0-9]{2})") { $Matches[1] } else { Get-Date -Format yyyy-MM-dd }
$Stage = Join-Path $env:TEMP "sapstack-dist-$Sid"
if (Test-Path $Stage) { Remove-Item $Stage -Recurse -Force -Confirm:$false }
New-Item -ItemType Directory -Force "$Stage\cbo\$Sid" | Out-Null

# .git 제외 복사 (로컬 이력은 관리자 PC 전용)
robocopy $Snapshot "$Stage\cbo\$Sid" /E /XD .git /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { Write-Host "중단: robocopy 실패 ($LASTEXITCODE)"; exit 1 }

if ($SnapshotOnly) {
  # 스냅샷만 ZIP — 설정 > CBO 스냅샷 > "ZIP에서 가져오기" 또는 공유폴더 게시용
  New-Item -ItemType Directory -Force $OutDir | Out-Null
  $ZipPath = Join-Path $OutDir "sapstack-CBO-snapshot-$Sid-$exportDate.zip"
  if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force -Confirm:$false }
  Compress-Archive -Path "$Stage\cbo" -DestinationPath $ZipPath
  Remove-Item $Stage -Recurse -Force -Confirm:$false
  $SizeMB = [math]::Round((Get-Item $ZipPath).Length / 1MB)
  Write-Host "생성 완료(스냅샷만): $ZipPath (${SizeMB}MB)"
  exit 0
}

Copy-Item $Portable.FullName $Stage
if ($ProvisionFile) { Copy-Item $ProvisionFile (Join-Path $Stage "provision.yaml") }
if ($ModelFile) {
  New-Item -ItemType Directory -Force "$Stage\models" | Out-Null
  Copy-Item $ModelFile "$Stage\models\"
}

$provisionLine = if ($ProvisionFile) { "이 폴더에는 관리자 설정(provision.yaml)이 들어 있어 별도 설정 없이 바로 질문할 수 있습니다." } else { "첫 실행 시 화면 안내에 따라 설정을 완료하세요." }
@"
sapstack Desktop + CBO 스냅샷 ($Sid, $exportDate 기준)

1. 이 폴더 전체를 원하는 위치에 두고 sapstack-Desktop-*-Portable-x64.exe 를 실행하세요.
2. $provisionLine
3. 첫 실행 시 exe 옆의 cbo\ 폴더가 자동으로 등록됩니다 (설정 > CBO 스냅샷에서 확인).
4. 채팅에서 이렇게 물어보세요: "ZFI0171이 뭐 하는 프로그램이에요?"
5. 답변의 "스냅샷 기준일"이 오래됐으면 관리자에게 갱신을 요청하세요.
"@ | Set-Content "$Stage\읽어보세요.txt" -Encoding UTF8

# ── ZIP ──
New-Item -ItemType Directory -Force $OutDir | Out-Null
$ZipPath = Join-Path $OutDir "sapstack-Desktop-CBO-$Sid-$exportDate.zip"
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force -Confirm:$false }
Compress-Archive -Path "$Stage\*" -DestinationPath $ZipPath
Remove-Item $Stage -Recurse -Force -Confirm:$false

$SizeMB = [math]::Round((Get-Item $ZipPath).Length / 1MB)
Write-Host "생성 완료: $ZipPath (${SizeMB}MB)"
