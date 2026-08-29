# make-distribution.ps1 — 현업 배포용 ZIP 생성 (포터블 exe + CBO 스냅샷 동봉)
# 사용:
#   powershell -ExecutionPolicy Bypass -File scripts/cbo/make-distribution.ps1 -Sid DS4 [-OutDir .\dist-cbo]
param(
  [string]$Sid = "DS4",
  [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))
$Snapshot = Join-Path $HOME ".sapstack\cbo\$Sid"
$Portable = Get-ChildItem (Join-Path $RepoRoot "apps\desktop\apps\electron\release") -Filter "sapstack-Desktop-*-Portable-x64.exe" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $OutDir) { $OutDir = Join-Path $RepoRoot "dist-cbo" }

# ── 배포 전 점검 ──
if (-not (Test-Path (Join-Path $Snapshot "manifest.yaml"))) { Write-Host "중단: 스냅샷 없음 — 먼저 export 실행 (docs/cbo-snapshot.md)"; exit 1 }
if (-not $Portable) { Write-Host "중단: 포터블 exe 없음 — apps/desktop 에서 dist:win 빌드 필요"; exit 1 }
$manifest = Get-Content (Join-Path $Snapshot "manifest.yaml") -Raw
if ($manifest -match "status:\s*failed") { Write-Host "중단: 스냅샷 status=failed"; exit 1 }
if ($manifest -match "status:\s*partial") { Write-Host "경고: status=partial — meta/failures.json 확인 권장" }
Write-Host "배포 전 점검: meta/pii-report.json 의 리포트 항목을 검토했습니까? (계좌·연락처·비밀번호 의심)"

# ── 스테이징 ──
$exportDate = if ($manifest -match "exported_at:\s*\x22?([0-9]{4}-[0-9]{2}-[0-9]{2})") { $Matches[1] } else { Get-Date -Format yyyy-MM-dd }
$Stage = Join-Path $env:TEMP "sapstack-dist-$Sid"
if (Test-Path $Stage) { Remove-Item $Stage -Recurse -Force -Confirm:$false }
New-Item -ItemType Directory -Force "$Stage\cbo\$Sid" | Out-Null

Copy-Item $Portable.FullName $Stage
# .git 제외 복사 (로컬 이력은 관리자 PC 전용)
robocopy $Snapshot "$Stage\cbo\$Sid" /E /XD .git /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { Write-Host "중단: robocopy 실패 ($LASTEXITCODE)"; exit 1 }

@"
sapstack Desktop + CBO 스냅샷 ($Sid, $exportDate 기준)

1. 이 폴더 전체를 원하는 위치에 두고 sapstack-Desktop-*-Portable-x64.exe 를 실행하세요.
2. 첫 실행 시 exe 옆의 cbo\ 폴더가 자동으로 등록됩니다 (설정 > CBO 스냅샷에서 확인).
3. 채팅에서 이렇게 물어보세요: "ZFI0171이 뭐 하는 프로그램이에요?"
4. 답변의 "스냅샷 기준일"이 오래됐으면 관리자에게 갱신을 요청하세요.
"@ | Set-Content "$Stage\읽어보세요.txt" -Encoding UTF8

# ── ZIP ──
New-Item -ItemType Directory -Force $OutDir | Out-Null
$ZipPath = Join-Path $OutDir "sapstack-Desktop-CBO-$Sid-$exportDate.zip"
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force -Confirm:$false }
Compress-Archive -Path "$Stage\*" -DestinationPath $ZipPath
Remove-Item $Stage -Recurse -Force -Confirm:$false

$SizeMB = [math]::Round((Get-Item $ZipPath).Length / 1MB)
Write-Host "생성 완료: $ZipPath (${SizeMB}MB)"
