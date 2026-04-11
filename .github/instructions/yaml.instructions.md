---
applyTo: "**/*.yaml,**/*.yml"
---

# YAML Instructions (GitHub Copilot)

이 파일은 YAML 파일을 편집할 때 적용되는 지침입니다.

## sapstack 프로젝트 내 YAML 파일

### `.claude-plugin/marketplace.json` (JSON이지만 관련)
- 플러그인 엔트리 필수 필드: `id`, `name`, `version`, `description`, `path`, `keywords`, `compatibility`
- `id`는 디렉토리명(`plugins/<id>`)과 일치해야 함
- 버전은 SemVer
- `description`은 1024자 이하

### `data/tcodes.yaml`
- 확정된 SAP T-code만 등록 (추측 금지)
- 엔트리 형식:
  ```yaml
  TCODE_NAME:
    name: "한 줄 영문 설명"
    modules: [FI, CO]
    release: both | ecc_only | s4_only
    note: 선택적 부가 정보
  ```
- 새 T-code 추가 전 SAP Help Portal에서 존재 확인

### `data/sap-notes.yaml`
- 확인된 SAP Note 번호만 (SAP Support Portal에서 검색 가능해야 함)
- 엔트리 형식:
  ```yaml
  - id: "1234567"
    title: "Note 제목"
    keywords: [영문, 한국어]
    modules: [FI, CO]
    release: both | ecc_only | s4_only
    category: migration | korea | dump | config | performance | security
    url: https://launchpad.support.sap.com/#/notes/1234567
  ```

### `.sapstack/config.example.yaml`
- 사용자가 복사해 `.sapstack/config.yaml`로 사용
- 모든 민감 값은 **placeholder**로 표기:
  - `<YOUR_COMPANY_CODE>`
  - `<YOUR_SID>`
  - `<YOUR_CLIENT>`
- 실제 값을 예시에 박지 말 것
- `.sapstack/config.schema.yaml`로 검증됨 (v1.3.0 신규)

### GitHub Actions (`.github/workflows/*.yml`)
- `actions/checkout@v4` 사용
- `jq` 필요 시 `sudo apt-get install -y jq`
- 스크립트 실행 전 `chmod +x scripts/*.sh`
- 린터 실패 시 명확한 에러 메시지

## 하드코딩 금지
YAML 예시에 회사코드·G/L 계정·조직 단위 고정값을 넣지 마세요. Placeholder나 명확한 예시용 더미값(`<YOUR_...>`)을 사용하세요.

## 검증
```bash
./scripts/check-marketplace.sh
./scripts/check-tcodes.sh --strict
./scripts/validate-config.sh   # v1.3.0 신규
```
