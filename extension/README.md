# sapstack for VS Code (Stub)

> **⚠️ v1.4.0 상태**: 매니페스트 스텁 수준. 실제 TypeScript 구현은 **v1.5.0 예정**.

VS Code에서 sapstack을 네이티브하게 사용하는 확장입니다.

## 🎯 목표 기능 (v1.5.0)

### 명령 (Commands)
- `sapstack.resolveNote` — 키워드로 SAP Note 검색
- `sapstack.checkTcode` — T-code 유효성 검증
- `sapstack.listPlugins` — 14개 플러그인 목록
- `sapstack.openAgent` — 서브에이전트 프롬프트 열기
- `sapstack.runQualityGates` — 품질 게이트 실행

### 설정
- `sapstack.sapstackPath` — sapstack 디렉토리 경로
- `sapstack.language` — 기본 응답 언어 (ko/en/auto)
- `sapstack.showInStatusBar` — 상태 바 표시

### 자동 활성화
- ABAP 파일 편집 시
- `.sapstack/config.yaml` 존재 시
- sapstack 디렉토리 구조 감지 시

### ABAP 스니펫 (계획)
```abap
! bapi-call (타이핑) → BAPI 호출 + RETURN 테이블 체크 템플릿
! alv-oo (타이핑) → ALV OO 방식 템플릿
! cds-view (타이핑) → CDS view annotation 템플릿
! rap-behavior (타이핑) → RAP behavior definition 템플릿
```

## 🚀 v1.5.0 로드맵

### Phase 1: TypeScript 구현
- `src/extension.ts` — 활성화 진입점
- `src/commands/` — 5개 명령 구현
- `src/providers/` — 스니펫 & 완성
- `package.json` 정식 배포 버전

### Phase 2: 기능
- 한국어 기본 지원
- 14개 플러그인 quick picker
- SAP Note 검색 결과 웹뷰
- ABAP 코드 리뷰 on-hover (Clean Core 위반 하이라이트)

### Phase 3: VS Code Marketplace 등록
- `vsce package`
- `vsce publish`

## 💡 지금 당장은?

v1.4.0까지는 **GitHub Copilot 확장** + `.github/copilot-instructions.md` 조합이 가장 실용적입니다. 이 확장은 이 조합의 **ABAP/SAP 특화 진화**로 보시면 됩니다.

## 📖 관련
- `extension/package.json` — 매니페스트
- `docs/multi-ai-compatibility.md` — 다른 AI 도구 비교
- `.github/copilot-instructions.md` — 현재 가장 실용적 VS Code 통합
