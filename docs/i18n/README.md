# sapstack 다국어 가이드 (Internationalization)

> v1.7.0부터 sapstack은 **6개 언어**를 지원합니다.

## 지원 언어

| 코드 | 언어 | 상태 | README |
|------|------|------|--------|
| ko | 한국어 (Korean) | Primary | [README.md](../../README.md) |
| en | English | Full | [README.en.md](../../README.en.md) |
| zh | 中文 (Simplified Chinese) | v1.7 NEW | [README.zh.md](../../README.zh.md) |
| ja | 日本語 (Japanese) | v1.7 NEW | [README.ja.md](../../README.ja.md) |
| de | Deutsch (German) | v1.7 NEW | [README.de.md](../../README.de.md) |
| vi | Tiếng Việt (Vietnamese) | v1.7 NEW | [README.vi.md](../../README.vi.md) |

## 다국어 레이어 구조

```
sapstack/
├── README.md                    # 🇰🇷 Primary (한국어)
├── README.en.md                 # 🇬🇧 English
├── README.zh.md                 # 🇨🇳 中文
├── README.ja.md                 # 🇯🇵 日本語
├── README.de.md                 # 🇩🇪 Deutsch
├── README.vi.md                 # 🇻🇳 Tiếng Việt
│
├── data/
│   ├── symptom-index.yaml      # symptom_{lang} 필드로 다국어 지원
│   ├── synonyms.yaml           # {lang}: primary/variants 구조
│   └── tcode-pronunciation.yaml # 한국어 발음 (ko-specific)
│
├── web/i18n/
│   ├── ko.json                 # 100%
│   ├── en.json                 # 100%
│   ├── zh.json                 # 100% (v1.7 신규)
│   ├── ja.json                 # 100% (v1.7 신규)
│   ├── de.json                 # 100%
│   └── vi.json                 # 100% (v1.7 신규)
│
└── docs/i18n/
    ├── README.md               # 이 문서
    └── symptom-index.md        # symptom-index 번역 가이드
```

## 번역 상태 (v1.7.0)

| 데이터 | ko | en | zh | ja | de | vi |
|--------|-----|-----|-----|-----|-----|-----|
| symptom-index.yaml | 62/62 | 62/62 | 15/62 | 15/62 | 14/62 | 11/62 |
| synonyms.yaml | 80+ | 80+ | 29 | 65 | 65 | 29 |
| web/i18n/*.json | 100% | 100% | 100% | 100% | 100% | 100% |
| README | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 모듈 quick-guide | 19/19 | - | - | - | - | - |

## 번역 기여 가이드

### 1. symptom-index.yaml 번역 추가

각 증상 entry에 `symptom_{lang}` 필드를 추가:

```yaml
  - id: sym-f110-no-payment-method
    symptom_ko: "F110 돌리는데 벤더 하나만 'No valid payment method' 뜨는 경우"
    symptom_en: "F110 fails with 'No valid payment method found for vendor'"
    symptom_zh: "..."    # 여기에 중국어 번역 추가
    symptom_ja: "..."    # 일본어
    symptom_de: "..."    # 독일어
    symptom_vi: "..."    # 베트남어
```

**번역 원칙**:
- SAP T-code는 원문 유지 (F110, MIGO 등)
- 자연스러운 업무 언어 사용
- symptom_ko의 문맥을 반영 (현장체/실무형)

### 2. synonyms.yaml 번역 추가

각 용어에 `{lang}: primary/variants` 구조 추가:

```yaml
  - id: cost_center
    ko:
      primary: "코스트 센터"
      variants: ["원가센터", "KOSTL"]
    en:
      primary: "Cost Center"
      variants: ["KOSTL", "CC"]
    zh:
      primary: "成本中心"
      variants: ["cost center", "CC"]
    # ja, de, vi 추가
```

### 3. web/i18n/ UI 문자열

기존 ko.json 구조를 참조하여 모든 키 번역.

### 4. README 번역

README.en.md를 base로 사용하여 각 언어별 README 작성.

## 기여 방법

1. **Issue 생성**: "i18n: add {language} translations for {file}"
2. **Branch 생성**: `feat/i18n-{lang}-{file}`
3. **번역 작업**: 위 가이드에 따라
4. **PR 제출**: 네이티브 스피커 검토 필수
5. **CI 통과**: `check-ko-references.sh` 확인

## 네이티브 스피커 검토 중

각 언어별 검토자 모집 중 — Issue로 연락 주세요.

- 🇨🇳 中文 검토자: 모집 중
- 🇯🇵 日本語 검토자: 모집 중
- 🇩🇪 Deutsch 검토자: 모집 중
- 🇻🇳 Tiếng Việt 검토자: 모집 중

## 우선순위

1. **High**: symptom-index 완전 번역 (62/62 모든 언어)
2. **Medium**: synonyms 확장 (80+ terms 모든 언어)
3. **Low**: 모듈별 quick-guide 다국어 버전 (v1.8+)

## 참조

- CLAUDE.md Rule #8: Korean Field Language (한국어 전용 원칙)
- 언어 감지 로직: `web/i18n/` + 사용자 config
- Korean Field Language Guide: `plugins/sap-session/skills/sap-session/references/korean-field-language.md`
