#!/usr/bin/env bash
# setup.sh — sapstack 5분 온보딩 (macOS / Linux / Git Bash)
#
# gstack ./setup 의 SAP판. 비개발자 운영자도 "설치 → 첫 진단"까지 한 명령으로.
#
# 동작:
#   1. 사전 요건 점검(node, git)
#   2. .sapstack/config.yaml 대화형 생성(릴리스/배포/회사코드/언어) + 검증
#   3. (선택) MCP 서버 설치 안내 (Claude Desktop / 마켓플레이스)
#   4. 첫 진단 다음 단계 안내 (docs/quickstart-5min.md)
#
# 사용:
#   ./setup.sh            # 대화형 온보딩
#   ./setup.sh --check    # 비대화 환경 점검만 (CI/헬스체크)
#   ./setup.sh --help

set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

CHECK_ONLY=0
case "${1:-}" in
  --check) CHECK_ONLY=1 ;;
  --help|-h) sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
  "") ;;
  *) echo "알 수 없는 인자: $1 (--check / --help)"; exit 1 ;;
esac

c_ok()   { echo "  ✅ $1"; }
c_warn() { echo "  ⚠️  $1"; }
c_err()  { echo "  ❌ $1"; }

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " sapstack 온보딩 — SAP 운영자를 위한 AI 어드바이저"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. 사전 요건 ──────────────────────────────────────────────
echo ""
echo "[1/4] 사전 요건 점검"
PREREQ_FAIL=0
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
  if (( NODE_MAJOR >= 20 )); then c_ok "node $(node -v)"; else c_warn "node $(node -v) — MCP 서버는 20+ 권장"; fi
else
  c_warn "node 없음 — MCP 서버/Learning Loop 사용 시 필요 (지식 조회는 node 없이도 가능)"
fi
command -v git >/dev/null 2>&1 && c_ok "git $(git --version | awk '{print $3}')" || c_warn "git 없음 (업데이트에 권장)"

# config 존재 여부
CONFIG="$REPO_ROOT/.sapstack/config.yaml"
[[ -f "$CONFIG" ]] && c_ok ".sapstack/config.yaml 존재" || c_warn ".sapstack/config.yaml 없음 (아래에서 생성)"

if (( CHECK_ONLY )); then
  echo ""
  echo "환경 점검 완료. 대화형 온보딩: ./setup.sh"
  exit 0
fi

# ── 2. config.yaml 대화형 생성 ────────────────────────────────
echo ""
echo "[2/4] 환경 프로필 생성 (.sapstack/config.yaml)"
if [[ -f "$CONFIG" ]]; then
  read -r -p "  이미 config.yaml 이 있습니다. 덮어쓸까요? (y/N) " ow
  [[ "${ow,,}" == "y" ]] || { echo "  → 기존 config 유지. [3/4] 로 건너뜁니다."; SKIP_CONFIG=1; }
fi

if [[ "${SKIP_CONFIG:-0}" != "1" ]]; then
  echo "  SAP 릴리스를 고르세요:"
  echo "    1) ECC 6.0 EhP7   2) ECC 6.0 EhP8   3) S/4HANA 2022"
  echo "    4) S/4HANA 2023   5) S/4HANA 2024   6) S/4HANA Cloud PE"
  read -r -p "  번호 [4]: " r; r="${r:-4}"
  case "$r" in
    1) RELEASE=ECC_6_EHP7 ;; 2) RELEASE=ECC_6_EHP8 ;; 3) RELEASE=S4HANA_2022 ;;
    4) RELEASE=S4HANA_2023 ;; 5) RELEASE=S4HANA_2024 ;; 6) RELEASE=S4HANA_2024 ;;
    *) RELEASE=S4HANA_2023 ;;
  esac

  echo "  배포 형태:"
  echo "    1) On-premise   2) RISE   3) Cloud PE(Public)   4) Private Cloud"
  read -r -p "  번호 [1]: " d; d="${d:-1}"
  case "$d" in
    1) DEPLOY=on_premise ;; 2) DEPLOY=rise ;; 3) DEPLOY=cloud_pe ;; 4) DEPLOY=private_cloud ;;
    *) DEPLOY=on_premise ;;
  esac
  [[ "$r" == "6" ]] && DEPLOY=cloud_pe

  read -r -p "  주 회사코드 (예: 1000) — 로컬에만 저장, 커밋 안 됨: " CC
  CC="${CC:-1000}"

  read -r -p "  답변 언어 (ko/en/auto) [ko]: " LANG; LANG="${LANG:-ko}"
  case "$LANG" in ko|en|auto) ;; *) LANG=ko ;; esac

  mkdir -p "$REPO_ROOT/.sapstack"
  cat > "$CONFIG" <<YAML
# sapstack 환경 프로필 — setup.sh 가 생성. 검증: ./scripts/validate-config.sh
# ⚠ 실 회사코드 포함 — .gitignore 로 커밋 차단됨. 공유 금지.
system:
  release: $RELEASE
  deployment: $DEPLOY
organization:
  primary_company_code: "$CC"
preferences:
  language: $LANG
  verbosity: standard
  only_confirmed_notes: true
YAML
  c_ok "생성됨: .sapstack/config.yaml ($RELEASE / $DEPLOY / $LANG)"

  if [[ -x "$REPO_ROOT/scripts/validate-config.sh" ]]; then
    ./scripts/validate-config.sh >/tmp/sapstack-cfg.out 2>&1 || true
    if grep -q "❌" /tmp/sapstack-cfg.out; then
      c_warn "config 검증 오류 — 확인: ./scripts/validate-config.sh"
    else
      c_ok "config 검증 통과 (필수 항목 OK, 선택 항목은 나중에 보강 가능)"
    fi
  fi
fi

# ── 3. MCP 서버 (선택) ────────────────────────────────────────
echo ""
echo "[3/4] MCP 서버 (Evidence Loop / 세션 저장에 사용 — 선택)"
read -r -p "  Claude Desktop 에 sapstack MCP 를 설치할까요? (y/N) " mi
if [[ "${mi,,}" == "y" ]]; then
  if [[ -x "$REPO_ROOT/scripts/install-claude-desktop.sh" ]]; then
    ./scripts/install-claude-desktop.sh || c_warn "MCP 설치 중 문제 — 수동: docs/mcp-server.md"
  else
    c_warn "install 스크립트 없음 — 수동 설치: docs/mcp-server.md"
  fi
else
  echo "  건너뜀. 나중에: ./scripts/install-claude-desktop.sh (또는 docs/mcp-server.md)"
fi

# ── 4. 첫 진단 안내 ───────────────────────────────────────────
echo ""
echo "[4/4] 첫 진단 — 5분 안에"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " 준비 완료! 이제 이렇게 물어보세요 (Claude Code / Desktop 에서):"
echo ""
echo "   \"F110 돌렸는데 벤더 하나만 No valid payment method 떠요\""
echo ""
echo " 자세한 첫걸음: docs/quickstart-5min.md"
echo " 전체 진단 여정(Golden Path): docs/workflow.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
