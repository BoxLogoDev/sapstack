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
# schtasks /TR 은 중첩 따옴표에 취약 — 경로 공백("Program Files")을 8.3 단축 경로로 제거
try { $NodeExe = (New-Object -ComObject Scripting.FileSystemObject).GetFile($NodeExe).ShortPath } catch {}
if ($Publish -eq "unc" -and -not $ShareRoot) { Write-Host "-Publish unc 에는 -ShareRoot \\서버\공유\cbo 가 필요합니다"; exit 1 }

# 경로에 공백이 있으면 schtasks /TR 중첩 인용이 깨진다 — 단축 경로 확보 후 무인용으로 조립
foreach ($p in @($RepoRoot, $LogDir)) {
  if ($p -match ' ') { Write-Host "중단: 경로에 공백 — schtasks /TR 인용 한계. 공백 없는 경로로 옮기세요: $p"; exit 1 }
}
$Cmd = "$NodeExe $RepoRoot\scripts\cbo\export-cbo.mjs --system $Sid >> $LogDir\export-log.txt 2>&1"
if ($Publish -eq "unc") {
  if ($ShareRoot -match ' ') { Write-Host "중단: ShareRoot 에 공백 — 공백 없는 공유 경로를 사용하세요"; exit 1 }
  # export 실패(exit 1) 시에도 폴더에는 직전 정상 스냅샷이 복원돼 있으므로 게시는 안전하다.
  # robocopy 는 복사 성공이 exit 1 이라 && 대신 & 로 잇는다. /R /W 를 안 주면 기본 100만회×30초 재시도라
  # 공유가 불통일 때 태스크가 영원히 'Running' 으로 남아 다음 예약(IgnoreNew)까지 막는다.
  $Cmd += " & robocopy $SnapshotDir $ShareRoot\$Sid /E /XD .git /R:2 /W:5 /NFL /NDL /NJH /NJS /NP >> $LogDir\export-log.txt 2>&1"
}

# schtasks /TR 은 261자 한계 — 전체 체인을 러너 .cmd 로 떨어뜨리고 /TR 은 러너만 가리킨다.
# 러너는 스냅샷 폴더 밖(~/.sapstack/cbo/)에 둬서 robocopy 게시본에 섞이지 않게 한다.
$Runner = Join-Path (Split-Path $SnapshotDir -Parent) "run-export-$Sid.cmd"

if ($PrintOnly) {
  Write-Host "러너($Runner) 내용:"
  Write-Host "  $Cmd"
  Write-Host "등록될 명령:"
  Write-Host "  schtasks /Create /TN $TaskName /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST $At /TR `"cmd /c $Runner`" /F"
  exit 0
}

New-Item -ItemType Directory -Force $LogDir | Out-Null
Set-Content $Runner "@echo off`r`n$Cmd`r`n" -Encoding ASCII
schtasks /Create /TN $TaskName /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST $At /TR "cmd /c $Runner" /F
if ($LASTEXITCODE -eq 0) {
  # 노트북·미로그온 대비: 배터리에서도 시작·지속하고, 놓친 시각은 깨어난 뒤 즉시 실행 (schtasks 에는 이 옵션이 없다)
  Set-ScheduledTask -TaskName $TaskName -Settings (New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable) | Out-Null
  Write-Host "등록 완료: $TaskName (평일 $At) — 로그: $LogDir\export-log.txt"
  if ($Publish -eq "unc") { Write-Host "게시: export 후 $ShareRoot\$Sid 로 robocopy (.git 제외)" }
  Write-Host "해제: schtasks /Delete /TN $TaskName /F"
} else {
  Write-Host "등록 실패 (exit $LASTEXITCODE) — 관리자 권한이 필요할 수 있습니다"
  exit 1
}
