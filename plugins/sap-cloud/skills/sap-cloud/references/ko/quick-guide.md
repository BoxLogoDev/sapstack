# sap-cloud 한국어 퀵가이드

> SAP S/4HANA Cloud Public Edition (Cloud PE) — Clean Core 강제, Key User 확장, 분기 릴리스.

## 🔑 환경 인테이크
1. **Cloud PE 버전** — 2401/2402/2403/2405 등 (월/년 릴리스)
2. **Extension Tier** — Tier 1 (Key User) / Tier 2 (Side-by-Side BTP) / Tier 3 (On-Stack ABAP Cloud)
3. **배포 모델** — Cloud PE 전용 (온프레 SE38/SE80/SMOD/CMOD 금지)
4. **Change Control** — Fit-to-Standard 단계 vs Operations 단계

## 📚 핵심

### Clean Core 원칙 (비협상)
- SAP 표준 코드/테이블 수정 불가
- Transport(TMS/tp) 없음 → Cloud ALM 직접 업로드 (CSP)
- 확장은 3-Tier 모델로만

### Key User Extensibility (Tier 1)
- **Custom Fields**: Manage Your Solution → Custom Fields (즉시 활성)
- **Custom Logic**: ABAP Cloud (RAP) — Key User-friendly entry point
- **Custom CDS Views**: 읽기 전용 분석
- **Custom Business Objects**: RAP BO

### Fit-to-Standard
- 표준 프로세스에 맞춤 — gap만 Tier 1/2/3 확장
- 워크숍 → scope 결정 → CBC 구성

### Cloud ALM
- 구현/운영 라이프사이클 관리 (구 Solution Manager 대체)
- CSP(Custom Software Package) 배포 경로

## 🇰🇷 한국 특화
- **분기 릴리스 강제** — 한국 고객도 분기 업그레이드 회피 불가 (FSD 사전 검토)
- **한국 로컬라이제이션** — 전자세금계산서/CVI KR은 Cloud PE 표준 scope 확인
- **Clean Core 교육** — 한국 SI 관행(Z 개발)에서 Key User 확장으로 전환 필요

## 🚨 자주 마주치는 이슈

### "표준 T-code가 없어요"
- 원인: Cloud PE는 SE38/SE80/SMOD/CMOD 금지
- 해결: Key User Extensibility로 대체 (Custom Logic/Fields)

### "분기 릴리스 후 커스텀 깨짐"
- 원인: deprecated API 사용
- 해결: FSD 사전 검토 + Q-system 회귀 테스트

## ⚠️ 금지 사항
- ❌ 온프레 T-code 가정 (SE38/SE80/SMOD/CMOD/SE16N)
- ❌ 표준 객체 수정 (Clean Core 위반)
- ❌ 분기 릴리스 회피 시도

## 📖 관련
- `../../SKILL.md` — 상세 본문
- `../img/fit-to-standard.md` / `../img/key-user-extensibility.md`
- `sap-btp` — Tier 2 Side-by-Side
- `sap-s4-migration` — On-Prem → Cloud PE 전환
