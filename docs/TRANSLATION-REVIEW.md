# sapstack 다국어 검수 가이드 (Translation Review Guide)

> sapstack의 다국어 quick-guide는 **Claude 작성 초안(Claude-authored draft)**입니다.
> 각 언어 native speaker + SAP 도메인 전문가의 커뮤니티 검수를 환영합니다.
> 이 문서는 검수자가 따라야 할 절차 · 평가 기준 · PR 형식을 정의합니다.

---

## 1. 검수 대상

```
plugins/sap-{module}/skills/sap-{module}/references/{en,zh,ja,de,vi}/quick-guide-{lang}.md
```

| 언어 | 코드 | 디렉토리 | 비고 |
|---|---|---|---|
| English | en | `references/en/` | 글로벌 기준 |
| 简体中文 | zh | `references/zh/` | 중국 본토 SAP |
| 日本語 | ja | `references/ja/` | 日本ローカル |
| Deutsch | de | `references/de/` | DACH SAP |
| Tiếng Việt | vi | `references/vi/` | 동남아 거점 |

> 기준(source) 문서는 `references/ko/quick-guide.md` (한국어 원본).
> 각 파일 상단 `<!-- Claude-authored draft (community review welcome) -->` 배지가
> 검수 미완료 상태를 표시합니다. 검수 완료 시 배지를 갱신합니다 (아래 4절).

---

## 2. 검수 절차

### Step 1 — 이슈 등록 (선택)
대규모 검수 전, [Translation Feedback 이슈 템플릿](https://github.com/BoxLogoDev/sapstack/issues/new?template=translation-feedback.md)으로 범위(언어/모듈)를 공유하면 중복 작업을 방지합니다.

### Step 2 — 로컬 검증
```bash
git clone https://github.com/BoxLogoDev/sapstack
cd sapstack
bash scripts/check-translation-parity.sh --strict   # 구조 정합성
bash scripts/lint-frontmatter.sh
```

### Step 3 — 검수 & 수정
아래 **3. 평가 기준**에 따라 해당 언어 파일을 교정합니다.

### Step 4 — PR 제출
**4. PR 형식**의 템플릿을 사용해 PR을 엽니다. CI(Quality Gates)가 자동 검증합니다.

---

## 3. 평가 기준

### 3.1 SAP 도메인 정확성 (최우선)
- **T-code / Fiori app ID / Note 번호는 번역 금지** — 원형 유지 (F110, MIGO, ST22, SOAMANAGER 등)
- SAP 표준 용어는 해당 언어 SAP UI 용어를 사용
  - 예: 독일어 "Werk"(plant), "Buchungskreis"(company code), "Kostenstelle"(cost center)
  - 예: 중국어 "工厂"(plant), "公司代码"(company code), "成本中心"(cost center)
  - 예: 일본어 "プラント", "会社コード", "原価センタ"
- 모듈 약어 유지 (FI/MM/SD/PP/IBP/SAC/Ariba/IC) — 풀어쓰지 않음

### 3.2 구조 정합성 (CI 자동 검증)
- H2/H3 헤딩 수가 ko 원본과 ±허용범위 (check-translation-parity)
- code block / 표 구조 보존
- 라인 수가 ko 대비 30~250% (자연어 길이 특성 허용)

### 3.3 현지화 적절성
- ko-specific 섹션(추석/설, 전자세금계산서 등)은 해당국 등가물로 변환
  - zh → 中国本地化 (금세, GB18030, PIPL)
  - ja → 日本ローカル (電子帳簿保存法, インボイス制度)
  - de → Deutsche Lokalisierung (GoBD, DSGVO, DATEV)
  - vi → Bản địa hóa Việt Nam (NĐ 123/2020, NĐ 13/2023)
- 자국 SAP 현장 표현 사용 (사전식 직역 지양)

### 3.4 일관성
- 같은 SAP 개념은 문서 전체에서 동일 용어
- 첫 등장 시 (현지어 + 영문/필드코드) 병기 권장

---

## 4. PR 형식

### 브랜치
```
translation/{lang}-{module}    예: translation/de-sap-fi
```

### PR 제목
```
docs(i18n): {lang} review — sap-{module} quick-guide
```

### PR 본문 템플릿
```markdown
## 검수 대상
- 언어: {en|zh|ja|de|vi}
- 모듈: sap-{module}
- 검수자 배경: (native speaker / SAP {module} 경험 N년 등)

## 변경 요약
- SAP 용어 교정: N건
- 현지화 보강: N건
- 구조/오타: N건

## 검증
- [ ] bash scripts/check-translation-parity.sh --strict 통과
- [ ] T-code/Note 번호 원형 유지 확인
- [ ] 해당 언어 SAP UI 용어 대조 완료
```

### 검수 완료 배지 갱신
검수가 충분히 이뤄진 파일은 상단 배지를 교체합니다:
```
<!-- Claude-authored draft (community review welcome) -->
   ↓ (native 검수 완료 시)
<!-- Community-reviewed: {lang} by @{reviewer} ({date}) -->
```

---

## 5. 검수자 크레딧

검수에 기여하면 [CONTRIBUTORS.md](../CONTRIBUTORS.md)에 등재되며,
해당 언어 디렉토리의 CODEOWNERS reviewer로 추가될 수 있습니다
(지속 기여자 대상, 메인테이너 판단).

---

## 6. 자주 묻는 질문

**Q. 전체를 다 고쳐야 하나요?**
A. 아니요. 모듈 1개 × 언어 1개 단위 PR을 권장합니다 (리뷰 용이).

**Q. 기계 번역 티가 나는데 전면 재작성해도 되나요?**
A. 환영합니다. 단 구조 정합성(check-translation-parity)과 T-code 원형은 유지하세요.

**Q. SAP 용어가 자국 SAP에서 다르게 쓰입니다.**
A. 자국 SAP GUI/Fiori 실제 표기를 우선합니다. 근거(스크린샷/SAP Help 링크)를 PR에 첨부하면 좋습니다.

---

관련: [CONTRIBUTING.md](../CONTRIBUTING.md) · [check-translation-parity.sh](../scripts/check-translation-parity.sh) · [build-translations.sh](../scripts/build-translations.sh)
