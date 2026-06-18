# ⚡ 5분 시작 — 비개발자용 첫걸음

SAP 운영자(MES/QMS/PMS/SAP ERP 현업)가 **설치부터 첫 진단까지 5분**에 도달하는 가이드.
코드를 몰라도 됩니다. 채팅으로 물어보면 됩니다.

---

## 1분 — 받기

이미 Claude Code / Claude Desktop 을 쓰고 있다면 이 저장소를 열기만 하면 됩니다.

```bash
git clone https://github.com/BoxLogoDev/sapstack.git
cd sapstack
```

## 2분 — 온보딩 한 번 실행

```bash
./setup.sh        # macOS / Linux / Git Bash
# 또는 Windows PowerShell:
./setup.ps1
```

물어보는 건 4가지뿐입니다:

1. **SAP 릴리스** (ECC 6.0 / S/4HANA 몇 년?)
2. **배포 형태** (On-premise / RISE / Cloud)
3. **주 회사코드** (예: 1000) — *로컬에만 저장되고 커밋되지 않습니다*
4. **답변 언어** (ko / en / auto)

→ `.sapstack/config.yaml` 이 생기고, 이후 모든 답변이 **당신 환경에 맞춰** 나옵니다
(ECC vs S/4 구분, 한국 현장 용어 등).

> 그냥 둘러만 보고 싶다면: `./setup.sh --check` (아무것도 안 바꾸고 환경만 점검).

## 3~5분 — 첫 진단

이제 평소 말투로 물어보세요. 예:

```
F110 돌렸는데 벤더 하나만 'No valid payment method' 떠요
```

sapstack 이 이렇게 답합니다:

- **무엇을 볼지** — T-code + 테이블/필드 (예: XK03 → LFB1 의 ZWELS 확인)
- **왜 그런지** — 가장 흔한 원인부터
- **어떻게 고치는지** — 단계별, 그리고 **되돌리는 법(rollback)** 까지
- 운영 변경은 항상 **시뮬레이션 먼저, 트랜스포트 필수** 를 전제로 안내

복잡한 장애는 한 번에 답하지 않고 **증거를 같이 모으며**(Evidence Loop) 추적합니다 —
"확신에 차서 틀리는" 답을 피하기 위해서예요. (자세히: [`workflow.md`](workflow.md))

---

## 다음 단계

| 하고 싶은 것 | 어디로 |
|---|---|
| 전체 진단 여정 이해 | [`workflow.md`](workflow.md) (Golden Path) |
| 우리 모듈이 되는지 확인 | 루트 [`README.md`](../README.md) 호환성 표 |
| MCP 서버로 세션 저장/재개 | [`mcp-server.md`](mcp-server.md) |
| sapstack 의 약속/원칙 | 루트 [`ETHOS.md`](../ETHOS.md) |

> sapstack 은 **읽기 전용 진단 어드바이저**입니다. 운영 SAP 에 직접 쓰지 않으며,
> 결정과 실행은 항상 당신(운영자)의 몫입니다.
