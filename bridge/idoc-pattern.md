# SAP IDoc 통합 패턴

> Intermediate Document — SAP 표준 메시지 교환 형식

## 개요

IDoc은 SAP의 **레거시이지만 여전히 핵심**인 비동기 메시지 형식입니다. ECC와 S/4HANA 모두 광범위하게 사용.

## 표준 IDoc 유형

| IDoc 유형 | 비즈니스 객체 | 방향 |
|----------|------------|------|
| ORDERS05 | 판매 오더 | Inbound (B2B 수주) |
| INVOIC02 | 빌링 / 인보이스 | Outbound |
| ORDRSP04 | 오더 응답 | Outbound |
| DELVRY07 | 출고/배송 | Both |
| MATMAS05 | 자재 마스터 | Both |
| CREMAS05 | 공급업체 마스터 | Both |
| DEBMAS07 | 고객 마스터 | Both |
| PEXR2002 | 지급 advice | Outbound |
| FIDCC2 | FI 전표 | Outbound |
| HRMD_A09 | HR 마스터 | Outbound |

## IDoc 상태 코드

### Inbound (수신)
- **50**: IDoc Added
- **51**: Application document not posted (오류)
- **52**: Application document posted (정상)
- **53**: Application document posted (성공 = 53도 정상 의미)
- **64**: IDoc ready to be passed
- **68**: Error - no further processing

### Outbound (송신)
- **01**: IDoc Created
- **02**: Error passing data to port
- **03**: Data passed to port OK
- **05**: Error during translation
- **12**: Dispatch OK
- **16**: Functional acknowledgement positive

## 진단 T-codes

| T-code | 용도 |
|--------|------|
| WE05 | IDoc 목록 조회 |
| WE02 | IDoc 표시 |
| WE19 | IDoc 테스트 도구 |
| BD87 | IDoc 처리 매니저 |
| WE60 | IDoc 문서화 |
| WE21 | Port 정의 |
| WE20 | Partner Profile |
| BD64 | 모델 분배 정의 |
| SM58 | tRFC 모니터 |
| SM59 | RFC destination |

## sapstack 활용

### IDoc 오류 자동 진단 시나리오

1. **사용자 신고**: "어제부터 EDI 주문이 안 들어와요"
2. **Evidence 수집**:
   - WE05로 최근 24시간 ORDERS05 IDoc 목록 export
   - BD87로 상태 51 IDoc 일괄 조회
   - SM58로 tRFC error 확인
3. **가설**: 부분 마스터 데이터 누락 → 자재 매핑 실패
4. **Verify**: 특정 자재 코드 조회 → MM03에서 확인
5. **Fix + Rollback**:
   - Fix: 해당 자재 마스터 추가, IDoc 재처리 (BD87)
   - Rollback: 신규 자재 삭제 (Transport 경유)

## 공통 오류 패턴

### "Customer not found" (상태 51)
- 원인: KNA1에 EDI 파트너 코드 매핑 누락
- 해결: WE20에서 Partner Profile 확인, KNA1에 EDI 정보 추가

### "Material not maintained" (상태 51)
- 원인: MM01 마스터 누락 또는 판매조직 view 미생성
- 해결: 자재 마스터 보강

### "Tax code not found" (상태 51)
- 원인: 송신 시스템 세금코드와 수신 시스템 매핑 불일치
- 해결: OBYZ 또는 mapping table 보강

## 보안 고려사항

- IDoc 권한: B_ALE_RECV, B_ALE_SEND
- Test mode (WE19) 운영 환경 제한
- 한국 K-SOX: IDoc 처리 audit log 보관

## 한국 현장

- 대기업 EDI: 삼성 SCN, LG SC, 현대 H-Connect 등 자체 표준
- IDoc 변환: SAP CPI 또는 third-party EAI (Webmethods, Tibco)
- 망분리 환경: IDoc Port를 별도 격리된 서버로 분리

## 관련 SAP Note
- 88153: IDoc 처리 일반 가이드
- 1597937: Application status 51 처리
- 1041859: Partner Profile 설정
