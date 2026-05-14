# 의료·헬스케어 산업 SAP 운영 가이드

> 병원·의료기기·헬스케어 서비스. IS-H (Industry Solution Healthcare), 환자 청구, HIPAA·PIPA 등 개인정보 보호 핵심.

## 1. 산업 특성

| 속성 | 의료/헬스케어 |
|---|---|
| **운영 단위** | 환자 (Case) — 다중 서비스 통합 |
| **규제** | HIPAA / PIPA / 의료법 / 식약처 |
| **수익원** | 보험 청구 + 본인부담 — 복잡한 정산 |
| **재고** | 의약품·소모품·임플란트 (Lot/Serial) |
| **시간 민감도** | 응급·중환자 — 실시간 |

## 2. 핵심 SAP 모듈

| 모듈 | 활용 |
|---|---|
| **IS-H** | Industry Solution Healthcare (환자·진료·청구) |
| **MM** | 의약품·의료기기 조달 |
| **FI** | 보험·환자 청구 + 정산 |
| **HCM** | 의료진·간호사·행정직 |
| **QM** | 의료기기 품질·교정 (Calibration) |
| **EHS** | 방사선·화학물질 안전 |

## 3. IS-H (Industry Solution Healthcare)

### 3.1 환자 마스터
- **NPTAB**: Patient Master
- **NPVS**: Visit Schedule
- **NIN1**: Patient Admission
- **NEDR**: Emergency Registration

### 3.2 진료 흐름
```
1. 환자 등록 (NEDR/NIN1)
2. Visit 생성 (NPVS)
3. 진료 서비스 기록 (Service Documentation)
4. 처방·검사 발행
5. Insurance Verification
6. 청구서 발행 (Patient Billing)
7. 보험 청구 (Claim Submission)
8. 정산
```

### 3.3 청구 (Patient Billing)
- **N9CR**: Case (case-based billing)
- DRG (Diagnosis Related Group) 기반 정산
- 한국: NHIS (국민건강보험) DRG

## 4. 의약품·의료기기 관리

### 4.1 Lot/Serial 관리
- 모든 의약품 batch 추적 (FEFO)
- 임플란트 serial 단위 추적
- Recall 능력 필수

### 4.2 핵심 T-code
- **MIGO**: 입출고 (batch 입력)
- **MSC1N/2N/3N**: Batch 마스터
- **VFP1**: Period-end 의약품 stock

## 5. 의료기기 (Medical Device)

### 5.1 라이프사이클
- 도입·등록 (UDI - Unique Device Identification)
- 교정 (Calibration) 일정
- 사용·유지보수
- 폐기·교체

### 5.2 SAP 지원
- **PM** (Plant Maintenance): 의료기기 maintenance plan
- **QM**: Calibration inspection
- **CS**: Customer Service for device

## 6. 한국 의료 환경

### 의료법·식약처
- 의료기기 — 식약처 인증 (1·2·3등급)
- 의약품 안전관리정보(KAERS): 부작용 보고
- 처방·조제 — 의약품관리종합정보센터(KPIS)

### 건강보험 (NHIS)
- **DRG 정산**: 7개 질병군 (백내장·맹장 등)
- **포괄수가제** vs **행위별 수가제**
- **EDI 청구**: 정부 시스템 인터페이스

### 의료 데이터 보호 (PIPA + HIPAA-like)
- 환자 정보 최소 수집·암호화 보관
- 동의 의무·열람 권리
- 데이터 위반 시 신고 (24시간)

## 7. 자주 마주치는 이슈

### Patient Master Duplicate
- 원인: 동일 환자 다른 ID로 재등록
- 해결: NPTAB → Merge → audit log

### Insurance Verification Fail
- 원인: 보험사 시스템 동기화 안 됨
- 해결: NHIS EDI 채널 / 보험사 API 점검

### DRG 정산 오류
- 원인: ICD-10 코드 부정확 / 시술 코드 누락
- 해결: 청구 사전 검증 → 코드 정합성 도구

### Recall 발생 시 영향 환자 식별
- 원인: Lot/Serial 추적 미흡
- 해결: NPTAB Patient Allergy + Medication History → 영향 환자 식별

## 8. 다국적 헬스케어 그룹

- 본사 + 해외 병원 (예: 미국·유럽·동남아)
- 환자 정보 cross-border (PIPA·GDPR·HIPAA 모두 준수)
- DRG 차이 (국가별)
- 의료진 자격 인증 (국가별 라이선스)

## 9. 관련 SAP Note

- 2010023 — IS-H Configuration Best Practices
- 2701231 — Patient Master Data Management
- 3010256 — Healthcare GDPR/HIPAA Configuration

## 10. 연관 sapstack 모듈

- `sap-fi` — 보험·청구·정산
- `sap-mm` — 의약품·기기 조달
- `sap-pm` — 의료기기 maintenance
- `sap-qm` — Calibration·Quality
- `sap-hcm` — 의료진 관리

## 11. Out of Scope

- 임상시험 (별도 IS-CRO 또는 외부 시스템)
- 진단 영상 (PACS·DICOM 별도)
- 원격 진료 (Telemedicine 별도 플랫폼)
- 의료 AI (별도 BTP/SAC 활용)
