#!/usr/bin/env bash
# validate-config.sh — 사용자 .sapstack/config.yaml 유효성 검증
#
# v1.3.0 MVP: 스키마 기반 엄격 검증 대신 필수 필드 존재 확인 + 간단 형식 검사
# 향후 v1.4.0에서 JSON Schema 완전 검증으로 확장 예정.
#
# 사용법:
#   ./scripts/validate-config.sh                    # 기본 경로 .sapstack/config.yaml
#   ./scripts/validate-config.sh <path>             # 특정 파일 검증
#   ./scripts/validate-config.sh .sapstack/config.example.yaml

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CONFIG_FILE="${1:-.sapstack/config.yaml}"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "❌ 파일 없음: $CONFIG_FILE"
  echo ""
  echo "힌트: .sapstack/config.example.yaml을 복사해서 시작하세요."
  echo "  cp .sapstack/config.example.yaml .sapstack/config.yaml"
  exit 1
fi

ERRORS=0
WARNINGS=0

# 간단 YAML 섹션 존재 검증 (awk)
check_section() {
  local section="$1"
  local required="${2:-1}"
  if grep -qE "^${section}:" "$CONFIG_FILE"; then
    echo "✅ ${section}: 존재"
    return 0
  else
    if (( required )); then
      echo "❌ ${section}: 누락 (필수)"
      ERRORS=$((ERRORS + 1))
    else
      echo "⚠️  ${section}: 누락 (선택)"
      WARNINGS=$((WARNINGS + 1))
    fi
    return 1
  fi
}

check_field() {
  local field_path="$1"
  local required="${2:-0}"
  # field_path 예: "system.release"
  local section="${field_path%%.*}"
  local field="${field_path##*.}"

  if awk "/^${section}:/{found=1} found && /^  ${field}:/{print; exit}" "$CONFIG_FILE" | grep -q "${field}:"; then
    return 0
  else
    if (( required )); then
      echo "❌ $field_path: 누락 (필수)"
      ERRORS=$((ERRORS + 1))
    else
      echo "⚠️  $field_path: 누락 (선택)"
      WARNINGS=$((WARNINGS + 1))
    fi
    return 1
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "sapstack config 검증: $CONFIG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 최상위 섹션
echo "## 섹션 검사"
check_section "system"
check_section "organization"
check_section "preferences"
check_section "landscape" 0
check_section "korea" 0
check_section "project" 0
echo ""

# 2. 필수 필드
echo "## 필수 필드"
check_field "system.release" 1
check_field "system.deployment" 1
check_field "organization.primary_company_code" 1
check_field "preferences.language" 1
echo ""

# 3. 값 형식 검사 (간단)
echo "## 값 형식"

# system.release 값 검증
release_value=$(awk '/^system:/{found=1} found && /^  release:/{print; exit}' "$CONFIG_FILE" | sed 's/.*release: *//' | tr -d '"')
if [[ -n "$release_value" ]]; then
  case "$release_value" in
    ECC_6_EHP[4-8]|S4HANA_15[01][0-9]|S4HANA_202[0-4])
      echo "✅ system.release = $release_value (유효)"
      ;;
    *)
      echo "⚠️  system.release = $release_value (예상 형식 아님)"
      WARNINGS=$((WARNINGS + 1))
      ;;
  esac
fi

# deployment 값 검증
deployment_value=$(awk '/^system:/{found=1} found && /^  deployment:/{print; exit}' "$CONFIG_FILE" | sed 's/.*deployment: *//' | tr -d '"')
if [[ -n "$deployment_value" ]]; then
  case "$deployment_value" in
    on_premise|rise|cloud_pe|private_cloud)
      echo "✅ system.deployment = $deployment_value (유효)"
      ;;
    *)
      echo "⚠️  system.deployment = $deployment_value (예상: on_premise|rise|cloud_pe|private_cloud)"
      WARNINGS=$((WARNINGS + 1))
      ;;
  esac
fi

# language 값 검증
language_value=$(awk '/^preferences:/{found=1} found && /^  language:/{print; exit}' "$CONFIG_FILE" | sed 's/.*language: *//' | tr -d '"')
if [[ -n "$language_value" ]]; then
  case "$language_value" in
    ko|en|auto)
      echo "✅ preferences.language = $language_value (유효)"
      ;;
    *)
      echo "⚠️  preferences.language = $language_value (예상: ko|en|auto)"
      WARNINGS=$((WARNINGS + 1))
      ;;
  esac
fi

# 4. 보안 체크 — 실제 민감 값이 example.yaml에 있는지
echo ""
echo "## 보안 체크"
if [[ "$CONFIG_FILE" == *".example.yaml" ]]; then
  if grep -Eq 'primary_company_code: *"[A-Z0-9]{3,4}"' "$CONFIG_FILE"; then
    if ! grep -q '<YOUR_' "$CONFIG_FILE"; then
      echo "⚠️  example.yaml에 실제 회사코드로 보이는 값이 있습니다 (placeholder 사용 권장)"
      WARNINGS=$((WARNINGS + 1))
    else
      echo "✅ example.yaml placeholder 사용"
    fi
  fi
else
  # 실제 config.yaml이면 gitignore 확인 안내
  if git check-ignore -q "$CONFIG_FILE" 2>/dev/null; then
    echo "✅ $CONFIG_FILE은 gitignore 대상 (민감 정보 보호)"
  else
    echo "⚠️  $CONFIG_FILE이 gitignore되지 않았습니다 — .gitignore에 추가 권장"
    WARNINGS=$((WARNINGS + 1))
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "오류: $ERRORS"
echo "경고: $WARNINGS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if (( ERRORS > 0 )); then
  exit 1
fi

exit 0
