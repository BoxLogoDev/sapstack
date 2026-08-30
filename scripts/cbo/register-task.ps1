# register-task.ps1 — CBO 스냅샷 주기 수집을 Windows 작업 스케줄러에 등록
# 사용:
#   powershell -ExecutionPolicy Bypass -File scripts/cbo/register-task.ps1 [-Sid DS4] [-At 06:30] [-PrintOnly]
#     [-Publish unc -ShareRoot \\fileserver\sapstack\cbo]  # export 후 공유폴더 게시 (현업 앱이 기동 시 자동 임포트)
param(
  [string]$Sid = "DS4",
  [string]$At = "06:30",
  [ValidateSet("", "unc")]
  [string]$Publish = "",
  [string]$ShareRoot = "",
  [switch]$PrintOnly
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))
$TaskName = "sapstack-cbo-export-$Sid"
$SnapshotDir = Join-Path $HOME ".sapstack\cbo\$Sid"
$LogDir = Join-Path $SnapshotDir "meta"
$NodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $NodeExe) { Write-Host "node 를 찾을 수 없습니다 (Node.js 20+ 필요)"; exit 1 }
if ($Publish -eq "unc" -and -not $ShareRoot) { Write-Host "-Publish unc 에는 -ShareRoot \\서버\공유\cbo 가 필요합니다"; exit 1 }

$Cmd = "`"$NodeExe`" `"$RepoRoot\scripts\cbo\export-cbo.mjs`" --system $Sid >> `"$LogDir\export-log.txt`" 2>&1"
if ($Publish -eq "unc") {
  # export 실패(exit 1) 시에도 폴더에는 직전 정상 스냅샷이 복원돼 있으므로 게시는 안전하다.
  # robocopy 는 복사 성공이 exit 1 이라 && 대신 & 로 잇는다.
  $Cmd += " & robocopy `"$SnapshotDir`" `"$ShareRoot\$Sid`" /E /XD .git /NFL /NDL /NJH /NJS /NP >> `"$LogDir\export-log.txt`" 2>&1"
}

if ($PrintOnly) {
  Write-Host "등록될 명령:"
  Write-Host "  schtasks /Create /TN $TaskName /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST $At /TR `"cmd /c $Cmd`" /F"
  exit 0
}

New-Item -ItemType Directory -Force $LogDir | Out-Null
schtasks /Create /TN $TaskName /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST $At /TR "cmd /c $Cmd" /F
if ($LASTEXITCODE -eq 0) {
  Write-Host "등록 완료: $TaskName (평일 $At) — 로그: $LogDir\export-log.txt"
  if ($Publish -eq "unc") { Write-Host "게시: export 후 $ShareRoot\$Sid 로 robocopy (.git 제외)" }
  Write-Host "해제: schtasks /Delete /TN $TaskName /F"
} else {
  Write-Host "등록 실패 (exit $LASTEXITCODE) — 관리자 권한이 필요할 수 있습니다"
  exit 1
}
