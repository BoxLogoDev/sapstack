# ADT 브리지 — AI가 CBO 소스를 직접 읽는 연동 (읽기 전용)

sapstack 의 Evidence Loop 은 기본적으로 **복사-붙여넣기 기반**입니다 (라이브 SAP 접속을
가정하지 않음 — [ETHOS.md](../ETHOS.md)). ADT 브리지는 그 위에 얹는 **선택적 Layer 0** 으로,
운영자가 SAP 로그인만 하면 AI 가 CBO(Z*/Y*) 소스·테이블·CDS 를 ADT REST API 로 직접
조회해 진단에 사용합니다. 브리지가 없으면 기존 복붙 방식으로 자연스럽게 폴백됩니다.

```
운영자 (SAP 계정 로그인)
    ↓
vsp (ADT-MCP 브리지, 읽기 전용 + Z* 패키지 한정)
    ↓  /sap/bc/adt/... (HTTPS)
SAP DEV/QA 시스템          ← 운영(PRD) 직접 조회는 긴급 시에만. 정석은 운영과 동기화된 DEV/QA
    ↓
Claude Code — /sap-session Evidence Loop 에 소스 증거 자동 공급
```

## 빠른 시작

두 가지 진입점이 있고, 둘 다 같은 프로필 파일(`~/.sapstack/.env`)에 저장합니다:

- **Desktop 앱**: 설정 → **SAP 접속** — URL/클라이언트/계정 입력, 접속 테스트 버튼 제공
- **CLI**: `./setup.sh` (Windows: `./setup.ps1`) 의 **[3/5] SAP 시스템 접속** 단계

CLI 는 아래를 자동화합니다:

1. ADT URL / 클라이언트 / 계정 입력 → `~/.sapstack/.env` 생성 (권한 600)
2. 접속 테스트 — `GET /sap/bc/adt/discovery` (200 = 성공)
3. vsp 탐지 → 읽기 전용 런처(`.sapstack/vsp-mcp.*`) 생성 → Claude Code 등록 명령 출력

## 수동 설정

### 1. ADT URL 확인

SAP GUI → `SMICM` → **Goto > Services** 에서 HTTP(S) 포트 확인:

```
Protocol   Service Name/Port    Host Name
HTTPS      44300                vhlsmds4ci.example.com
HTTP       8000                 vhlsmds4ci.example.com
```

내부 호스트명이 사내 DNS 에 없으면 **IP 를 직접** 사용합니다. IP 는 SAP GUI 접속 항목
(saplogon.ini 의 `[Server]` 섹션)에서 찾을 수 있습니다. 이때 인증서 이름이 맞지 않으므로
`SAP_INSECURE=true` 가 필요합니다.

ADT 서비스 활성 여부는 자격증명 없이도 확인됩니다 — `401` 이면 활성:

```bash
curl -k -s -o /dev/null -w "%{http_code}\n" https://<host>:<port>/sap/bc/adt/discovery
```

`404`/`403` 이면 `SICF` 에서 `/sap/bc/adt` 서비스를 활성화해야 합니다 (Basis 문의).

### 2. vsp 설치

[vibing-steampunk](https://github.com/oisee/vibing-steampunk) Releases 에서 단일 바이너리를
받습니다 (의존성 없음, ECC·S/4HANA 모두 지원 — ADT 가 있는 곳이면 어디든).

### 3. `.env` 작성

[.env.example](../.env.example) 을 `~/.sapstack/.env` 로 복사해 채웁니다.
**`SAP_READ_ONLY=true` 를 유지하세요.**

### 4. Claude Code 등록

```bash
claude mcp add sap-adt --scope user -- bash /path/to/sapstack/.sapstack/vsp-mcp.sh
# Windows:
claude mcp add sap-adt --scope user -- cmd /c "C:\path\to\sapstack\.sapstack\vsp-mcp.cmd"
```

런처는 `~/.sapstack` 로 이동해 vsp 를 실행하므로 자격증명이 `~/.sapstack/.env` 한 곳에만
존재합니다 (Claude 설정 파일에는 런처 경로만 저장됨).

## 보안 모델

| 장치 | 효과 |
|---|---|
| `--read-only` | 쓰기 도구 전체 비활성 — AI 가 SAP 를 수정할 수 없음 |
| `--allowed-packages Z*` | 표준 SAP 소스 접근 차단, 커스텀(CBO)만 조회 |
| `~/.sapstack/.env` (chmod 600) | 자격증명이 저장소·Claude 설정에 남지 않음 |
| 개인 계정 로그인 | SAP 권한 로그에 조회 이력이 계정 단위로 남음 (K-SOX 감사 대응) |
| `S_DEVELOP` ACTVT 03 | 계정 권한 자체를 조회 전용으로 제한 (권장) |

**알려진 한계**: `.env` 는 평문입니다. 정식 배포에서는 OS 자격증명 저장소
(Windows Credential Manager / macOS Keychain) 연동이 로드맵에 있으며, Desktop 앱
로그인 화면이 이를 사용할 예정입니다.

## Evidence Loop 결합 예

```
/sap-session-start
"ZFI0171 화면 저장 시 오류. 관련 CBO 소스를 ADT 로 직접 조회해서 진단해줘"
```

브리지가 연결돼 있으면 AI 가 `SearchObject` → `GetSource` 로 모듈풀·인클루드를 읽어
가설 수립에 사용합니다. 모듈풀 프로그램은 `SAPMZ*` 로 검색하세요 (인클루드만 나올 때).
