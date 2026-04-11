# sapstack Web UI — SAP Note Resolver

> 정적 웹 UI로 `data/sap-notes.yaml`을 시각화.

## 🎯 목적

- **브라우저에서 SAP Note 검색** — CLI 없이
- **한국어·영문 혼용** 검색
- **카테고리 필터** (migration / korea / dump / performance / security / config)
- **완전 정적** — 서버 없음, GitHub Pages 배포 가능

## 📁 파일

- `index.html` — HTML 구조
- `style.css` — GitHub Dark 스타일
- `script.js` — YAML 파싱 + 검색 로직

## 🚀 로컬 실행

```bash
cd web
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000` 접속.

## 🌐 GitHub Pages 배포

`Settings → Pages → Source → main branch / web folder`

배포 후 URL: `https://BoxLogoDev.github.io/sapstack/`

## 🔄 데이터 소스

`script.js`의 `DATA_URL` 상수가 `data/sap-notes.yaml`을 `raw.githubusercontent.com`으로 가져옵니다:

```javascript
const DATA_URL = 'https://raw.githubusercontent.com/BoxLogoDev/sapstack/main/data/sap-notes.yaml';
```

GitHub의 main 브랜치가 업데이트되면 **자동으로 최신 데이터**를 반영합니다.

## 🎨 스타일

GitHub Dark 컬러 팔레트 (`#0d1117` 배경) + Noto Sans KR 폰트 스택.

## ⚠️ 제약

- **JavaScript 필수** (순수 정적이지만 fetch 사용)
- 브라우저 CORS: GitHub raw는 CORS 허용
- YAML parser는 **sap-notes.yaml 특화** — 일반 YAML 파서 아님

## 🔮 v1.5.0 확장 계획

- T-code 검색 탭 추가 (data/tcodes.yaml)
- Plugin 카탈로그 탭 (.claude-plugin/marketplace.json)
- 다크/라이트 테마 토글
- 검색 히스토리 (localStorage)
- 오프라인 PWA

## 📖 관련
- [scripts/resolve-note.sh](../scripts/resolve-note.sh) — CLI 버전
- [data/sap-notes.yaml](../data/sap-notes.yaml) — 원본 데이터
