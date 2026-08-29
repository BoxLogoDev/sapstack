# 코드 스냅샷 패턴 (abapGit / CBO Snapshot)

> Layer 1 데이터 수집 패턴 — RFC·OData·IDoc·CPI 에 이은 여섯 번째.
> 대상 데이터가 "업무 데이터"가 아니라 **커스텀 ABAP 소스(CBO, Z/Y 오브젝트)** 라는 점이 다르다.
> 운영 런북: `docs/cbo-snapshot.md` · 소비(질문) 측: `plugins/sap-abap/skills/sap-abap/references/ko/cbo-snapshot-reading.md`

## 언제 쓰나

- 현업/AI가 **SAP 접속·개발 권한 없이** 커스텀 코드 내용을 조회·질문해야 할 때
- 망분리·폐쇄망 환경에서 코드 근거가 필요한 진단(Evidence Loop)을 돌릴 때
- ADT 라이브 브리지(`docs/adt-bridge.md`, Layer 0)의 **오프라인 보완재** — 대체가 아니다

## 3-Phase 수집 전략

| Phase | 방식 | SAP측 전제 | 얻는 것 |
|---|---|---|---|
| **1 (기본)** | `vsp lua` 순수 ADT 소스 덤프 (`scripts/cbo/export-cbo.mjs`) | 없음 (ADT 활성 + 조회 계정) | PROG/CLAS/INTF/INCL/DDLS/BDEF/SRVD 소스 텍스트. FUGR 은 sapl*/l* include 로 |
| **2 (배치)** | Windows 작업 스케줄러 주기 실행 (`scripts/cbo/register-task.ps1`) | 상동 | 신선도 자동 유지 + 스냅샷 git 이력 |
| **3 (완전)** | 패키지별 `vsp export` → abapGit ZIP | **abapGit 개발자판 + ZADT_VSP** 설치 (고객사 협의) | 158개 타입(TABL·DYNP·MSAG 포함) + XML 메타 |

Phase 가 올라가도 **폴더 계약은 동일** — 소비 측은 무수정.

> **Phase 3 실측 한계 (설계 전 필독)**: vsp `GitExport` 는 1회 호출당 **약 150 오브젝트 /
> 120초** 수준에서 한계가 관측됐고, 직렬화 실패는 **무음 스킵**된다(오류 없이 파일만 빠짐).
> 따라서 Phase 3 exporter 는 단일 호출이 아니라 **패키지별 분할 루프 + manifest 대조식
> (`objects_found = files_written + failures`) 검증**으로 설계해야 한다.

### 현업 도달 채널 (소비 측 배포)

| 채널 | 생산자 | 소비자 | 비고 |
|---|---|---|---|
| 앱 배포 동봉 | `make-distribution.ps1` | exe 인접 `cbo/` 자동 임포트 | 최초 배포 |
| 공유폴더 게시 | `register-task.ps1 -Publish unc` | `cbo.share_roots` 기동 시 스캔 → 로컬 복사 | 지속 갱신 권장. 공유는 읽기 전용 |
| 스냅샷 ZIP | `make-distribution.ps1 -SnapshotOnly` | 설정 > "ZIP에서 가져오기" | 공유 접근 없는 사용자 폴백 |
| (예정) 원격 아카이브 풀 | abapGit push 또는 관리자 git push | 앱이 HTTPS 아카이브 다운로드 (`manifest.method: git-remote`) | 고객사 협의 후 — "remote 없음" 보안 속성을 의도적으로 완화하므로 사내망·읽기 전용 토큰 한정 |

## 폴더 계약 v1

```
~/.sapstack/cbo/{SID}/
  manifest.yaml   # 출처·기준일·대조식·한계 (아래 스키마)
  catalog.json    # 기계 색인 — name/type/package/file/title/관계
  catalog.md      # 사람·에이전트용 색인 (grep 전 필독)
  guide.md        # 이 스냅샷의 사용 규칙 (Desktop 로컬 소스의 guide 로 그대로 사용)
  meta/           # pii-report.json, failures.json
  src/{패키지}/…  # abapGit 명명 소스 파일
  .git/           # 로컬 이력 (remote 없음 — 델타·복원용)
```

- 오브젝트의 권위 있는 경로는 항상 `catalog.file` (디렉터리 깊이 가정 금지)
- `manifest.method` = `adt-source` | `abapgit-zip` | `git-remote` 로 생산자 식별

### manifest 필수 키 (`sapstack-cbo-manifest/v1`)

`sid, client, landscape_role, exported_at, exported_by{sap_user,os_user}, method,
tool{name,version,binary_sha256}, packages[]{name,objects_found,files_written,failures},
totals, status(complete|partial|failed), freshness{staleness_warn_days}, scrub, limitations[]`

**대조식**: 모든 패키지에서 `objects_found = files_written + failures` 가 성립해야 한다.
vsp 의 직렬화 실패는 무음 스킵이므로 이 식이 유일한 탐지 장치다.

## 보안 모델

| 장치 | 효과 |
|---|---|
| 패키지 가드 `^[$ZY]` (스크립트 강제) | 표준 SAP 소스 export 원천 차단 |
| PRD 기본 거부 (`--allow-prd` 필요) | 운영 직접 수집 방지 |
| 조회 전용 SAP 계정 (S_DEVELOP ACTVT 03) | vsp export 경로에 안전 플래그가 **적용되지 않으므로** 계정 권한이 실질 경계 |
| PII 스크럽: 주민번호·카드·사업자번호 마스킹 / 계좌·연락처·비밀번호 의심은 리포트 | 한글 주석 오탐 보호 — 배포 전 `meta/pii-report.json` 검토 필수 |
| 스냅샷 git remote 없음 + repo 트리 밖 저장 | 소스 유출 경로 차단, check-hardcoding 게이트와 무충돌 |
| `manifest.exported_by` | K-SOX 감사용 수집 주체 기록 |

## 알려진 한계 (Phase 1)

- TABL/DTEL(DDIC 정의)·화면(DYNP)·메시지클래스 미포함 → 코드 사용처로 의미를 추정하고 한계를 명시
- 델타 없음(매회 전체 재수집) → 스냅샷 로컬 git 이 이력·복원 담당
- `$TMP` 등 $ 패키지의 비 Z/Y 이름 오브젝트는 이름 우주(Z*/Y*/SAPM*/SAPL*/L*)에 안 잡힌다
- 기준일 이후 트랜스포트 반영분은 보이지 않는다 — 모든 답변에 기준일 고지
