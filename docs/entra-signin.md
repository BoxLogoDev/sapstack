# Microsoft(Entra) 로그인 — 관리자 런북

> 대상: LS ITC 테넌트 관리자(앱 등록·그룹·B2B 게스트)와 킷 배포 담당자.
> 사용자 관점 동작은 [docs/en/us-pilot-runbook.md](en/us-pilot-runbook.md) §11, 설정 파일은 [provisioning.md](provisioning.md) `auth:` 절 참조.
> 결정 배경: `plans/2026-09-15-lsmtron-usa-rollout.md` Workstream A.

## 무엇을 하는가

- `provision.yaml` 의 `auth:` 블록이 있으면 앱은 **스플래시 직후·온보딩 이전에 로그인 게이트**를 띄운다. Microsoft 계정으로 로그인해야 채팅에 도달한다.
- 접근 허용 여부는 **Entra 가 결정**한다(Enterprise App "Assignment required" + 보안 그룹). 앱은 로그인 성공 + `tid`/`aud` 검사만 한다.
- 로그인 신원(이름·메일·oid)은 세션 헤더 `createdBy` 에 기록되고, 같은 리프레시 토큰으로 이후 Azure DevOps 등 MS 자원 토큰을 재로그인 없이 발급한다.
- 토큰은 PC 단위 자격증명 금고(`credentials.enc`, 타입 `entra_signin`)에 저장된다. 공용 PC는 사용 후 **설정 › Account › Sign out** 규율이 필요하다.
- 기동마다 액세스 토큰을 리프레시해 재검증한다. 네트워크가 없으면 마지막 확인 시각 + `offlineGraceDays`(기본 14) 이내에서만 오프라인 사용을 허용한다.

권고 토폴로지: **LS ITC 테넌트에 단일 테넌트 앱 등록 + 해외 법인 사용자(예 `mikyung.song@lsinjectionusa.com`)는 B2B 게스트 + 보안 그룹**. 추적 시스템(Azure DevOps)이 한 테넌트에 묶이므로 접근 통제와 요청 생성 신원을 LS ITC 가 함께 소유한다.

## 설정 절차 (LS ITC 테넌트)

| 단계 | 어디서 | 값 |
|---|---|---|
| ① 앱 등록 | Entra admin center › App registrations › New | 이름 `sapstack Desktop`, **Single tenant**. 플랫폼 **Mobile and desktop applications**, 리디렉션 URI `http://localhost/callback` (데스크톱 localhost 는 포트 무시 — 앱은 6477~6576 중 빈 포트를 쓴다). **Allow public client flows = Yes** |
| ② API 권한 | 같은 앱 › API permissions | Microsoft Graph 위임: `openid`, `profile`, `email`, `offline_access`, `User.Read` → **Grant admin consent** |
| ③ 할당 필수 | Enterprise applications › sapstack Desktop › Properties | **Assignment required? = Yes**. 미할당 사용자는 로그인 시 `AADSTS50105` → 앱이 "권한 없음, IT 문의" 로 표시 |
| ④ 그룹 | Entra › Groups | 보안 그룹 `SG-sapstack-LSInjectionUSA` 생성 → Enterprise App › Users and groups 에 할당(그룹 할당은 **Entra ID P1** 필요. 없으면 사용자 개별 할당) |
| ⑤ B2B 게스트 | Entra › Users › New user › Invite external user (CSV 일괄 가능) | 해외 법인 메일로 초대 → 수락 후 ④ 그룹에 추가. External Identities › Cross-tenant access: 인바운드 허용, **홈 테넌트 MFA 신뢰** 체크(안 하면 MFA 이중 요구) |
| ⑥ 킷 값 기입 | `provision.yaml` | 아래 `auth:` 블록에 `tenantId`(LS ITC 테넌트 GUID), `clientId`(①의 Application (client) ID) |
| ⑦ 스모크 | 실제 사용자 계정으로 | (a) 할당된 게스트 → 로그인 성공, 설정 › Account 에 이름·메일 (b) 미할당 사용자 → "아직 앱 사용 권한이 없어요" (c) 네트워크 끊고 재기동 → offline 배지로 사용 가능 (d) `offlineGraceDays: 0` 으로 재기동 → 즉시 재로그인 요구. **전역 관리자는 할당 검사를 우회하므로 일반 사용자로 시험** |
| ⑧ 회수 | Entra | 그룹에서 제거 → 다음 리프레시(기동) 때 차단. 즉시 차단은 게스트 계정 **비활성 + Revoke sessions** |
| ⑨ 후속(변경 요청) | 같은 앱 › API permissions | **Azure DevOps › user_impersonation** 위임 권한 추가 + 관리자 동의. 리소스 ID `499b84ac-1321-427f-aa17-267ca6975798`. 기존 리프레시 토큰으로 발급되므로 사용자 재로그인 불필요 |

```yaml
# provision.yaml
auth:
  required: true            # false 면 게이트를 띄우지 않고 신원만 선택 사용(기본 true)
  tenantId: 11111111-2222-3333-4444-555555555555   # LS ITC 테넌트 GUID. common/organizations 불가
  clientId: aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee   # ① Application (client) ID
  offlineGraceDays: 14      # 0~90. 마지막 온라인 확인 후 오프라인 허용 일수
  domainHint: lsinjectionusa.com   # 선택 — 로그인 화면에서 회사 계정 자동 선택
```

`auth:` 블록이 **있는데 값이 잘못되면**(GUID 아님, `tenantId: common` 등) 프로비저닝 파싱이 실패하고 앱은 **fail closed**(로그인 불가·관리자 문의 화면)로 멈춘다. 블록이 없으면 로그인 기능 자체가 꺼진다(기존 동작).

## 사용자에게 보이는 사유 문구

| 사유 | 원인 | 조치 |
|---|---|---|
| `not_assigned` | `AADSTS50105` — Enterprise App 에 미할당 | ④ 그룹 추가 |
| `wrong_tenant` | 토큰 `tid`/`aud` 가 설정과 불일치 — 개인 계정·다른 회사 계정 선택 | 회사 계정으로 재로그인. 반복되면 `domainHint` 설정 |
| `refresh_expired` | 리프레시 토큰 만료·취소(`AADSTS700082`, `50173`), 비밀번호 변경, 세션 취소 | 재로그인 |
| `grace_expired` | 오프라인 유예 초과 | 네트워크 연결 후 재로그인 |
| `misconfigured` | `auth:` 값 오류 | 킷 `provision.yaml` 수정 후 `version` 올려 재배포 |

## 운영 메모

- 로그에 이메일을 남기지 않는다(`oid` 만). Sentry `setUser` 도 바꾸지 않는다.
- id_token 서명은 검증하지 않는다 — 토큰은 TLS 로 Microsoft 에서 직접 받고, 공개 클라이언트(PKCE) 관행을 따른다. 위조 가능한 경로는 로컬 PC 장악이 전제라 금고와 같은 신뢰 경계다.
- 그룹 제거가 리프레시 시점에 평가되는지는 스모크로 확인할 것. 확인 전까지 하드 회수는 ⑧의 계정 비활성.
- 게스트 토큰에 `email` 클레임이 없을 수 있다. 앱은 `email → preferred_username → upn → #EXT# 역변환` 순으로 폴백한다.
- 미국 법인이 B2B 게스트를 거부하면 멀티테넌트 앱으로 전환한다 — 코드 변경 없이 `tenantId` 만 바꾸고, 변경 요청은 릴레이 폴백([change-requests.md](change-requests.md) 예정) 을 쓴다.

관련 파일: `apps/desktop/packages/shared/src/auth/entra-signin.ts`(순수 판단 로직), `apps/desktop/apps/electron/src/main/identity.ts`(IPC·금고), `renderer/components/onboarding/SignInGate.tsx`(게이트 UI).
