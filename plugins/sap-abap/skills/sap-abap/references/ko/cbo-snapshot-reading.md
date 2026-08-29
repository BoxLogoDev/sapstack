# CBO 스냅샷 읽기 플레이북

CBO 스냅샷(커스텀 Z/Y 오브젝트의 오프라인 소스 사본, `docs/cbo-snapshot.md`)을 읽는 표준 전략.
`agents/sap-cbo-explainer.md` 와 Desktop 앱의 스냅샷 guide.md 가 공통 인용하는 단일 원천이다.

> 용어: 이 문서의 CBO = **커스텀 개발 오브젝트(Z*/Y*)**. Clean Core 문서의
> Custom Business Object(키유저 확장, `clean-core-patterns.md`)와 다른 의미다.

## 1. 폴더 계약

```
~/.sapstack/cbo/{SID}/
  manifest.yaml   # 출처·기준일·수집상태 — 답변 전 1회 확인
  catalog.json    # 기계 색인: name → file/type/title/관계
  catalog.md      # 사람용 색인 — grep 전에 항상 여기부터
  guide.md        # 이 스냅샷의 사용 규칙
  src/{패키지}/…  # abapGit 명명 소스
```

권위 있는 파일 경로는 항상 `catalog.file`. 디렉터리 깊이를 가정하지 말 것
(Phase 3 abapGit ZIP 산출물은 중첩 구조일 수 있다).

## 2. abapGit 파일명 규칙

| 파일명 | 정체 | 비고 |
|---|---|---|
| `zfi0171.prog.abap` | 리포트 또는 인클루드 | TADIR PROG — 실행형/인클루드 구분은 catalog `type` |
| `sapmzfi0010.prog.abap` | **모듈풀** (화면 프로그램) | 화면 로직은 PBO/PAI MODULE. T-code는 별도 정의 |
| `saplzfi01.prog.abap` | 함수그룹 메인 인클루드 | `CALL FUNCTION 'Z…'` 구현의 컨테이너 |
| `lzfi01u01.prog.abap` | 함수모듈 본체 include | `FUNCTION z_…` 이 실제로 이 안에 있다 |
| `lzfi01top.prog.abap` | 함수그룹 전역 데이터 | TABLES/DATA 선언부 |
| `zcl_x.clas.abap` | 클래스 본체 | locals/testclasses는 별도 파일 |
| `zcl_x.clas.locals_imp.abap` | 클래스 로컬 구현 | private helper 로직이 자주 숨어 있음 |
| `zif_x.intf.abap` | 인터페이스 | |
| `zc_x.ddls.asddls` | CDS 뷰 | `@EndUserText.label` 이 제목 |
| `zfi01.fugr.json` | 함수그룹 메타 | 본체는 위 sapl*/l* 파일 참조 |

네임스페이스 `/LSITC/X` → 파일명 `#lsitc#x.…` (abapGit 규칙).

## 3. 추적 레시피 (Grep 은 항상 대소문자 무시)

| 코드에서 보이면 | 다음에 갈 곳 |
|---|---|
| `PERFORM foo` | 같은 파일의 `FORM foo` → 없으면 catalog `includes` 의 인클루드들 |
| `PERFORM foo IN PROGRAM zbar` | `zbar.prog.abap` 의 `FORM foo` |
| `INCLUDE zxxx` | catalog에서 ZXXX → 해당 파일 |
| `CALL FUNCTION 'Z_XXX'` | `lz*.prog.abap` 들에서 `FUNCTION z_xxx` 검색 |
| `SUBMIT zjob` | `zjob.prog.abap` (배치 연계) |
| `CALL METHOD` / `zcl_x=>` | `zcl_x.clas.abap` (+ locals_imp) |
| `SELECT … FROM zt…` | 커스텀 테이블 — Phase 1 스냅샷엔 정의(TABL) 없음. 필드 의미는 사용처 코드로 추정하고 그 한계를 명시 |
| `MESSAGE e123(zfi)` | 메시지 클래스 미포함 — 번호와 위치(라인)로 답하고 원문은 SE91 확인 안내 |

### 증상 → 코드 진입점

- **"저장할 때 오류"** (모듈풀): `sapmz*.prog.abap` 에서 `MODULE … INPUT`(PAI) → `CHAIN…ENDCHAIN` → `MESSAGE` 문 순서로 추적
- **"버튼이 안 눌려요"**: PAI 의 `CASE sy-ucomm` / `ok_code` 분기
- **"값이 이상해요"**: 해당 필드에 값을 넣는 `MOVE`/`=`/`SELECT` 를 역추적
- **배치 결과 문의**: `SUBMIT` 체인과 `JOB_OPEN` 호출 확인

## 4. 답변 원칙 (현업 대상)

1. catalog 에 없으면 **"스냅샷에 없습니다"** — 로직 발명 금지 (ETHOS ①)
2. 표준 프로그램(SAPMF05A 등)은 스냅샷 범위 밖임을 명시
3. T-code·화면 이름 중심 + 현장어 병기("전기일(BUDAT)") — `data/synonyms.yaml` 어휘
4. 근거는 `파일:라인`. 코드 인용은 필요한 줄만
5. 답변 끝에 **스냅샷 기준일**(manifest `exported_at`) 고지 — 기준일 이후 변경분은 보이지 않는다
6. 수정 제안은 항상 "담당 개발자 확인 필요" — 이 플레이북은 읽기 전용이다

## 5. Phase 1 한계 (manifest.limitations 와 동기)

- DDIC(TABL/DTEL/DOMA) 정의·화면(DYNP)·메시지클래스·변환 룰 미포함 → abapGit 경로(Phase 3)에서 해소
- 기준일 이후의 트랜스포트 반영분은 스냅샷에 없다
