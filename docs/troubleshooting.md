# sapstack 트러블슈팅

> sapstack **자체**의 문제 해결 가이드입니다. SAP 이슈 진단은 에이전트/커맨드에 위임하세요.

## 🔧 설치 & 설정 문제

### "Plugin not found" 에러 (Claude Code)
```
/plugin install sap-fi@sapstack
Error: Plugin not found
```
**해결**:
1. marketplace 추가 확인: `/plugin marketplace list`
2. 없으면 `/plugin marketplace add https://github.com/BoxLogoDev/sapstack`
3. 재시도

### `.sapstack/config.yaml`이 로드되지 않음
**원인**: Claude Code가 파일 존재를 모를 수 있음.
**해결**: 세션 시작 시 명시적으로 "이 프로젝트의 sapstack 설정을 `.sapstack/config.yaml`에서 로드해줘" 지시.

### Git Bash에서 스크립트가 너무 느림
**원인**: Windows Git Bash는 awk 기반 pipeline이 느립니다.
**해결**:
- 로컬에서는 fast path만 사용 (`lint-frontmatter.sh`, `check-marketplace.sh`, `check-tcodes.sh`)
- 느린 스크립트(`check-hardcoding.sh`)는 CI(Linux)에서 검증
- WSL2 고려

---

## 🛡 Quality Gate 실패

### `lint-frontmatter.sh` — "name 필드 누락"
```
❌ [skill] plugins/sap-xx/skills/sap-xx/SKILL.md — name 필드 누락 또는 형식 오류
```
**해결**: 프론트매터 첫 줄에 `name: sap-xx` 추가 (디렉토리명과 일치).

### `lint-frontmatter.sh` — "description 길이"
```
❌ description 길이 1089자 (최대 1024자)
```
**해결**: 설명 축약. `CONTRIBUTING.md`의 description 작성 가이드 참조.

### `check-marketplace.sh` — "SKILL.md 없음"
```
❌ [sap-xx] SKILL.md 없음: plugins/sap-xx/skills/sap-xx/SKILL.md
```
**해결**: marketplace.json의 `id`와 실제 디렉토리 구조(`plugins/<id>/skills/<id>/SKILL.md`)가 일치하는지 확인.

### `check-hardcoding.sh --strict` — 경고 발생
```
⚠️  plugins/sap-xx/.../SKILL.md:42 — 회사코드 하드코딩 의심: BUKRS=KR01
```
**해결**:
- 실제 예시면 `BUKRS=<YOUR_CODE>` 또는 `BUKRS=<KR01 (예시)>` 식으로 명시
- 정규식 예시면 코드 블록(```) 안으로 이동 (scan에서 제외됨)
- 진짜 가짜 양성이면 `scripts/check-hardcoding.sh`의 `ALLOWLIST_KEYWORDS`에 추가

### `check-tcodes.sh --strict` — 미등록 T-code
```
⚠️  [plugins/sap-xx/SKILL.md] 미등록 T-code: XX99
```
**해결**:
1. 정말 T-code인지 확인 (Infotype 번호/프로그램명 아님?)
2. 실제 T-code면 `data/tcodes.yaml`에 추가 (PR 환영)
3. False positive면 `scripts/check-tcodes.sh`의 `FALSE_POSITIVES` 배열에 추가

### `check-ko-references.sh` — 한국어 가이드 누락
```
❌ [sap-xx] 한국어 퀵가이드 누락
```
**해결**: `plugins/sap-xx/skills/sap-xx/references/ko/quick-guide.md` 작성.

### `check-links.sh` — 끊어진 링크
```
❌ [docs/tutorial.md] 끊어진 링크: ../broken.md
```
**해결**: 링크 대상 파일 확인 + 경로 수정. 상대 경로는 현재 파일 기준.

---

## 🧑‍💻 개발 환경

### Bash 스크립트가 Windows에서 `chmod +x` 안 됨
**원인**: Windows NTFS는 Unix 권한 비트가 없음.
**해결**: git이 커밋할 때 자동으로 exec bit 설정. `git update-index --chmod=+x scripts/*.sh`.

### Git Bash에서 한글 출력 깨짐
**해결**:
```bash
export LANG=ko_KR.UTF-8
export LC_ALL=ko_KR.UTF-8
```
또는 Windows Terminal의 `Korean (KS_C_5601-1987)` 프로필 사용.

### YAML 파싱 에러
**원인**: 들여쓰기 불일치, tab 혼용.
**해결**: 에디터에서 공백 4개 들여쓰기 강제, tab 금지.

---

## 🤖 Multi-AI 호환 문제

### Codex CLI가 `AGENTS.md`를 안 읽음
**확인**:
```bash
codex --version  # 최신 버전?
codex --list-context
```
**해결**: Codex CLI 0.19+ 필요. `AGENTS.md`를 프로젝트 루트에 두거나 `--read`로 명시 로드.

### GitHub Copilot이 `copilot-instructions.md`를 인식 못함
**확인**: VS Code GitHub Copilot 확장 최신 버전? Chat에서 "what instructions are loaded?" 질문.
**해결**:
- `.github/copilot-instructions.md` 경로 정확
- GitHub Copilot Chat 재로드 (Ctrl+Shift+P → "Reload Window")

### Cursor가 룰을 적용 안 함
**확인**: Cursor Chat에서 "what rules are active?"
**해결**:
- `.cursor/rules/sapstack.mdc` 존재 확인
- 파일 시작에 `---` frontmatter `alwaysApply: true` 확인
- Cursor 재시작

---

## 🌐 CI 실패

### GitHub Actions CI가 실패
**확인**: `gh run view <run-id> --log-failed` 또는 Actions 탭에서 확인.

**흔한 원인**:
- `chmod +x` 누락 → 워크플로에 `chmod +x scripts/*.sh` 추가됐는지
- jq 누락 → `sudo apt-get install -y jq` 스텝 있는지
- 새 스크립트 추가 후 실행 권한 누락

### 로컬에서는 통과하는데 CI에서 실패
**원인**: Linux vs Git Bash 동작 차이.
**해결**:
- WSL2로 로컬 테스트
- CI 로그에서 정확한 실패 라인 확인
- `set -x` 로 디버그 모드 실행

---

## 📦 릴리스 문제

### `gh release create` 실패
```
HTTP 422: tag_name is not a valid tag
```
**해결**: 태그를 먼저 생성해야 함.
```bash
git tag v1.3.0 HEAD
git push origin v1.3.0
gh release create v1.3.0 --notes-file notes.md
```

### 블록된 명령 (block-dangerous 훅)
**원인**: 릴리스 노트 내용이 훅 regex에 잘못 매칭.
**해결**: `--notes-file` 사용 (heredoc 대신).

---

## 🆘 여전히 해결되지 않음?

1. **에러 로그 전체** 복사
2. **환경 정보** (`bash --version`, `gh --version`, OS)
3. **재현 단계** 명시
4. **[Issues](https://github.com/BoxLogoDev/sapstack/issues)** 등록

또는 [Discussions](https://github.com/BoxLogoDev/sapstack/discussions)에 질문.

## 관련
- [CONTRIBUTING.md](../CONTRIBUTING.md) — 기여 가이드
- [FAQ](faq.md) — 자주 묻는 질문
- [Architecture](architecture.md) — 구조 이해
