# Pull Request

## 📝 변경 사항 요약
이 PR이 무엇을 바꾸는지 2-3문장으로 설명.

## 🎯 변경 유형
- [ ] 🐛 버그 수정
- [ ] ✨ 새 기능 (SKILL.md, agent, command, script)
- [ ] 📚 문서 개선
- [ ] 🌐 한국어 번역 / 지역화
- [ ] 🧹 리팩토링 / 정리
- [ ] 🔒 보안 개선
- [ ] ⚙️ CI / 빌드

## 🧩 영향 범위
- 영향받는 모듈: (예: sap-fi, sap-abap)
- 신규 파일:
- 수정 파일:
- 삭제 파일:

## ✅ 품질 게이트 (로컬 실행 결과)

**모든 항목이 통과해야 머지 가능합니다.**

```bash
./scripts/lint-frontmatter.sh
# [결과 붙여넣기]

./scripts/check-marketplace.sh
# [결과 붙여넣기]

./scripts/check-hardcoding.sh --strict
# [결과 붙여넣기]

./scripts/check-tcodes.sh --strict
# [결과 붙여넣기]

./scripts/check-ko-references.sh
# [결과 붙여넣기]

./scripts/check-links.sh
# [결과 붙여넣기]

./scripts/build-multi-ai.sh --check
# [결과 붙여넣기]
```

## 🔍 Universal Rules 준수 확인

- [ ] 회사코드·G/L 계정·조직 단위 **하드코딩 없음**
- [ ] **ECC vs S/4HANA** 차이가 명시되었습니다 (해당 경우)
- [ ] **Transport request** 필요성이 설명되었습니다 (config 변경인 경우)
- [ ] **Test Run 선행** 권장이 포함되었습니다 (destructive 작업인 경우)
- [ ] **SE16N 금지** 원칙 준수 (운영 환경)
- [ ] **T-code + 메뉴 경로** 모두 제공
- [ ] **SAP Note** — `data/sap-notes.yaml` 등록된 번호만 언급

## 🇰🇷 한국어 / Localization 체크

- [ ] 신규 에이전트/커맨드/docs는 **한국어**로 작성했습니다
- [ ] SKILL.md 본문은 **영문 유지** (키워드 매칭 일관성)
- [ ] 한국어 references (`references/ko/`) 있음 또는 불필요
- [ ] 개인정보 (주민번호, 연락처 등) 예시에 사용 안 함

## 📖 관련 이슈
Closes #
Related: #

## 📸 스크린샷 (해당 시)

## 📝 추가 맥락
- 참고한 SAP Help / Note / 블로그
- 디자인 결정의 이유

## ✅ 최종 체크리스트

- [ ] `CONTRIBUTING.md` 절차를 따랐습니다
- [ ] 로컬 품질 게이트 모두 통과했습니다
- [ ] CHANGELOG.md에 엔트리 추가 (새 기능/버그 수정인 경우)
- [ ] README 업데이트 필요 시 반영
- [ ] 커밋 메시지가 Conventional Commits 형식입니다
- [ ] 자체 리뷰를 완료했습니다
