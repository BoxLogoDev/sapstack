---
name: 🌐 다국어 검수 피드백 (Translation Feedback)
about: 다국어 quick-guide 번역 오류 신고 또는 검수 범위 공유
title: "[i18n] "
labels: i18n, translation
assignees: ''
---

## 🌐 언어 (Language)
<!-- en / zh / ja / de / vi 중 하나 -->

## 📦 모듈 (Module)
<!-- 예: sap-fi, sap-mm, sap-ibp ... -->

## 📄 대상 페이지 (Page)
<!-- 예: plugins/sap-fi/skills/sap-fi/references/de/quick-guide-de.md -->

## 🔍 피드백 유형 (Type)
- [ ] SAP 용어 오역 (T-code/Note 번호 제외 — 그것은 원형 유지가 정상)
- [ ] 현지화 부적절 (자국 SAP 현장 표현과 불일치)
- [ ] 구조/누락 (헤딩·표·섹션 빠짐)
- [ ] 오타 / 문법
- [ ] 검수 범위 공유 (작업 시작 전 중복 방지)

## ✏️ 제안 내용 (Suggestion)
<!--
현재:  "..."
제안:  "..."
근거:  (자국 SAP GUI/Fiori 표기, SAP Help 링크, 스크린샷 등)
-->

## ✅ 검증 (선택)
- [ ] `bash scripts/check-translation-parity.sh --strict` 통과 확인
- [ ] T-code/Note 번호 원형 유지 확인

---

> 검수 절차·평가 기준·PR 형식은 [docs/TRANSLATION-REVIEW.md](../../docs/TRANSLATION-REVIEW.md)를 참고하세요.
> 직접 PR을 여실 수 있다면 이슈 없이 PR 제출도 환영합니다.
