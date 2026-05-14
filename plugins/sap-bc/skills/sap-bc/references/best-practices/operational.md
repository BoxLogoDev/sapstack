# 한국 BC 일상 운영 (Tier 1) Best Practice

> 한국 BC(Basis Components) 컨설턴트 관점. SAP Basis 표준 + 한국 특화(K-SOX·망분리·전자세금계산서·Solman Korea).

## 적용 범위
- **ECC**: ✓ / **S/4 HANA**: ✓
- **한국 특화**: ⭐⭐⭐⭐⭐ (전적)

## 일간 운영 (KST 기준)

### KST 시차 고려
- 미주·유럽 본사와 협업 시 KST 잡 스케줄 정렬
- 한국 영업일 09:00 시점에 USA·DE 시스템 영향 사전 점검

### 한국 특화 모니터링
- [ ] **STMS Korea route** — 한국 시스템 전용 트포 라우팅
- [ ] **국세청 e-Tax invoice 인터페이스** — 인증서 정상
- [ ] **사회보험 EDI 인터페이스** — 4대보험 전송 큐
- [ ] **K-Bank 인터페이스** — 자동이체·계좌이체

## 주간

### Solman Korea
- [ ] **Solman 대시보드** — 한국 인스턴스 상태
- [ ] 한국어 에러 메시지 분류·집계
- [ ] 운영자 KT/이관 일지

### 정부 시스템 연동
- [ ] 국세청 인증서 만료일 점검 (STRUST)
- [ ] 4대보험 EDI 인증서 점검
- [ ] 전자세금계산서 전송 성공률 (월 평균 > 99%)

## 한국 특화 인프라

### 망분리 환경
- 외부 RFC: 모든 외부 통신 보안 게이트웨이 경유
- 인터넷 분리: PRD는 인터넷 직접 접근 금지
- DMZ Gateway: SMGW 별도 구성·모니터링

### 한국어 인코딩
- UTF-8 통일 (CP949는 legacy 시스템만)
- SAP GUI Korean 폰트 일관성
- 메시지 클래스 KO 활성 (SMLT)

## 운영자 도구

| 도구 | 용도 |
|---|---|
| Solman Korea | 한국 특화 모니터링 통합 |
| Korea SAP User Group portal | 정보 공유 |
| SAP Note 검색: language=KO | 한국어 KBA 우선 |

## 연관 문서
- `period-end.md`, `governance.md`
- `../../../sap-basis/skills/sap-basis/references/best-practices/operational.md`
