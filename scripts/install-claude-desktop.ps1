# install-claude-desktop.ps1 — sapstack MCP를 Claude Desktop에 1줄 설치 (Windows)
#
# 사용법:
#   powershell -ExecutionPolicy Bypass -File scripts\install-claude-desktop.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\install-claude-desktop.ps1 -DryRun
#   powershell -ExecutionPolicy Bypass -File scripts\install-claude-desktop.ps1 -Uninstall

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

# Windows 설정 경로
$ConfigPath = Join-Path $env:APPDATA 'Claude\claude_desktop_config.json'
$ConfigDir = Split-Path $ConfigPath -Parent

Write-Host "📂 Config: $ConfigPath"

# 디렉토리 생성
if (-not (Test-Path $ConfigDir)) {
    if ($DryRun) {
        Write-Host "[dry-run] New-Item -ItemType Directory -Force $ConfigDir"
    } else {
        New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null
    }
}

# 기존 설정 읽기
if (Test-Path $ConfigPath) {
    try {
        $existing = Get-Content $ConfigPath -Raw | ConvertFrom-Json -AsHashtable
    } catch {
        Write-Warning "기존 설정 파싱 실패, 빈 객체로 시작합니다."
        $existing = @{}
    }
} else {
    $existing = @{}
}

# mcpServers 키 보장
if (-not $existing.ContainsKey('mcpServers')) {
    $existing['mcpServers'] = @{}
}

if ($Uninstall) {
    if ($existing['mcpServers'].ContainsKey('sapstack')) {
        $existing['mcpServers'].Remove('sapstack')
    }
    $action = '제거'
} else {
    $existing['mcpServers']['sapstack'] = @{
        command = 'npx'
        args    = @('-y', '@boxlogodev/sapstack-mcp@latest')
    }
    $action = '설치'
}

$newJson = $existing | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "🔧 sapstack MCP $action"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ($DryRun) {
    Write-Host "[dry-run] 변경 후 config:"
    Write-Host $newJson
    Write-Host ""
    Write-Host "(dry-run 모드 — 파일은 변경되지 않음)"
} else {
    $newJson | Out-File -FilePath $ConfigPath -Encoding UTF8 -Force
    Write-Host "✅ $ConfigPath 갱신 완료"
    Write-Host ""
    Write-Host "다음 단계:"
    Write-Host "  1. Claude Desktop 종료 후 재실행"
    Write-Host "  2. 새 대화에서 'sapstack MCP가 연결됐는지 확인해줘' 라고 질문"
}
