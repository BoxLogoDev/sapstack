---
name: 📦 새 SAP 모듈 플러그인 제안
about: 새로운 SAP 모듈 플러그인을 추가하고 싶을 때
title: "[NEW MODULE] sap-xxx"
labels: new-module
assignees: ''
---

## 📦 제안 모듈
- **플러그인 ID**: `sap-xxx`
- **공식 모듈명**: (예: SAP GTS — Global Trade Services)
- **대상 사용자**: (예: 한국 수출입 기업 SI 컨설턴트)

## 🎯 왜 이 모듈이 필요한가?
기존 13개 플러그인으로 커버되지 않는 이유.

## 📋 주요 주제
이 모듈이 다룰 핵심 주제들:
- [ ] ...
- [ ] ...
- [ ] ...

## 🔑 트리거 키워드
SKILL.md `description`에 들어갈 자동 활성화 키워드:
- T-codes:
- 용어 (영문):
- 용어 (한국어):

## 🏗 예상 구조
```
plugins/sap-xxx/
└── skills/sap-xxx/
    ├── SKILL.md
    └── references/
        ├── <topic>.md
        └── ko/quick-guide.md
```

## 🌏 ECC vs S/4HANA 호환성
- ECC 6.0: [ ] 지원 [ ] 부분 [ ] 미지원
- S/4HANA On-Prem: [ ] 지원
- RISE: [ ] 지원
- Cloud PE: [ ] 지원

## 🇰🇷 한국 특화
- 한국 localization 특수 주제가 있는가?
- `sap-bc`와 중복되는 부분이 있는가?

## 🧩 관련 기존 플러그인
- `sap-xxx`와 상호작용할 기존 플러그인:

## 🤝 기여 계획
- [ ] 제가 직접 SKILL.md를 작성할 수 있습니다
- [ ] 제안만 합니다 (다른 기여자 환영)
- [ ] 공동 작업 원합니다

## 📝 참고 자료
SAP Help Portal, SAP Notes, 블로그, 공식 문서 링크.

## ✅ 체크리스트
- [ ] 기존 13개 플러그인과 **중복되지 않습니다**
- [ ] **회사 중립** (vendor-neutral) — 특정 회사 전용 아닙니다
- [ ] 유지보수 가능한 주제 (SAP 릴리스 변화에 대응 가능)
- [ ] `CONTRIBUTING.md` 읽었습니다
