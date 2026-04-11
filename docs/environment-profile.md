# Environment Profile — 환경 프로필 시스템

> sapstack의 **지속성 있는 컨텍스트(Context Persistence)** 핵심 메커니즘

## 🎯 왜 필요한가?

sapstack의 SKILL.md와 서브에이전트는 모두 "환경 인테이크 선행" 원칙을 따릅니다:

> 답변 전에 SAP 릴리스·배포 모델·회사코드·회계연도 변형 등을 반드시 확인한다.

이 원칙은 **정확성의 핵심**이지만, 세션마다 같은 질문을 반복하면 사용자 경험이 나빠집니다. **환경 프로필**은 이 반복을 제거합니다:

- 프로젝트 루트에 `.sapstack/config.yaml` 1회 설정
- 이후 모든 sapstack 산출물이 이 파일을 자동 참조
- 환경이 바뀌면 파일만 수정

---

## 📁 파일 위치

```
your-project/
├── .sapstack/
│   └── config.yaml         ← 사용자가 작성 (gitignore 대상)
├── src/
└── ...
```

템플릿은 sapstack 저장소의 [`.sapstack/config.example.yaml`](../.sapstack/config.example.yaml)을 참고하세요.

---

## 🚀 사용법

### 1. 초기 설정

```bash
# 프로젝트 루트에서
mkdir -p .sapstack
curl -o .sapstack/config.example.yaml \
  https://raw.githubusercontent.com/BoxLogoDev/sapstack/main/.sapstack/config.example.yaml
cp .sapstack/config.example.yaml .sapstack/config.yaml

# 민감 정보 보호
echo ".sapstack/config.yaml" >> .gitignore
```

그다음 `.sapstack/config.yaml`을 에디터로 열어 실제 값으로 채웁니다.

### 2. Claude Code에서 활용

Claude Code 세션 시작 시 단 한 번 다음처럼 지시합니다:

```
이 프로젝트의 SAP 환경 프로필을 .sapstack/config.yaml에서 로드하고,
이후 모든 SAP 관련 질문에서 이 정보를 기본 맥락으로 사용해.
```

Claude Code는 파일을 Read로 읽고, 이후 sapstack의 SKILL·에이전트·커맨드를 호출할 때 환경 인테이크 질문을 생략합니다.

### 3. 서브에이전트 위임 시

```
/sap-s4-readiness --auto
```

이 명령이 `sap-s4-migration-advisor` 서브에이전트로 위임될 때, 에이전트는 자동으로 `.sapstack/config.yaml`을 참조해 시스템 정보·회사코드·한국 localization 여부를 수집합니다. 사용자가 같은 질문을 받지 않습니다.

---

## 🔧 필드 레퍼런스

### `system`
| 필드 | 설명 | 예시 |
|------|------|------|
| `release` | SAP 릴리스 | `S4HANA_2023` |
| `deployment` | 배포 모델 | `on_premise` / `rise` / `cloud_pe` |
| `database` | DB 종류 | `hana` / `oracle` / `db2` |
| `kernel` | Kernel 레벨 | `"7.89"` |
| `unicode` | Unicode 여부 | `true` |

### `organization`
| 필드 | 설명 | 비고 |
|------|------|------|
| `primary_company_code` | 주 회사코드 | **하드코딩 금지** — 사용자 실제 값 |
| `fiscal_year_variant` | 회계연도 변형 | 한국 `K4`(달력) 기본 |
| `local_currency` | 현지통화 | `KRW` |
| `group_currency` | 그룹 통화 | 연결재무제표 |
| `accounting_standard` | 회계기준 | `K_IFRS`(한국 상장사) |
| `industry` | 산업 섹터 | 답변 맥락 조정용 |

### `landscape`
Transport 경로 — DEV → QAS → STG → PRD.
한국 대기업은 STG 단계가 있고 중견 이하는 없을 수 있습니다 — 없으면 해당 블록을 삭제하세요.

### `korea`
한국 Localization 플래그. 이 블록이 활성화되면 sapstack은 자동으로:
- 전자세금계산서 연동 이슈를 맥락에 포함
- K-SOX 감사 흔적 요구사항 적용
- CVI KR 특수 설정 고려

### `project`
현재 프로젝트 국면(`phase`)에 따라 응답 초점이 달라집니다:
- `run_operation`: 운영 이슈 해결 중심
- `new_implementation`: 구축 베스트 프랙티스
- `migration`: S/4HANA 전환 전용 (sap-s4-migration-advisor 연계)
- `upgrade`: EhP/릴리스 업그레이드

### `preferences`
| 필드 | 효과 |
|------|------|
| `language: ko` | 모든 답변 한국어 |
| `verbosity: verbose` | 교육용 상세 설명 |
| `include_menu_path: true` | T-code와 함께 SPRO 경로 |
| `only_confirmed_notes: true` | SAP Note는 확실한 것만 |

---

## 🛡 보안 가이드

- `.sapstack/config.yaml`은 **반드시 gitignore**하세요.
- `primary_company_code`, `landscape.*.sid`는 조직 식별 정보입니다.
- 공개 저장소에는 `config.example.yaml`만 커밋하세요.
- 팀 공유가 필요하면 내부 문서 시스템(Confluence 등) 사용 권장.

---

## 🔄 업데이트 워크플로

환경이 바뀌면 파일만 수정합니다:

1. **릴리스 업그레이드** → `system.release` 값 변경
2. **마이그레이션 시작** → `project.phase: migration` + `project.migration_path` 추가
3. **새 회사코드 추가** → `organization.primary_company_code` 유지 + 주석으로 보조 회사코드 기록

---

## ❓ FAQ

**Q. 회사코드가 여러 개인데?**
A. `primary_company_code`에 주 코드를 적고, 이슈별로 사용자가 지정하도록 두세요. sapstack은 "primary 기준 설명 + 필요 시 차이점 언급" 패턴입니다.

**Q. 복수 프로젝트를 동시에 다루면?**
A. 각 프로젝트 루트에 별도의 `.sapstack/config.yaml`을 두고 Claude Code 세션을 분리하세요.

**Q. 환경 프로필이 없으면 어떻게 동작하나?**
A. sapstack은 이전과 동일하게 "매 질문마다 환경 인테이크" 모드로 동작합니다. 프로필은 **선택사항**이며, 정확성에는 영향 없고 UX만 개선합니다.
