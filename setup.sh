#!/usr/bin/env bash
# setup.sh — sapstack 5분 온보딩 (macOS / Linux / Git Bash)
#
# gstack ./setup 의 SAP판. 비개발자 운영자도 "설치 → 첫 진단"까지 한 명령으로.
#
# 동작:
#   1. 사전 요건 점검(node, git)
#   2. .sapstack/config.yaml 대화형 생성(릴리스/배포/회사코드/언어) + 검증
#   3. (선택) SAP ADT 접속 설정 — .env 생성 + 접속 테스트 + vsp MCP 연동 안내
#   4. (선택) MCP 서버 설치 안내 (Claude Desktop / 마켓플레이스)
#   5. 첫 진단 다음 단계 안내 (docs/quickstart-5min.md)
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
  --help|-h) sed -n '2,19p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
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
echo "[1/5] 사전 요건 점검"
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
echo "[2/5] 환경 프로필 생성 (.sapstack/config.yaml)"
if [[ -f "$CONFIG" ]]; then
  read -r -p "  이미 config.yaml 이 있습니다. 덮어쓸까요? (y/N) " ow
  [[ "${ow,,}" == "y" ]] || { echo "  → 기존 config 유지. [3/5] 로 건너뜁니다."; SKIP_CONFIG=1; }
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

# ── 3. SAP ADT 접속 (선택) — AI가 CBO 소스/데이터를 직접 조회 ──
echo ""
echo "[3/5] SAP 시스템 접속 (선택) — AI가 CBO 소스를 직접 읽는 ADT 연동 (읽기 전용)"
read -r -p "  SAP ADT 접속을 설정할까요? (y/N) " sap
if [[ "${sap,,}" == "y" ]]; then
  # Desktop 앱(설정 > SAP 접속)과 vsp 브리지가 같은 파일을 읽는다 — 위치 통일
  ENV_FILE="$HOME/.sapstack/.env"
  SKIP_ENV=0
  if [[ -f "$ENV_FILE" ]]; then
    read -r -p "  이미 ~/.sapstack/.env 가 있습니다. 덮어쓸까요? (y/N) " eo
    [[ "${eo,,}" == "y" ]] || { echo "  → 기존 .env 유지."; SKIP_ENV=1; }
  fi

  if (( ! SKIP_ENV )); then
    echo "  ADT URL — SAP GUI: SMICM > Goto > Services 의 HTTP(S) 포트 (예: https://sapdev:44300)"
    read -r -p "  ADT URL: " SAP_URL
    read -r -p "  클라이언트 [100]: " SAP_CLIENT; SAP_CLIENT="${SAP_CLIENT:-100}"
    read -r -p "  사용자명: " SAP_USER
    read -rs -p "  비밀번호 (입력 숨김): " SAP_PASSWORD; echo ""
    read -r -p "  언어 (KO/EN) [KO]: " SAP_LANGUAGE; SAP_LANGUAGE="${SAP_LANGUAGE:-KO}"

    mkdir -p "$HOME/.sapstack"
    cat > "$ENV_FILE" <<ENV
# sapstack SAP 접속 프로필 — setup.sh 가 생성. Desktop 앱(설정 > SAP 접속)과 공유.
# ⚠ 비밀번호 평문 저장 — 조회 전용 계정 사용 권장, 파일 공유 금지.
SAP_URL=$SAP_URL
SAP_USER=$SAP_USER
SAP_PASSWORD=$SAP_PASSWORD
SAP_CLIENT=$SAP_CLIENT
SAP_LANGUAGE=$SAP_LANGUAGE
SAP_INSECURE=true
SAP_READ_ONLY=true
ENV
    chmod 600 "$ENV_FILE" 2>/dev/null || true
    c_ok "생성됨: ~/.sapstack/.env (권한 600)"

    # 접속 테스트 — ADT discovery 엔드포인트
    if command -v curl >/dev/null 2>&1; then
      code=$(curl -k -s -o /dev/null -w '%{http_code}' --connect-timeout 8 \
        -u "$SAP_USER:$SAP_PASSWORD" \
        "$SAP_URL/sap/bc/adt/discovery?sap-client=$SAP_CLIENT" 2>/dev/null || echo 000)
      case "$code" in
        200) c_ok "ADT 접속 성공 (discovery 200)" ;;
        401) c_err "인증 실패 (401) — 계정/비밀번호/클라이언트 확인 후 .env 수정" ;;
        403) c_warn "권한 부족 (403) — 계정에 S_DEVELOP 조회(ACTVT 03) 권한 필요" ;;
        000) c_err "서버 연결 불가 — URL/포트/방화벽/DNS 확인 (IP 직접 입력도 가능)" ;;
        *)   c_warn "예상외 응답 (HTTP $code) — SICF 에서 /sap/bc/adt 서비스 활성화 확인" ;;
      esac
    else
      c_warn "curl 없음 — 접속 테스트 건너뜀"
    fi
  fi

  # vsp(ADT-MCP 브리지) 연동 — 있으면 런처 생성, 없으면 안내
  VSP_BIN="$(command -v vsp 2>/dev/null || command -v vsp.exe 2>/dev/null || true)"
  if [[ -z "$VSP_BIN" ]]; then
    read -r -p "  vsp 바이너리 경로 (없으면 Enter — 나중에 설치): " VSP_BIN
  fi
  if [[ -n "$VSP_BIN" && -f "$VSP_BIN" ]]; then
    LAUNCHER="$REPO_ROOT/.sapstack/vsp-mcp.sh"
    mkdir -p "$REPO_ROOT/.sapstack"
    cat > "$LAUNCHER" <<LAUNCH
#!/usr/bin/env bash
# vsp MCP 런처 — setup.sh 가 생성. ~/.sapstack/.env 의 접속 프로필을 읽는다.
cd "\$HOME/.sapstack" && exec "$VSP_BIN" --read-only --allowed-packages 'Z*'
LAUNCH
    chmod +x "$LAUNCHER"
    c_ok "생성됨: .sapstack/vsp-mcp.sh (읽기 전용, Z* 패키지 한정)"
    echo "  Claude Code 등록 (아래 한 줄 실행):"
    echo "    claude mcp add sap-adt --scope user -- bash \"$LAUNCHER\""
  else
    echo "  → vsp 미설치. ADT-MCP 브리지: https://github.com/oisee/vibing-steampunk (Releases 에서 단일 바이너리)"
    echo "    설치 후 ./setup.sh 재실행 또는 docs/adt-bridge.md 참고"
  fi
else
  echo "  건너뜀. 나중에: ./setup.sh 재실행 (기존 config 는 유지 선택 가능)"
fi

# ── 4. MCP 서버 (선택) ────────────────────────────────────────
echo ""
echo "[4/5] MCP 서버 (Evidence Loop / 세션 저장에 사용 — 선택)"
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

# ── 5. 첫 진단 안내 ───────────────────────────────────────────
echo ""
echo "[5/5] 첫 진단 — 5분 안에"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " 준비 완료! 이제 이렇게 물어보세요 (Claude Code / Desktop 에서):"
echo ""
echo "   \"F110 돌렸는데 벤더 하나만 No valid payment method 떠요\""
echo ""
echo " 자세한 첫걸음: docs/quickstart-5min.md"
echo " 전체 진단 여정(Golden Path): docs/workflow.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
