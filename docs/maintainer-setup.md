# Maintainer Setup — sapstack

> 이 문서는 sapstack을 publish/release할 수 있는 권한을 가진 메인테이너용입니다.
> 일반 사용자/기여자는 `CONTRIBUTING.md`를 참고하세요.

---

## NPM Publish 권한 (`@boxlogodev/sapstack-mcp`)

### 1. npm 계정 준비
- BoxLogoDev org에 publish 권한이 있는 npm 계정으로 로그인
- 2FA 활성화 권장 (npm Settings → Security → 2FA)

### 2. Automation Token 생성
```bash
npm login
# 2FA OTP 입력 후 로그인 완료

# GitHub Actions에서 사용할 automation 토큰 (2FA 우회 가능)
# npm 웹: https://www.npmjs.com/settings/{username}/tokens
#   → Generate New Token → Classic Token → Automation
#   → copy npm_xxxxx... value
```

### 3. GitHub repo secret 등록
1. `https://github.com/BoxLogoDev/sapstack/settings/secrets/actions`
2. **New repository secret** 클릭
3. Name: `NPM_TOKEN`
4. Value: 위에서 발급한 `npm_xxxxx...` 토큰
5. **Add secret**

### 4. 검증
새 태그를 push해 release.yml을 트리거합니다.

```bash
git tag -a v2.2.4 -m "test publish"
git push origin v2.2.4
gh run watch --workflow=release.yml
```

성공 시 `npm view @boxlogodev/sapstack-mcp@2.2.4`로 확인됩니다.

---

## VS Code Marketplace Publish 권한 (`BoxLogoDev.sapstack-vscode`)

### 1. Azure DevOps PAT 발급
- https://dev.azure.com → User Settings → Personal Access Tokens
- New Token → Marketplace > Manage 권한 부여
- 토큰 복사 (한 번만 표시됨)

### 2. publisher 등록 (최초 1회만)
```bash
cd extension
npx vsce login BoxLogoDev
# 위 PAT 붙여넣기
```

### 3. publish
```bash
cd extension
npm install
npm run package    # vsix 생성 (BoxLogoDev.sapstack-vscode-{version}.vsix)
npm run publish    # marketplace에 게시
```

또는 release.yml이 vsix를 GitHub Release artifact로 첨부하므로, 사용자가 수동으로 다운로드해 설치할 수도 있습니다.

---

## Release 워크플로

### 정기 릴리스 (semver)
```bash
# 1. main이 정상 상태인지 확인
git switch main && git pull && bash scripts/bump-version.sh --check

# 2. 버전 bump
bash scripts/bump-version.sh <new_version>    # 예: 2.3.0
cd mcp && npm install --package-lock-only --ignore-scripts && cd ..

# 3. 호환 레이어 stats sync
bash scripts/build-multi-ai.sh --write

# 4. CHANGELOG 업데이트 (수동, ## [<new_version>] - YYYY-MM-DD 섹션 추가)
$EDITOR CHANGELOG.md

# 5. commit + PR
git switch -c release/v<new_version>
git add .
git commit -m "chore: bump version to <new_version>"
git push -u origin release/v<new_version>
gh pr create --base main

# 6. CI 통과 → 머지

# 7. 태그
git switch main && git pull
git tag -a v<new_version> -m "<release theme>"
git push origin v<new_version>

# 8. release.yml 자동 실행 — GitHub Release / npm publish / Extension vsix
```

### Hotfix 릴리스 (patch)
```bash
git switch -c hotfix/v<patch_version>-<short-name>
# ... fix
bash scripts/bump-version.sh <patch_version>
cd mcp && npm install --package-lock-only --ignore-scripts && cd ..
bash scripts/build-multi-ai.sh --write
# CHANGELOG 추가, commit, push, PR, 머지, tag
```

---

## Release 문제 대응

| 증상 | 가능한 원인 | 조치 |
|---|---|---|
| `npm ci` fail | `mcp/package-lock.json` 누락 | `npm install --package-lock-only` 후 commit |
| `tsc` strict 에러 | `mcp/server.ts` 컴파일 에러 | 로컬 `cd mcp && npm install && npx tsc --noEmit` 로 사전 검증 |
| `Publish MCP to npm` 401 | NPM_TOKEN secret 미설정 | 위 "NPM Publish 권한" 섹션 참조 |
| GitHub Release 미생성 | release.yml 의 다른 단계 fail (현재 npm publish 가 fail 해도 Release 는 생성됨, v2.2.3+) | release.yml 로그에서 fail step 확인 |
| Extension vsix 빌드 fail | `extension/node_modules` 미설치 또는 vsce 권한 | release.yml 의 Extension build step 은 continue-on-error 라 fail 해도 release 진행 |

---

## 참고

- **첫 정상 npm publish**: v2.2.x 시리즈는 v2.2.0/v2.2.1/v2.2.2/v2.2.3 모두 잠재 결함으로 publish 미완료. NPM_TOKEN 등록 후 v2.2.4+ 에서 첫 정상 게시 예상
- **GitHub Releases 페이지**: v2.2.3 이전까지 v2.1.0 이 마지막. v2.2.3 부터 정상 노출
- **release.yml 위치**: `.github/workflows/release.yml`
- **CI 위치**: `.github/workflows/ci.yml`
- **bump 스크립트**: `scripts/bump-version.sh` (5 파일 일괄 sync + `--check` 모드)
