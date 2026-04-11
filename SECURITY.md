# Security Policy

## 🛡 지원 버전

현재 다음 버전에 대해 보안 업데이트가 제공됩니다:

| Version | Supported |
|---------|-----------|
| 1.3.x   | ✅ 지원    |
| 1.2.x   | ✅ 지원    |
| 1.1.x   | ⚠️ Best-effort |
| 1.0.x   | ❌ 미지원  |
| < 1.0   | ❌ 미지원  |

## 🔐 취약점 신고

**공개 GitHub Issue를 사용하지 마세요.** 보안 취약점은 아래 방법으로 비공개 신고해주세요:

### 권장 방법: GitHub Security Advisory
1. https://github.com/BoxLogoDev/sapstack/security/advisories/new 접속
2. "Report a vulnerability" 선택
3. 양식 작성 후 제출

### 대체: Private Contact
- 이메일 또는 private repository 접근은 저장소 소유자에게 문의

### 포함 정보
- 취약점 유형 (예: 코드 실행, 정보 노출, 권한 상승)
- 영향받는 파일/스크립트
- 재현 단계
- PoC 코드 (가능한 경우)
- 예상 심각도 (CVSS 점수 제안)

## ⏱ 대응 타임라인

| 단계 | 목표 시간 |
|------|----------|
| 접수 확인 | 48시간 |
| 초기 분석 | 7일 |
| 심각도 확정 | 14일 |
| 수정 배포 | 30일 (Critical), 60일 (High), 90일 (Medium/Low) |

## 🎯 범위

### In Scope (보안 신고 대상)
- **스크립트 취약점**: `scripts/*.sh`에서 command injection, path traversal 등
- **CI/CD 취약점**: `.github/workflows/*.yml` 오용
- **지침 파일 인젝션**: `SKILL.md`, `agents/*.md` 등을 통한 prompt injection
- **데이터 자산 오염**: `data/tcodes.yaml`, `data/sap-notes.yaml` 허위 정보
- **마이그레이션 경로**: sapstack을 다른 AI에 전달할 때의 안전성

### Out of Scope
- **SAP 시스템 자체의 보안** — SAP Support Portal에 신고
- **Claude / Codex / Copilot 등 AI 제품**의 취약점 — 각 벤더에 신고
- **사용자 실제 SAP 환경**의 취약점 — 해당 SAP 컨설팅사에 문의
- **sapstack이 의존하는 bash/jq/git** 자체 — 각 프로젝트에 신고

## 🚫 금지 사항

sapstack은 **SAP 시스템에 직접 쓰기 작업을 하지 않습니다**. 다음은 명시적 금지:
- 사용자 실제 SAP 크리덴셜 수집
- SAP 트랜잭션 원격 실행
- 실제 기업 데이터 (주민번호, 사업자등록번호, 회사 식별 정보) 저장
- 운영 환경 변경 자동 실행

이런 기능이 누군가가 sapstack 위에 빌드한다면 **즉시 보안 신고 대상**입니다.

## 🔒 민감 정보 취급 원칙

### sapstack 자체
- 이 저장소에 **실제 기업 정보** 절대 금지 — PR에서 차단
- `.sapstack/config.yaml`은 사용자 로컬에만 (gitignore)
- 예시는 항상 `<YOUR_...>` placeholder

### 사용자 책임
- `.sapstack/config.yaml`을 **공개 저장소에 커밋 금지**
- 스크린샷에 사용자 ID·시스템 이름 마스킹
- 로그 공유 시 회사 식별 정보 제거

## 🇰🇷 한국 특화 보안 고려사항

한국 환경에서 특히 주의해야 할 점:

### 개인정보보호법
- **주민번호**: sapstack 예시·문서에 절대 금지
- **사업자등록번호**: 실제 값 금지
- **대표자 성명**: 가명 사용

### 정보통신망법
- **로그 보관 3년** 요구사항 (sapstack 자체는 로그를 저장하지 않음)
- **암호화**: 사용자가 전송하는 데이터는 HTTPS 필수

### KISA 가이드
- **TLS 1.2+** 권장
- 공인인증서 경로·비밀번호 절대 예시 금지

### 망분리 환경
- sapstack은 기본적으로 offline 동작 가능
- 외부 호출은 AI 도구(Claude API 등)가 담당 — sapstack 자체 아님

## 🏆 감사 (Credit)

취약점을 책임감 있게 신고해주신 분들을 `docs/security-credits.md`에 기록합니다 (희망하는 경우).

## 📖 관련 자료

- [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CVSS 3.1 Calculator](https://www.first.org/cvss/calculator/3.1)
- [한국 KISA 보안 가이드](https://www.kisa.or.kr/)
