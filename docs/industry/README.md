# 산업별 SAP 운영 가이드 (Industry-Specific SAP Operations Guides)

이 디렉토리는 **한국의 주요 산업 3개 부문**에서 SAP 시스템을 어떻게 운영하는지 설명하는 실무 가이드를 제공합니다.

> **언어**: 모든 문서는 **한국어(Korean)**로 작성되었으며, SAP 기술 용어는 **영문(English)**으로 병기했습니다.  
> **대상**: SAP 운영 담당자, 시스템 관리자, 프로젝트 매니저, 재무/운영 팀장

---

## 📋 가이드 목록

### 1. [제조업 SAP 운영 가이드](./manufacturing.md)
**Manufacturing Industry SAP Operations Guide**

**범위**: 삼성, LG, SK, 현대 등 한국 제조기업의 SAP 운영 패턴

**핵심 모듈**:
- **PP** (Production Planning) — MRP, BOM, 라우팅, 생산스케줄링
- **MM** (Materials Management) — 자재 소요량, 구매, 입고
- **QM** (Quality Management) — 검사 로트, 불량 관리, SPC
- **PM** (Plant Maintenance) — 설비 보전, OEE 추적

**한국 특수성**:
- 산업안전보건법 & 중대재해처벌법
- K-IFRS 제조원가명세서
- 하도급법 (협력사 보호)
- MES 연동 (스마트팩토리)
- 외주/하도급 관리

**라인수**: 497줄 | **섹션**: 8개

---

### 2. [유통업 SAP 운영 가이드](./retail.md)
**Retail & Distribution Industry SAP Operations Guide**

**범위**: 쿠팡, 마켓컬리, 롯데/이마트, GS Retail 등 한국 유통사의 SAP 운영 패턴

**핵심 모듈**:
- **SD** (Sales & Distribution) — 판매오더, 배송, 청구
- **MM** (Materials Management) — 재고 추적, ABC 분석
- **WM/EWM** (Warehouse Management) — 물류센터, 피킹, 분류
- **FI/CO** (Financials & Controlling) — 매출채권, 채널별 손익

**한국 특수성**:
- 이커머스 EDI/IDoc 자동화
- 반품 관리 (7일 이내 환불, 법정 요구)
- DAS (Digital Assorting System) 연동
- POS 실시간 재고 동기화
- 대규모 프로모션 (11.11, 블랙프라이데이) 관리
- 식품 유통: HACCP, 유통기한 Batch 관리
- SAP Commerce Cloud 연동

**라인수**: 702줄 | **섹션**: 7개

---

### 3. [금융업 SAP 운영 가이드](./financial-services.md)
**Financial Services Industry SAP Operations Guide**

**범위**: 은행, 보험, 증권사 등 한국 금융기관의 SAP 운영 패턴

**핵심 모듈**:
- **FI** (Financials) — 일일 재무 거래, 원장 기록
- **CO** (Controlling) — 부서별/상품별 손익, 원가 배부
- **TR** (Treasury & Risk Management) — 자금관리, 헤지회계, VaR
- **BASIS** (System Administration) — 보안, 접근제어, 감시

**한국 특수성**:
- 은행 코어 시스템과 SAP의 역할 분담
- K-SOX (이중승인, SoD, Critical T-code 제한)
- 금융감독원 보고 (경영공시, 건전성)
- K-IFRS 9호 (금융자산), K-IFRS 17호 (보험계약)
- 개인정보보호법 (고객 데이터 마스킹)
- AML (Anti-Money Laundering) 의심거래 보고
- 다통화 회계 (원화/USD/JPY/EUR)
- 연결결산 (자회사 통합)

**라인수**: 859줄 | **섹션**: 8개

---

## 🎯 각 가이드의 구성

모든 가이드는 동일한 구조로 작성되었습니다:

1. **모듈 활성화 매트릭스**
   - 핵심 모듈 (필수, 매일 운영)
   - 보조 모듈 (주 1~2회)
   - 선택 모듈 (전략에 따라)

2. **심화 운영 섹션**
   - 해당 산업의 주요 SAP T코드와 프로세스
   - 한국 기업의 실제 운영 사례
   - 일반적인 오류와 해결책

3. **한국 특수 사항**
   - 대기업/중견/중소 규모별 운영 차이
   - 한국 법규 준수 (산업안전보건법, K-IFRS, 소비자보호법 등)
   - 한국 SI 회사 표준 (삼성SDS, LG CNS, SK C&C 등)

4. **체크리스트**
   - 구축 단계 (프로젝트 초기)
   - 운영 단계 (Go-Live 이후)
   - 규제 준수 (분기/연간)
   - 지속 개선 (Kaizen)

5. **참고 자료**
   - SAP 공식 가이드
   - 한국 법규 및 기관
   - 한국 유명 기업/SI 회사

---

## 💡 사용 방법

### 1. 기본 이해
먼저 **모듈 활성화 매트릭스** 섹션을 읽어 당신의 회사가 어느 모듈을 얼마나 사용하는지 파악합니다.

### 2. 심화 학습
**해당 모듈의 심화 운영** 섹션에서 실제 T코드, 프로세스 흐름, 데이터 구조를 학습합니다.

### 3. 실무 적용
**한국 특수 사항** 섹션에서 당신의 회사 규모/전략에 맞는 운영 방식을 선택합니다.

### 4. 준비 및 점검
**체크리스트**를 사용하여 구축/운영 각 단계에서 빠뜨린 항목이 없는지 확인합니다.

---

## 🔗 다른 문서와의 연결

- [Glossary](../glossary.md) — SAP 용어 사전 (영문 T코드와 한국어 설명)
- [FAQ](../faq.md) — 자주 묻는 SAP 질문
- [Architecture](../architecture.md) — SAP 시스템 아키텍처 개요
- [Kiro Integration](../kiro-integration.md) — AI 기반 SAP 분석 도구

---

## 📊 통계

| 항목 | 제조업 | 유통업 | 금융업 |
|------|--------|--------|--------|
| **문서 크기** | 19 KB | 24 KB | 30 KB |
| **라인 수** | 497줄 | 702줄 | 859줄 |
| **섹션 수** | 8개 | 7개 | 8개 |
| **T코드 샘플** | 20+ | 25+ | 30+ |
| **한국 특수사항** | 6가지 | 7가지 | 9가지 |
| **체크리스트** | 16개 항목 | 17개 항목 | 20개 항목 |

**총합**: 2,058줄, 60+ T코드, 100+ 실무 사례

---

## ⚠️ 주의 사항

1. **일반 가이드**: 이 문서는 **일반적인 운영 모범 사례**를 설명합니다. 당신의 회사 특정 구성(CoA, Cost Center, 회계 정책)은 다를 수 있습니다.

2. **버전 차이**: SAP ECC 6.0과 S/4HANA 간 기능 차이가 있을 수 있습니다. 자세한 내용은 [SAP Notes](https://support.sap.com)를 참고하세요.

3. **법규 변경**: 한국 법규(산업안전보건법, K-IFRS, 금융감시)는 수시로 개정됩니다. 최신 정보는 공식 기관을 확인하세요.
   - 산업안전보건청: www.kosha.or.kr
   - 금융감독원: www.fss.or.kr
   - 개인정보보호위원회: www.pipc.go.kr

---

## 📧 피드백

이 가이드를 사용하면서 오류, 누락, 개선사항을 발견하면 이슈를 제출해주세요.

- **GitHub Issues**: [BoxLogoDev/sapstack/issues](https://github.com/BoxLogoDev/sapstack/issues)
- **이메일**: feedback@sapstack.dev (계획 중)

---

**Last Updated**: 2026-04-12  
**Maintained by**: Claude Code (Backend Development)  
**License**: MIT
