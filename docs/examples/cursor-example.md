# Cursor 사용 예시

> sapstack을 Cursor IDE에서 쓰는 실전 세션.

## 설치

```bash
# 저장소 clone 또는 submodule
git clone https://github.com/BoxLogoDev/sapstack
cd sapstack

# Cursor 열기
cursor .
```

`.cursor/rules/sapstack.mdc`가 자동 인식됩니다. `alwaysApply: true`이므로 모든 AI 상호작용에 적용됩니다.

## 기본 워크플로

### 시나리오 1 — Cursor Chat (Ctrl+L)

```
sapstack 규칙 따라서 F110 DME 생성 실패 원인 Top 5 정리해줘.
환경: S/4HANA 2023, 한국 KB 국민은행 포맷.
```

Cursor가 `.cursor/rules/sapstack.mdc`를 시스템 프롬프트에 주입 → 구조화된 답변.

### 시나리오 2 — Cursor Composer (Ctrl+I)

여러 파일 동시 편집:

```
plugins/sap-fi/skills/sap-fi/SKILL.md의 "AP" 섹션에
"전자세금계산서 매입" 하위 섹션을 추가해줘.
기존 style 유지, ECC vs S/4HANA 차이 명시.
```

Composer가 파일 찾아서 edit 제안 → 승인.

### 시나리오 3 — Inline Edit (Ctrl+K)

ABAP 파일 편집 중 특정 라인 선택 후 Ctrl+K:

```
SELECT *를 HANA 최적화된 형태로 변경
```

Cursor가 Clean Core + HANA 규칙을 적용한 제안.

### 시나리오 4 — Cursor Rules 확인

Cursor Chat에서:
```
현재 적용 중인 rules 뭐가 있어?
```

답변에 `sapstack.mdc`가 포함되어야 정상.

## 고급 활용

### `@Codebase` 컨텍스트
```
@Codebase MIRO 관련 처리 로직 찾아서 sapstack Clean Core 원칙 위반 확인해줘
```

Cursor가 저장소 전체를 인덱싱한 상태에서 관련 파일 자동 찾아 분석.

### `@Files` 특정 파일 참조
```
@Files plugins/sap-fi/skills/sap-fi/SKILL.md
이 SKILL.md의 Section 2 내용을 한국어로 번역해서 references/ko/SKILL-ko.md에 반영해줘
```

### `.cursorignore`
sapstack의 일부 파일을 Cursor 인덱싱에서 제외:
```
# .cursorignore
.release-notes-*.md
node_modules/
```

## 실제 출력 예시

```markdown
## 🔍 Issue
F110 Payment 단계에서 DME 파일 미생성 — KB 국민은행 포맷

## 🧠 Root Cause (Top 5)
1. DMEE Tree 설정 누락 — Payment Method에 포맷 미할당
2. 국민은행 포맷 스펙 변경 (연 1~2회 업데이트)
3. 하우스뱅크 Account ID 연결 끊김 (FBZP Bank Determination)
4. 파일 출력 경로 권한 (/usr/sap/<SID>/DATA/)
5. 공인인증서 만료 (STRUST)

## ✅ Check
1. FBZP → Bank Determination → KB 은행 그룹
2. DMEE → KB 트리 활성화 상태 (Active/Inactive)
3. SM37 → F110 실행 Job 로그
4. STRUST → 공인인증서 유효기간
5. OS: `/usr/sap/<SID>/DATA/` 디렉토리 쓰기 권한

## 🛠 Fix
(단계별 - Case A/B/C/D/E)

## 🛡 Prevention
- 은행 포맷 구독
- Monthly DME test run
- 인증서 갱신 alert

## 📖 SAP Note
- 2065380 — STMS related (예시)
```

## 팁

### 한국어 답변 강제
프로젝트 루트에 `.sapstack/config.yaml` 두고 `preferences.language: ko` 설정 + Cursor가 config 파일을 자동 참조하도록 프롬프트에 언급.

### 짧은 답변 선호
```
간결하게 (3줄 이내로) 답해줘: ...
```
Cursor는 대체로 간결한 답변이 가능.

### 복잡한 리팩토링
```
이 파일을 Composer로 refactor해줘 (multi-file changes)
```

## 알려진 제약

- Cursor는 **단일 룰 파일** 권장 — 너무 많은 `.mdc` 파일은 충돌 가능
- 슬래시 커맨드 네이티브 지원 없음
- 에이전트 개념 없음 (복잡한 다단계 분석은 Composer에서 수동)

## 관련
- [.cursor/rules/sapstack.mdc](../../.cursor/rules/sapstack.mdc) — 본체 룰
- [multi-ai-compatibility.md](../multi-ai-compatibility.md)
