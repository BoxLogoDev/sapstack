# 시나리오 2 — F110 지급실행 DME 생성 실패

## 🎬 상황
월말 F110 지급실행 중 Proposal은 성공했는데 **Payment 단계에서 DME 파일이 생성되지 않음**. 한국 국민은행 연동 사용 중.

## 💬 사용자 질문
```
F110에서 Proposal은 됐는데 Payment 단계에서 DME가 안 나와요.
KB(국민은행) 포맷 사용 중이고 어제까지는 정상이었어요.
```

## 🤖 답변 흐름

### 추천 위임
```
/sap-payment-run-debug <벤더번호>
```
→ 8-Step 체계적 진단 플로우 실행

또는 `sap-fi-consultant` 에이전트에 위임.

### 핵심 진단 (축약)

```markdown
## 🔍 Issue
F110 Payment 단계에서 DME 파일 미생성 — 국민은행 포맷

## 🧠 Root Cause (확률 순)
1. **DMEE Tree 설정 누락** — Payment Method에 포맷 미할당
2. **하우스뱅크 Account ID 변경** — 기존 할당 끊김
3. **SM59 외부 출력 경로 권한** — OS 레벨 write 실패
4. **국민은행 포맷 버전 변경** — 은행에서 스펙 업데이트

## ✅ Check
1. **FBZP** → Payment Method → DMEE Format Tree
2. **DMEE** → KB 트리 활성화 상태
3. **SM37** → Payment Run 관련 Job 로그
4. **SMICM** → 은행 연동 HTTP 서비스 (전송 경우)
5. 파일 경로: /usr/sap/<SID>/DATA/KB_<runid>.txt

## 🛠 Fix
### Case A: Format Tree 재할당
1. FBZP → Bank Determination → 한국 은행 그룹
2. Payment Method → Format Tree 필드 확인
3. DMEE 트리명 입력 → Save → Transport

### Case B: 국민은행 포맷 업데이트
1. SAP OSS / 국민은행 IT에서 최신 DMEE tree 구조 확인
2. DMEE → Import → 테스트 (test run)
3. 실제 운영 반영 (Transport 경유)

## 🛡 Prevention
- **은행 포맷 변경 구독** (국민은행 IT 공지)
- **Monthly DME test run** (월말 전 사전 검증)
- F110 모니터링 대시보드 — 실패 시 즉시 알림

## 📖 SAP Note
- 한국 은행 연동 관련 Note는 `data/sap-notes.yaml`에서 "payment" 검색
```

## 📚 배운 것
- **슬래시 커맨드 위임**이 복잡 시나리오에 적합
- **한국 은행별 포맷**은 standard MT940이 아닌 **커스텀**이 많음 — 표준 답변 주의
- **전자세금계산서와 별개** — 지급은 은행 송금, 세금계산서는 국세청 연동

## 🔗 관련
- `/commands/sap-payment-run-debug.md` — 전용 디버그 파이프라인
- `plugins/sap-tr/skills/sap-tr/SKILL.md` — Treasury 관점
- `plugins/sap-bc/skills/sap-bc/SKILL.md` — 한국 은행 STRUST 연동
