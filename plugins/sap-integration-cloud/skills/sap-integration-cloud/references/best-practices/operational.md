# Integration Cloud 일상 운영 (Tier 1) Best Practice

## 적용 범위
- **S/4 HANA**: ✓
- **ECC**: ✓ (SOAP/IDoc/SLT)
- **한국 특화**: ✓ (PG사 연동, 망분리, EDI)

---

## 체크리스트

### 📊 일간 (Daily) 운영

#### CPI 메시지 처리
- [ ] **Integration Suite → Monitor → Message Processing**
  - 왜: iFlow 실패 누적 → 연동 전반 마비
  - 빈도: 일간 (오전 + 오후)
  - 담당: 통합 운영자
  - 확인항목: Failed 0, retry 적체 없음, Exception subprocess 정상 처리

#### Datasphere Replication
- [ ] **Datasphere Monitor + 소스 ODQMON**
  - 왜: delta queue 적체 → 데이터 지연
  - 빈도: 일간
  - 담당: 데이터 엔지니어
  - 확인: replication flow 성공, ODQMON 적체 없음, LTRC job 정상

#### Cloud Connector / Connectivity
- [ ] **Cloud Connector status GREEN + Destination check**
  - 왜: 터널 다운 시 온프레 연동 전면 중단
  - 빈도: 일간
  - 담당: BTP 관리자

#### IDoc 어댑터
- [ ] **WE20/IDX2 + CPI IDoc 채널 상태**
  - 확인: tRFC/qRFC 큐 락 없음, partner profile 정상

### 📅 주간 (Weekly) 운영

- [ ] 인증서/secret 만료 임박 목록 (Security Material, SAML, OAuth)
- [ ] iFlow 성능 — 처리 지연 메시지 식별
- [ ] 신규/변경 iFlow 배포 검토 (Q→P)

## 한국 현장 체크
- 한국 PG사(토스페이/KG이니시스) 연동 iFlow 인증서 만료 모니터
- 망분리 환경 Cloud Connector location ID 정상
- 한국 EDI 사업자 IDoc 포맷 합의 버전 일치

## 관련 참조
- `../img/cpi-iflow-setup.md` / `../img/datasphere-replication.md`
- `period-end.md` / `governance.md`
