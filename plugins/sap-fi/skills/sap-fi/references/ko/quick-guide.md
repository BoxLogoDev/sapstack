# sap-fi 한국어 퀵가이드

> 한국 현장 FI 컨설턴트용 요약. 세부 내용은 영문 `SKILL.md`와 `references/closing-checklist.md`, `references/tcode-reference.md` 참조.

## 🔑 환경 인테이크 (질문 순서)
1. SAP 릴리스 (ECC EhP / S/4HANA 연도)
2. 배포 모델 (On-Premise / RISE / Cloud PE)
3. 회사코드 (사용자 제공, 추정 금지)
4. 회계연도 변형 (한국은 보통 K4 = 1~12월)
5. 에러 메시지 (클래스.번호) + T-code

## 📚 모듈별 핵심

### AP (채무)
- **FB60/MIRO** 포스팅 오류
  - 세금코드 미할당 → **FTXP** 확인
  - Tolerance 초과 → **OMR6** 한도 조정
  - GR 기반 IV 불일치 → PO 항목 Invoice 탭 확인
- **F110** 지급실행
  - 지급방법 미등록 (LFB1.ZWELS)
  - House Bank 결정 실패 → **FBZP**
  - DME 미생성 → **DMEE** 트리 확인 (한국 은행별 포맷 다름)
- **원천세 (KR 특화)** — 사업소득·기타소득·사업자등록번호별 설정

### AR (채권)
- **FD32 (ECC) / UKM_BP (S/4 FSCM)**: 여신관리
- **F150** 독촉 → **FBMP** 독촉절차
- **VKM1/VKM3**: 여신 Block 해제

### AA (자산)
- **AFAB** 감가상각 — **반드시 Test Run 먼저**
- **ABAVN**: 자산 폐기
- **AJAB**: 연말 마감 (연결산 전용)

### GL
- 필드 상태 충돌: **OBC4** (문서유형) + **OB14** (Posting Key) + **FS00** (계정) — 가장 제한적 규칙 적용
- **FAGL_FC_VAL**: 외화평가 (한국은 원화 기준, 환율일자 주의)
- **F.13**: GR/IR 청소 — Test Run 필수

## 🇰🇷 한국 특화 주의사항

| 항목 | 내용 |
|------|------|
| **K-IFRS** | 한국채택국제회계기준 — 상장사 필수. GAAP 전환 주석 |
| **월결산** | 대기업 월 5~7일 차 마감 엄격 (OB52 관리) |
| **원화 소수점** | KRW는 소수점 없음 — 외화 환산 시 반올림 규칙 확인 |
| **전자세금계산서** | 법인 의무 (부가가치세법) — SAP DRC 또는 3rd-party 연동 |
| **원천세** | 사업소득/기타소득/근로소득별 자동 분개 |
| **K-SOX** | 상장사 내부통제 — 분개입력자 ≠ 승인자 |

## ⚠️ 금지 사항
- ❌ 운영 환경에서 **SE16N** 데이터 직접 수정
- ❌ 회사코드 고정값 답변 (사용자 제공값 그대로 사용)
- ❌ AFAB/F.13/FAGL_FC_VAL을 Test Run 없이 실행 권장
- ❌ ECC와 S/4HANA 동작 혼용 설명

## 🤖 서브에이전트 위임
복잡한 FI 이슈는 `sap-fi-consultant` 서브에이전트에 위임하세요:
```
/sap-fi-closing 월결산 <회사코드>
/sap-payment-run-debug <벤더번호>
```

## 📖 관련 T-code
`references/tcode-reference.md` 참조.
