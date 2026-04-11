# Reusable GitHub Actions Workflow

> 다른 저장소에서 sapstack 품질 게이트를 재사용하는 방법.

## 🎯 목적

sapstack의 7개 품질 게이트를 **자체 SAP 지식 저장소**에서 그대로 활용할 수 있도록 reusable workflow를 제공합니다.

- 예: 회사 내부 SAP 문서 저장소에서 sapstack 규칙 검증
- 예: sapstack을 fork한 개인 저장소에서 CI 재사용
- 예: 여러 프로젝트에서 SAP Universal Rules 일관성 유지

## 📋 기본 사용법

`.github/workflows/ci.yml` 작성:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  sapstack-gates:
    uses: BoxLogoDev/sapstack/.github/workflows/sapstack-ci-reusable.yml@v1.4.0
    with:
      run-strict: true
      check-hardcoding: true
      check-ko-references: false  # 한국어 references 없으면 false
```

## ⚙️ 옵션

| 입력 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `run-strict` | bool | `true` | Strict 모드로 실행 (경고 = CI 실패) |
| `check-hardcoding` | bool | `true` | 하드코딩 검사 실행 |
| `check-ko-references` | bool | `false` | 한국어 references 존재 검증 (sapstack fork 한국 사용자용) |
| `sapstack-ref` | string | `main` | 사용할 sapstack 버전/브랜치/태그 |

## 📦 실행되는 품질 게이트

1. **lint-frontmatter.sh** — SKILL.md/agent 프론트매터 검증
2. **check-marketplace.sh** — marketplace.json 무결성 (파일 있을 때만)
3. **check-hardcoding.sh** — 회사코드·G/L 하드코딩 (옵션)
4. **check-tcodes.sh** — T-code 레지스트리 (data/tcodes.yaml 있을 때만)
5. **check-ko-references.sh** — 한국어 references 존재 (옵션)
6. **check-links.sh** — 내부 markdown 링크 유효성

## 🔀 고급 사용법

### 여러 버전 매트릭스 테스트
```yaml
jobs:
  test-against-versions:
    strategy:
      matrix:
        sapstack-version: [v1.3.0, v1.4.0, main]
    uses: BoxLogoDev/sapstack/.github/workflows/sapstack-ci-reusable.yml@main
    with:
      sapstack-ref: ${{ matrix.sapstack-version }}
```

### 관대 모드 (warning only)
```yaml
jobs:
  sapstack-gates:
    uses: BoxLogoDev/sapstack/.github/workflows/sapstack-ci-reusable.yml@v1.4.0
    with:
      run-strict: false
```

### 선택적 게이트
```yaml
jobs:
  sapstack-gates:
    uses: BoxLogoDev/sapstack/.github/workflows/sapstack-ci-reusable.yml@v1.4.0
    with:
      check-hardcoding: false  # 이 repo는 하드코딩 예시가 많아서 스킵
```

## 🛡 보안

- **No secrets passing** — reusable workflow는 caller의 secrets에 접근 안 함
- **Fixed sapstack ref** — `@v1.4.0` 같은 태그로 고정하면 무단 변경 차단
- **Isolated checkout** — caller와 sapstack이 별도 디렉토리에 체크아웃

## ⚠️ 주의사항

- **Caller 저장소 구조**가 sapstack과 유사해야 일부 스크립트가 의미 있음 (예: `plugins/*/SKILL.md`)
- **sapstack-ref를 `main`으로** 고정하면 breaking change 위험 — **항상 태그 사용 권장**
- GitHub Actions `reusable workflow`는 같은 branch 제한 없음 — public repo 간 자유롭게 호출 가능

## 💡 sapstack 자체 CI와의 관계

sapstack 저장소의 `.github/workflows/ci.yml`은 이 reusable workflow를 **호출하지 않습니다**. 내부 CI는 sapstack 자체 체크아웃을 사용하며, reusable는 **외부 저장소 전용**입니다.

## 📖 관련
- `.github/workflows/sapstack-ci-reusable.yml` — reusable workflow 본체
- `.github/workflows/ci.yml` — sapstack 자체 CI (별도)
- `CONTRIBUTING.md` — 기여 가이드
