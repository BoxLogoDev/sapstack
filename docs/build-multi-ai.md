# build-multi-ai.sh 사용 가이드

> sapstack 호환 레이어(6개 AI 도구)를 자동 동기화하는 스크립트.

## 🎯 목적

sapstack은 Claude Code, Codex CLI, Copilot, Cursor, Continue.dev, Aider 6개 도구를 지원하며, 각 도구는 자체 파일 포맷을 요구합니다. 수동으로 모두 동기화하면 drift가 발생하기 쉽습니다.

`scripts/build-multi-ai.sh`는:
1. **검증**: 호환 레이어 파일 존재, 버전/플러그인 수 일관성
2. **자동 갱신**: `<!-- BEGIN sapstack-auto: stats -->` 블록에 통계 주입
3. **Diff 검출**: 수동 편집과 자동 블록의 충돌 탐지

## 📋 사용법

```bash
# 검증만 (CI 모드)
./scripts/build-multi-ai.sh --check

# 상세 출력
./scripts/build-multi-ai.sh --check --verbose

# 실제 파일 갱신 (로컬 개발자용)
./scripts/build-multi-ai.sh --write
```

## 📦 자동 동기화 블록

아래 파일들에 이 마커를 추가하면 자동 주입 대상이 됩니다:

```markdown
<!-- BEGIN sapstack-auto: stats -->
(자동 생성 영역 — 직접 편집 금지)
<!-- END sapstack-auto: stats -->
```

현재 지원되는 파일:
- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.cursor/rules/sapstack.mdc`
- `.continue/config.yaml`
- `CONVENTIONS.md`
- `README.md`
- `docs/multi-ai-compatibility.md`

## 🔧 동작 원리

### 1. 메타데이터 추출
- `package.json` — 버전
- `plugins/*/` 디렉토리 수 — 플러그인 카운트
- `agents/*.md` — 에이전트 수
- `commands/*.md` — 커맨드 수

### 2. 일관성 검증
- `package.json`·`marketplace.json` 버전 일치
- 플러그인 디렉토리 수 == `marketplace.json` 등록 수
- 6개 호환 레이어 파일 존재 여부

### 3. Sync Block 주입
- `awk`로 BEGIN/END 마커 사이만 교체
- 마커 밖은 수동 편집 보존
- `diff` 비교 후 변경 있을 때만 갱신

## 🔄 CI 통합

`.github/workflows/ci.yml`에서:

```yaml
- name: Build multi-AI compatibility layer (check-only)
  run: ./scripts/build-multi-ai.sh --check
```

Drift가 발견되면 CI 실패 → 개발자가 로컬에서 `--write`로 갱신 후 커밋.

## 💡 확장 (v1.5.0 예정)

- **Plugin list block**: `<!-- BEGIN sapstack-auto: plugin-list -->` — 플러그인 카탈로그 테이블 자동 생성
- **Agent list block**: 서브에이전트 목록 자동 주입
- **Command list block**: 슬래시 커맨드 목록 자동 주입
- **Template-based full generation**: SKILL.md → 각 도구별 완전 재생성

## ⚠️ 주의

- Sync block 밖을 편집하는 것은 **항상 허용** — 스크립트가 touch하지 않음
- Sync block **안은 수동 편집 금지** — 다음 실행 시 덮어씀
- 새 sync block을 원하면 파일에 BEGIN/END 마커를 먼저 추가 후 스크립트 재실행

## 📖 관련
- `scripts/build-multi-ai.sh` — 스크립트
- `scripts/templates/` — 템플릿 (v1.5에서 확장 예정)
- `docs/multi-ai-compatibility.md` — 전체 호환 가이드
