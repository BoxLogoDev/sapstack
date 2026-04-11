# symptom-index 번역 기여 가이드

`data/symptom-index.yaml`은 sapstack의 다국어 확장 경로입니다. 이 가이드는
새 언어/국가를 추가하거나 기존 번역을 개선할 때의 규칙을 설명합니다.

---

## 🌐 현재 언어 지원 (v1.5.0)

| 언어 | 코드 | 커버리지 | 상태 |
|---|---|---|---|
| 한국어 | `ko` | 20/20 | ✅ Full (원본) |
| English | `en` | 20/20 | ✅ Full |
| Deutsch | `de` | 3/20 | 🌱 Seed (F110, MIGO, ST22) |
| 日本語 | `ja` | 3/20 | 🌱 Seed (F110, MIGO, ST22) |
| 中文 | `zh` | 0/20 | ❌ 미지원 |
| Français | `fr` | 0/20 | ❌ 미지원 |

---

## 📝 엔트리 번역 규칙

### 필수 필드

각 symptom 엔트리에서 **번역이 필요한 필드**:

```yaml
- id: sym-f110-no-payment-method
  symptom_ko: "한국어 원문"        # 필수 — 원본
  symptom_en: "English translation"  # 필수 — 글로벌 기본
  symptom_de: "Deutsche Übersetzung" # 선택 — 독일 법인 대상
  symptom_ja: "日本語訳"              # 선택 — 일본 법인 대상
  symptom_zh: "..."                  # 추후
```

### 번역 품질 기준

1. **SAP 공식 번역 용어 사용**
   - 독일어: SAP German terminology (Zahlungsmethode, Lieferant, Buchung)
   - 일본어: SAP Japan terminology (支払方法, 仕入先, 計上)
   - 자의적 번역 금지

2. **에러 메시지는 SAP 원본 참조**
   - 예: `No valid payment method found` 는 독일어 SAP에서
     `Keine gültige Zahlungsmethode gefunden`으로 고정
   - SE91로 원본 확인 가능 (해당 언어 로그온 후)

3. **맥락 보존**
   - 증상 설명은 "상황 + 메시지" 구조
   - 예(ko): "F110 실행 시 'No valid payment method found for vendor' 에러"
   - 예(de): "F110 schlägt fehl mit 'Keine gültige Zahlungsmethode für Lieferant gefunden'"

4. **국가별 특수 맥락은 localized_checks에**
   - `symptom_{lang}`에는 번역만
   - 해당 국가 특화 체크(예: 독일 SEPA, 일본 전자기록채권)는
     `localized_checks.{iso}`에 한국어로 설명하되 필요 시 원어 용어 병기

---

## 🇩🇪 독일어 번역 체크리스트

- [ ] SAP German official terminology 사용
- [ ] Umlaut 정확 (ä, ö, ü, ß)
- [ ] Compound noun 분리 없이 (Zahlungsmethode, 아니라 Zahlungs methode)
- [ ] SEPA / DATEV / ELSTER 관련 용어는 원어 유지
- [ ] 대문자 명사 규칙 준수

### 자주 쓰는 SAP 독일어 용어

| 한국어 | 독일어 |
|---|---|
| 벤더 / 공급자 | Lieferant |
| 고객 | Debitor / Kunde |
| 전표 | Beleg |
| 회사코드 | Buchungskreis |
| 원가센터 | Kostenstelle |
| 이익센터 | Profitcenter |
| 자재 | Material |
| 플랜트 | Werk |
| 저장위치 | Lagerort |
| 지급방법 | Zahlungsmethode |
| 원천세 | Quellensteuer |

---

## 🇯🇵 일본어 번역 체크리스트

- [ ] SAP Japan 公式用語 使用
- [ ] カタカナ/漢字 混在時 SAP 慣用 準拠
- [ ] 敬語は使わず、技術文書調
- [ ] エラーメッセージは SE91 原文 確認
- [ ] 固有名詞は原語維持 (SAP Note, T-code, etc.)

### SAP 日本語 頻出用語

| 한국어 | 日本語 |
|---|---|
| 벤더 | 仕入先 (しいれさき) |
| 고객 | 得意先 / 顧客 |
| 전표 | 伝票 |
| 회사코드 | 会社コード |
| 원가센터 | 原価センタ |
| 이익센터 | 利益センタ |
| 자재 | 品目 / 資材 |
| 플랜트 | プラント |
| 저장위치 | 保管場所 |
| 지급방법 | 支払方法 |
| 원천세 | 源泉徴収税 |
| 계상 / 포스팅 | 計上 |

---

## 🌏 새 국가 추가 절차

새 국가(예: 중국 `zh`)를 추가하려면:

1. **localized_checks 슬롯 추가**
   - 기존 엔트리들에 `localized_checks.zh` 필드 점진적 추가
   - 최소 "F110, MIGO, ST22" 3개부터 시작

2. **symptom_zh 필드 추가** (선택적)
   - 3개 시드부터 시작 → 커뮤니티 확장

3. **triage.html 언어 드롭다운 활성화**
   - 현재 `<option value="de" disabled>` 같은 비활성 옵션을 활성화
   - triage.js의 `STOP_WORDS_{lang}` 추가

4. **meta 섹션 업데이트**
   - `languages`에 새 코드 추가
   - `language_coverage`에 카운트

5. **로컬라이제이션 컨설턴트 에이전트 추가** (v1.7+)
   - `agents/sap-zh-localization-consultant.md`
   - 중국 세무 / 금세권 / 외환 관리 규정 참조

---

## 🧪 번역 검증

번역 PR 제출 전 다음을 확인:

1. **web/triage.html 로컬 테스트**
   - 번역 언어로 검색했을 때 해당 증상이 매칭되는지
   - STOP_WORDS에 해당 언어 불용어가 포함되는지

2. **스키마 검증**
   - `data/symptom-index.yaml`을 YAML linter로 검증
   - 인덴테이션 일관성 확인

3. **Quality gate 통과**
   - `scripts/validate-symptom-index.sh` (Slice 7에서 추가 예정)

4. **원어민 리뷰**
   - 가능하면 해당 언어 SAP 컨설턴트 1명 이상의 리뷰

---

## 🤝 기여 방법

1. 이 가이드에 따라 번역
2. PR 제목: `i18n({lang}): add {count} symptom translations`
3. PR 본문에 검증 스크린샷 포함
4. 리뷰어는 해당 언어 경험이 있는 컨트리뷰터 우선 배정

기여해주신 번역은 MIT 라이선스로 프로젝트에 포함됩니다.

---

## 📚 참조

- `data/symptom-index.yaml` — 원본 파일
- `web/triage.js` — 매칭 로직 (언어 적용)
- `plugins/sap-session/skills/sap-session/SKILL.md` — 전체 아키텍처
- SAP Help Portal의 각 언어별 번역 용어집
