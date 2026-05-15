# SAP Analytics Cloud (SAC) 구성 가이드 개요

> SAC는 BTP SaaS — 전통 SPRO IMG 없음. 구성은 **SAC 테넌트 UI**
> (System → Administration / Connections), **Data Provisioning Agent**,
> 소스 측 S/4·BW 서비스 활성화로 수행합니다.

## 가이드 목록

| 가이드 | 주제 | 대상 |
|---|---|---|
| `connection-setup.md` | Live vs Import Connection / CORS / DPA / SAML SSO | SAC 관리자 |
| `model-story-governance.md` | Data Model / Story / Analytic Privilege / 권한 | 모델러 |
| `planning-data-locking.md` | Planning Model / Version / Data Locking Task | Planning 관리자 |

## 공통 선행 조건

- SAC 테넌트 프로비저닝 (BTP / 별도 SAC 라이선스)
- 소스 시스템(S/4·BW) 버전·서비스 확인
- Live: 소스 측 InA/OData 서비스 + CORS, Import: DPA 설치
- SAML2 IdP trust (SSO 사용 시)

## ECC vs S/4HANA vs Cloud

- **Live Connection**: S/4HANA / BW/4HANA (InA), 데이터 미복제
- **Import Connection**: BW, S/4, 비-SAP — DPA 경유 복제
- ECC 직접 Live 미지원 → BW 경유 또는 Import

## 참조

- `../ko/quick-guide.md` — SAC 한국어 퀵가이드
- `../../../sap-integration-cloud/skills/sap-integration-cloud/references/img/` — Datasphere/CPI
