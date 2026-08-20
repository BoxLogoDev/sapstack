# 릴리스 아티팩트는 워크플로가 올린다 (electron-builder 는 빌드만)

**날짜** 2026-08-19 · **범위** `apps/desktop/apps/electron/scripts/build-win.ps1`, `.github/workflows/release.yml`, `electron-builder.yml`

## 배경

v2.4.1 태그를 세 번 밀었고 세 번 다 Windows 잡에서 죽었다. 세 번째 원인이 이것이다:

```
Error: GitHub Personal Access Token is not set, neither programmatically, nor using env "GH_TOKEN"
    at new GitHubPublisher (electron-publish/src/gitHubPublisher.ts:52:15)
```

`electron-builder.yml` 에 `publish: github` 가 있다. electron-builder 는 CI 환경 + 태그
푸시를 감지하면 기본 정책이 업로드로 바뀌어, 산출물을 **스스로** GitHub Release 에 올리려
한다. 워크플로는 토큰을 넘긴 적이 없으므로 3회 재시도 후 실패한다.

로컬 빌드는 CI 환경변수도 태그도 없어 이 분기를 타지 않는다 — **로컬에서 재현 불가능한
실패**다.

## 결정

**업로드 주체는 워크플로 하나뿐이다.** `build-win.ps1` 은 `--publish never` 로 빌드만
하고, 산출물은 `upload-artifact` → `download-artifact` → `softprops/action-gh-release` 로
Release 에 붙는다.

`electron-builder.yml` 의 `publish: github` 는 **남겨 둔다.** 그것이 설치본의
`app-update.yml`(=electron-updater 가 어느 저장소를 볼지)과 `latest.yml` 생성을 결정한다.
지우면 자동 업데이트가 죽는다.

## 근거

- `latest.yml` 은 `--publish never` 여도 생성된다. `app-builder-lib/out/publish/PublishManager.js`
  에서 업로드 루프는 `if (this.isPublish)` 안이고, `createUpdateInfoTasks`(업데이트 정보 쓰기)는
  그 블록 **밖**의 별도 `if (event.isWriteUpdateInfo)` 다 — 두 관심사가 이미 분리돼 있다
- 워크플로가 이미 `if-no-files-found: error` 로 `latest*.yml` 부재를 잡는다. 이 결정이 틀렸다면
  릴리스가 조용히 나쁜 상태로 나가는 게 아니라 그 자리에서 선다
- 업로드 주체가 둘이면 같은 태그에 draft/non-draft 가 경합한다

## 버린 대안

| 대안                                         | 왜 안 골랐나                                                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` 주입 | 동작은 하지만 업로드 주체가 둘이 된다. electron-builder 가 draft 를 만들고 action-gh-release 가 뒤늦게 덮는 순서 의존 |
| `electron-builder.yml` 에서 `publish` 제거   | `app-update.yml` 과 `latest.yml` 이 사라져 **자동 업데이트가 죽는다**. 증상이 릴리스가 아니라 다음 업데이트 때 나온다 |
| electron-builder 가 릴리스까지 전담          | MCP tarball·VSIX·릴리스 노트가 같은 Release 에 붙어야 한다. 데스크톱만 아는 도구에 전체를 맡길 수 없다                |

## 뒤집는 조건

- 데스크톱 설치파일이 다른 Release/채널로 분리되면 electron-builder 직접 업로드가 더 단순해진다
- electron-builder 가 "업데이트 정보만 쓰고 업로드는 안 함"을 별도 플래그로 노출하면 `publish` 설정을 더 명시적으로 쓸 수 있다

## 주의

`--publish never` 를 지우면 로컬·PR CI 는 전부 통과하고 **태그를 민 순간에만** 실패한다.
릴리스 워크플로를 손댈 때 이 플래그를 제일 먼저 확인할 것.
