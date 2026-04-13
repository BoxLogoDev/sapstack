# 망분리 환경 배포 가이드 (Air-Gapped Deployment for Korean Enterprises)

## Overview (개요)

**망분리 (Air-gap)** = 인터넷과 완전히 단절된 폐쇄형 네트워크에서 SAP 시스템 운영.

**한국 적용 산업:**
- 금융권 (은행, 보험, 증권) — 금융감독 지침 (ISMS)
- 공공기관 (정부, 지자체, 공기업) — 정보보안 기준 (ISMS 필수)
- 방위산업 (방위사업법 보안 지침 TS-2023-1)
- 에너지 (전력, 가스, 수도) — 중요기반시설 보안

**sapstack Role**: 오프라인 번들 기반 진단 + 로컬 감사추적

---

## 망분리 환경의 특성 (Air-Gap Architecture)

```
인터넷 연결 있는 PC          망분리 경계              폐쇄형 네트워크 (SAP 있음)
┌─────────────────┐       │                      ┌──────────────────┐
│  Office PC      │───X───│ 방화벽 (차단)         │  SAP System      │
│  (외부 접근 불가) │       │                      │  + sapstack MCP  │
└─────────────────┘       │                      └──────────────────┘
        │                 │
        │ USB/DVD 전송    │ (단방향 파일 이동만 허용)
        └─────────────────┘
        
특징:
  1. 인터넷 없음 → npm registry 접근 불가
  2. 외부 서비스 차단 → Claude API 호출 불가 (MCP 서버는 로컬)
  3. 파일 전송만 가능 → USB, 암호화된 외장 HDD, 보안 파일 서버 (내부)
```

---

## Pre-Deployment: 배포 전 준비

### Step 1: sapstack Bundle 다운로드 (외부 PC)

```bash
# 인터넷 있는 PC에서 실행
cd /tmp
npm pack sapstack
# Output: sapstack-1.7.0.tgz (약 15MB)

# 체크섬 생성 (무결성 검증용)
sha256sum sapstack-1.7.0.tgz > sapstack-1.7.0.tgz.sha256
# Output: abc123def456...  sapstack-1.7.0.tgz

# GitHub Release 페이지에서 공식 체크섬 확인
# https://github.com/BoxLogoDev/sapstack/releases/tag/v1.7.0
# 발표된 sha256과 비교 → 일치 여부 확인 ✓
```

### Step 2: npm 캐시 생성 (의존성 번들)

```bash
# 모든 의존성을 로컬에 다운로드
npm ci --production
mkdir -p /tmp/npm-cache
cp -r node_modules /tmp/npm-cache/

# 의존성 리스트 저장 (감시용)
npm ls --production > /tmp/npm-dependencies.txt
# 용도: 배포 후 감시 — 공식 npm registry에서 변경 확인 불가

# 의존성 체크섬 저장
find node_modules -name "package.json" -exec sha256sum {} \; > /tmp/dependencies.sha256
```

### Step 3: 오프라인 번들 생성

```bash
# sapstack 소스 + 의존성 + npm 캐시 한 세트로 압축
tar czf /tmp/sapstack-offline-1.7.0.tar.gz \
  sapstack-1.7.0.tgz \
  npm-cache/ \
  npm-dependencies.txt \
  dependencies.sha256 \
  README-OFFLINE.md

# 최종 체크섬 (무결성 보증)
sha256sum /tmp/sapstack-offline-1.7.0.tar.gz > /tmp/bundle.sha256
```

### Step 4: 전송 매체 준비

```bash
# 옵션 1: USB 드라이브 (정책이 허용하면)
#  - 8GB 이상 권장
#  - FAT32 또는 exFAT (호환성)
cp /tmp/sapstack-offline-1.7.0.tar.gz /media/usb/
cp /tmp/bundle.sha256 /media/usb/
mkdir -p /media/usb/docs
cp SECURITY.md /media/usb/docs/
cp docs/compliance/* /media/usb/docs/

# 옵션 2: 암호화된 외장 HDD (권장)
#  - BitLocker (Windows) 또는 LUKS (Linux) 암호화
#  - 비밀번호: 분리되어 전달 (다른 채널)
mkdir -p /mnt/encrypted/sapstack-1.7.0
cp /tmp/sapstack-offline-1.7.0.tar.gz /mnt/encrypted/sapstack-1.7.0/
# 암호화 후 전송

# 옵션 3: 보안 파일 서버 (망분리 내부에 있는 경우)
#  - 내부망 파일 서버에 업로드
#  - 망분리 내 PC에서 접근 가능
scp -P 2222 /tmp/sapstack-offline-1.7.0.tar.gz \
  it-admin@internal-server:/secure/sapstack-repo/
```

---

## Installation: 망분리 환경에 설치

### Step 1: 파일 전송 & 검증

```bash
# 망분리 내 PC (인터넷 없음)에서:

# USB에서 복사
cp /media/usb/sapstack-offline-1.7.0.tar.gz /tmp/
cp /media/usb/bundle.sha256 /tmp/

# 또는 내부 파일 서버에서 다운로드
wget http://internal-server/sapstack-repo/sapstack-offline-1.7.0.tar.gz

# 체크섬 검증 (무결성 확인)
cd /tmp
sha256sum -c bundle.sha256
# Output: sapstack-offline-1.7.0.tar.gz: OK ✓
```

### Step 2: 오프라인 설치

```bash
# 번들 추출
tar xzf /tmp/sapstack-offline-1.7.0.tar.gz -C /opt
cd /opt/sapstack-offline-1.7.0

# npm 캐시 설정 (외부 registry 사용 금지)
npm config set registry file:///opt/sapstack-offline-1.7.0/npm-cache
npm config set offline true

# 설치 (--offline 플래그)
npm install --offline \
  --registry file:///opt/sapstack-offline-1.7.0/npm-cache \
  --no-optional \
  --no-package-lock \
  --save-exact \
  sapstack-1.7.0.tgz

# 설치 확인
./node_modules/.bin/sapstack --version
# Output: 1.7.0 ✓

# 의존성 검증 (감청 감지)
npm ls --production > /tmp/dependencies-installed.txt
diff /tmp/npm-dependencies.txt /tmp/dependencies-installed.txt
# Output: (차이 없음) ✓
```

### Step 3: 망분리 전용 설정

```yaml
# .sapstack/config.yaml (망분리 환경)

# 기본 설정
environment:
  sap_system: "ECC 6.0"
  mode: "offline"              # 오프라인 모드
  air_gapped: true
  internet_access: false

# 외부 서비스 차단 (MCP 서버는 로컬만)
mcp:
  claude_api_enabled: false    # Claude API 사용 불가 (외부)
  external_services: []        # 빈 리스트
  local_stdio_only: true       # 로컬 stdio만 사용

# 데이터 저장소 (로컬 디렉토리)
data:
  sessions_dir: "/opt/sapstack/sessions"
  audit_trail: "/opt/sapstack/audit-trail.jsonl"
  evidence_bundles: "/opt/sapstack/evidence"

# 보안 (망분리 내부는 신뢰할 수 있으므로 HTTP OK, 하지만 권장하지 않음)
security:
  https_required: true         # 내부라도 HTTPS 권장
  tls_version: "1.2"
  certificate: "/opt/sapstack/cert.pem"
  
# 감사추적 (중요)
audit:
  enabled: true
  trail_file: "/opt/sapstack/audit-trail.jsonl"
  immutable: true
  retention_days: 2555         # 7년 (한국 법령 기준)

# 규정 준수
compliance:
  framework: "k-sox"           # 공공기관/금융
  pii_scrub: true
  classification_required: true
```

---

## MCP Server Runtime: 망분리 모드

### 시작

```bash
# 망분리 내 서버에서 MCP 시작
/opt/sapstack/scripts/mcp-server.sh \
  --offline \
  --config /opt/sapstack/.sapstack/config.yaml \
  --port 9000

# 또는 systemd 서비스로 등록
sudo systemctl start sapstack-mcp
sudo systemctl enable sapstack-mcp  # 부팅 시 자동 시작

# 상태 확인
systemctl status sapstack-mcp
# Output:
#   sapstack-mcp.service - sapstack MCP Server (Air-Gapped)
#   Active: active (running)
#   PID: 2345
```

### 특징 (망분리 운영)

```
MCP 서버 동작:
  1. stdio 경로로만 통신 (TCP 네트워크 X)
  2. 로컬 파일시스템에만 접근
  3. 외부 API 호출 없음
  4. 모든 동작 감사추적에 기록

예제: GL 잔액 조회
  입력:  "GL 1101000 2026-03의 잔액?"
  처리:  SAP 시스템의 로컬 ABAP 런타임 호출 (네트워크 X)
  출력:  "GL 1101000: 5,234,567 KRW"
  기록:  audit-trail.jsonl에 기록
         {"timestamp": "2026-04-13T10:00:00Z", 
          "who": "FIN_OPERATOR", 
          "what": "query_gl", 
          "result": "success"}

클로드(Claude) 호출:
  ❌ 불가능 (인터넷 없음)
  → 대신: 로컬 패턴 매칭 + 규칙 기반 응답 사용
```

---

## Session Management: 로컬 전용

### 세션 상태 저장

```yaml
# .sapstack/sessions/{session-id}/state.yaml (로컬만 저장)

session_id: "sess_2026_04_001"
created_at: "2026-04-13T10:00:00Z"
environment: "ECC 6.0 (망분리, SAP서버 QA2)"

# 운영자 정보 (LDAP, 인증서 기반 — 인터넷 X)
who:
  ldap_user: "fin_operator@company.local"
  full_name: "재무팀 담당자"
  department: "Finance"
  mfa_verified: true

# 진단 목적
diagnostic_purpose: "Month-end GL reconciliation"
related_transport: "TR-2026-04-0456"

# 증거 번들 (로컬)
evidence_bundle:
  location: ".sapstack/evidence/sess_2026_04_001.json"
  classification: [INTERNAL, CONFIDENTIAL]
  pii_scrubbed: true
  masking_hits: 5  # 5개의 PII 패턴 제거됨
  
# 감사추적 (로컬, 불변)
audit_trail:
  location: ".sapstack/audit-trail.jsonl"
  entries: 12  # 이 세션 동안 12개 이벤트 기록
```

### 세션 재개

```bash
# 진단 도중 중단되었거나, 나중에 결과를 검토하려면:

# 기존 세션 목록
sapstack list-sessions
# Output:
#   sess_2026_04_001  2026-04-13 10:00  Month-end GL reconciliation  [CLOSED]
#   sess_2026_04_002  2026-04-13 14:30  Change management audit  [OPEN]

# 기존 세션 재개
sapstack resume-session sess_2026_04_001

# 또는 세션 정보 조회
sapstack show-session sess_2026_04_001
# Output: state.yaml + evidence bundle 요약
```

---

## Update Process: 분기별 업데이트

### Q2 2026: sapstack v1.8.0 업그레이드 예시

```
Timeline:
  2026-04-30  (화)  IT팀이 v1.8.0 공지 + Bundle 준비
  2026-05-07  (화)  Bundle를 USB/암호화 HDD로 전달
  2026-05-14  (화)  테스트 환경에서 설치 & 테스트 (1주)
  2026-05-21  (화)  변경 통제 승인회의
  2026-05-28  (화)  프로덕션 업그레이드 (야간 작업)
  2026-05-29  (수)  업그레이드 검증 & 감시 (24시간)
```

### 업그레이드 절차

```bash
# Step 1: 새 Bundle 받음 (USB 또는 파일 서버)
cd /tmp
cp /media/usb/sapstack-offline-1.8.0.tar.gz ./
sha256sum -c /media/usb/bundle-1.8.0.sha256
# Output: OK ✓

# Step 2: 테스트 환경에서 설치 및 테스트
cd /opt/test
tar xzf /tmp/sapstack-offline-1.8.0.tar.gz
# ... 기존 절차대로 설치
# ... 샘플 Evidence Loop 실행 테스트
# ... 감사추적 기록 확인

# Step 3: Change Control 문서
cat > /tmp/change-request-2026-05-28.md << 'EOF'
Change Request: sapstack v1.7.0 → v1.8.0 upgrade
================================================
Requested By: IT Operations
Date: 2026-05-28
Reason: Bug fixes + new features (air-gap improvements)

Test Results:
  - Evidence Loop creation: PASS
  - GL query: PASS
  - Audit trail: PASS
  - PII masking: PASS
  - Rollback procedure tested: PASS

Rollback Plan:
  If issues occur, revert to v1.7.0:
  1. systemctl stop sapstack-mcp
  2. Restore /opt/sapstack from v1.7.0.tar.gz backup
  3. systemctl start sapstack-mcp
  4. Verify audit trail (JSONL format unchanged)
  
Approvers:
  - IT Manager: ___________  (Signature)
  - Security Officer: _______  (Signature)
  - Finance Director: ______  (Signature)
EOF

# Step 4: 프로덕션 배포 (IT 팀이 진행)
cd /opt/sapstack
sudo systemctl stop sapstack-mcp

# 백업 (이전 버전)
sudo tar czf /opt/backups/sapstack-1.7.0-backup-2026-05-28.tar.gz .

# 업그레이드
sudo tar xzf /tmp/sapstack-offline-1.8.0.tar.gz --strip-components=1 -C /opt/sapstack

# 확인
sudo systemctl start sapstack-mcp
sudo systemctl status sapstack-mcp

# Step 5: 업그레이드 검증
sapstack --version
# Output: 1.8.0 ✓

# 감사추적 확인 (연속성)
tail -5 .sapstack/audit-trail.jsonl
# Output: 
#   ... (이전 entries 그대로)
#   {"timestamp": "2026-05-28T22:00:00Z", "who": "admin", "what": "upgrade", "from": "1.7.0", "to": "1.8.0", "result": "success"}
```

---

## 한국 기업 사례

### Case 1: 금융기관 (Banking)

```
환경:      국내 은행 (부산은행 규모)
SAP:       ECC 6.0 (on-premise)
네트워크:  망분리 Tier 1 (사용자층/운영층 분리)

배포:
  1. 개발팀 PC (인터넷 있음) → sapstack 1.7.0 Bundle 다운로드
  2. USB로 망분리 경계 통과 (보안부 승인 필요)
  3. 망분리 내 IT팀 서버에 설치
  4. 운영팀 (FIN_OPERATOR 역할)이 매달 GL reconciliation 할 때 사용
  5. 외부감사인이 Evidence 요청 → audit-trail.jsonl 내보내기
  
규정:
  - K-SOX (분기 내부 통제 평가)
  - ISMS (정보보안 기준)
  - 개인정보보호법 (PII 마스킹)

증거:
  - 월말 GL reconciliation Evidence Loop
  - Audit trail (6개월, JSONL)
  - PII scrubbing report (6개월, 월별)
```

### Case 2: 공공기관 (Government)

```
환경:      중앙정부 기관 (예: 국방부)
SAP:       S/4HANA (RISE 클라우드)
네트워크:  망분리 Tier 2 (사용자층/관리층/운영층)

특이사항:
  - "정보는 자산" 원칙 (모든 데이터 RESTRICTED로 분류)
  - Evidence Bundle은 망분리 내에서만 존재 (외부 전송 불가)
  - 감사 시 authorized officer가 직접 확인 (복사 불가)

배포:
  1. IT팀이 sapstack을 망분리 내 'App서버'에만 설치
  2. 운영팀은 "공용 PC" (별도 계정, MFA)에서만 접근
  3. Evidence Loop 결과는 "보안관리실"이 보관
  4. 외부감사인은 "감사 전용 터미널"에서만 조회

증거:
  - 분기별 Change Management 감시 (모든 TR 기록)
  - Audit trail (24개월 보유, 기밀 분류)
  - 감시 로그 (누가 Evidence 조회했는지, MFA 인증 기록)
```

### Case 3: 방위산업 (Defense Contractor)

```
환경:      방위산업 협력업체 (제조업)
SAP:       ECC 6.0 (on-premise, TS-2023-1 준수 필수)
네트워크:  망분리 Tier 3 (최고 보안, 물리적 보호)

특이사항:
  - TS-2023-1 (SAP 기준 보안 지침) 준수
  - 사용자가 증거 번들을 '외부'로 꺼낼 수 없음
  - "치명적 정보" (핵심 부품, 공정 데이터) 포함 가능

배포 & 운영:
  1. sapstack은 "방산 테스트 환경"에서만 사용 (프로덕션 X)
  2. Production SAP 진단이 필요하면?
     → 서명된 변경 요청 (TR) 제출
     → Authorized SAP Basis 전문가만 직접 진단 (GUI)
     → 증거는 보안관리실에 보관
  3. External auditor? 정부 감시관이 현장 확인만 (자료 전달 X)

추천:
  "방위산업 환경에서는 sapstack의 자동 Evidence 생성이 과도할 수 있습니다.
   대신 '규제 준수' 목적의 월별 체크리스트 방식 추천."
```

---

## Troubleshooting: 망분리 환경 문제 해결

### 문제 1: "npm install 실패 — package not found"

```
원인: npm 캐시 경로 잘못됨
해결:
  $ npm config list | grep registry
  # registry가 file:///... 를 가리키는지 확인
  
  잘못됨: https://registry.npmjs.org/
  맞음:   file:///opt/sapstack-offline-1.7.0/npm-cache
  
  수정:
  npm config set registry file:///opt/sapstack-offline-1.7.0/npm-cache
  npm install --offline
```

### 문제 2: "audit-trail.jsonl 파일이 계속 커짐"

```
원인: 감사추적 보관 정책 미설정
해결: config.yaml에서
  audit:
    retention_days: 2555  # 7년
    auto_delete_after: "7-year-hold"
  
이제 자동 정리 (오래된 항목 secure-wipe)
```

### 문제 3: "MCP 서버가 응답 없음"

```
원인 1: 메모리 부족
  해결: sapstack 로그 확인
  $ tail -100 /opt/sapstack/logs/mcp.log
  
원인 2: SAP 시스템 연결 끊김
  해결: SAP 연결 설정 확인
  $ sapstack diagnose --sap-connectivity
  
원인 3: 권한 부족
  해결: 파일 권한 확인
  $ ls -la /opt/sapstack/
  
  /opt/sapstack/audit-trail.jsonl는 777 (쓰기 가능)이어야 함
```

---

## Compliance & Audit: 감시 & 감사

### 월별 점검

```bash
# 매월 말 (감사 담당자가 실행)
sapstack audit-monthly --month 2026-04 --output /tmp/audit-2026-04.json

점검 항목:
  1. MCP 서버 정상 운영?
  2. Audit trail 증가하고 있는가? (정상: 1000+ entries/month)
  3. 비정상 접근 시도? (denied entries)
  4. PII 마스킹 동작 중?
  5. 임무 위반(이상 접근)이 있었나?
```

### 분기별 컴플라이언스 보고서

```bash
sapstack compliance-report --quarter Q2 --framework k-sox

보고서 내용:
  - ITGC Status (각 통제별 설계 및 운영 효과성)
  - Findings (발견된 문제점 — 예: 권한 과다 부여)
  - Evidence (이 분기 수집한 증거 — Evidence Loop 10회, GL reconciliation 3회 등)
  - Remediation (발견 사항 개선 현황)

예시:
  Control: Segregation of Duties (GL Posting)
  Design: PASS (분리됨)
  Operating Effectiveness: PASS (3월간 위반 0건)
  Evidence:
    - audit-trail.jsonl (3000+ entries, 모두 분석됨)
    - Evidence Loop 3회 (각각 GL variance 0.1% 이상 발견 시 조사)
  Remediation: Not needed
```

### 외부감사인 대응

```
감사인 요청:
  "Q1 2026 GL 통제의 운영 효과성 증거를 주세요."

sapstack 응답:
  1. 증거 패키지 생성
     sapstack export-audit --period "2026-01:2026-03" \
       --output /tmp/q1-audit-package.tar.gz
  
  2. 패키지 내용
     - compliance-summary.md (Q1 통제 평가 결과)
     - evidence-bundles/ (GL reconciliation 3회 번들)
     - audit-trail-q1.jsonl (모든 GL 작업 기록)
     - control-mappings.xlsx (통제-증거 매핑표)
  
  3. 감사인에게 전달 (암호화된 USB 또는 보안 전송)

감사인 리뷰:
  ✓ GL segregation control design 적절함
  ✓ 3개월간 위반 없음
  ✓ 월말 reconciliation 정상 수행
  ✓ Audit trail 신뢰할 수 있음 (tamper-evident JSONL)
  
결론: Control PASS (Opinion: EFFECTIVE)
```

---

## FAQ: 망분리 환경

**Q: 인터넷이 없으면 Claude AI 기능은?**
A: MCP 서버 = 로컬 진단 엔진만 작동. Claude 호출 없음. 대신 규칙 기반 분석 (더 빠름).

**Q: 업그레이드가 분기마다 와야 하는가?**
A: 아니오. 필요할 때만 업그레이드. sapstack v1.7.0은 안정적이므로 연간 1-2회 정도.

**Q: 외부 개발팀이 원격 접근할 수 있는가?**
A: 망분리 정책상 불가. 대신 IT팀을 거쳐야 함.

**Q: PII 마스킹이 소급해서 적용될 수 있는가?**
A: 아니오. 배포 이후 생성된 증거부터만 마스킹됨. 기존 데이터는 수동 검토 필요.

**Q: 재해 복구(DR)는 어떻게 하는가?**
A: Audit trail JSONL를 주기적으로 백업 (별도 암호화 HDD). 복구 시 최신 backup에서 복원.

---

**Last Updated**: 2026-04-13  
**Version**: 1.0  
**Applicable**: sapstack v1.7.0+, Korean financial/government/defense enterprises
