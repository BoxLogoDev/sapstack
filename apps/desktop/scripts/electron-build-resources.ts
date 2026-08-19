/**
 * Cross-platform resources copy script
 *
 * 두 가지를 dist/resources 로 모은다.
 *  1) apps/electron/resources/ 의 정적 자산
 *  2) 서브프로세스로 뜨는 서버 패키지의 빌드 산출물
 *
 * 2번이 빠지면 패키징된 앱에서 `resolveServerPath` 가 경로를 못 찾아
 * `piServerPath not configured. Cannot spawn Pi subprocess.` 로 채팅이 죽는다.
 * electron-builder.yml 은 `resources/pi-agent-server/**` 를 files 에 넣지만,
 * 그 디렉토리를 만드는 주체는 이 스크립트다.
 */

import { existsSync, cpSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT_DIR = join(import.meta.dir, "..");
const ELECTRON_DIR = join(ROOT_DIR, "apps/electron");

const srcDir = join(ELECTRON_DIR, "resources");
const destDir = join(ELECTRON_DIR, "dist/resources");

if (existsSync(srcDir)) {
  cpSync(srcDir, destDir, { recursive: true, force: true });
  console.log("📦 Copied resources to dist");
} else {
  console.log("⚠️ No resources directory found");
}

// 서브프로세스 서버 — `packages/<name>/dist` 를 `resources/<name>` 으로.
// 패키징 시 resolveServerPath 가 `resources/<name>/index.js` 를 찾는다.
const SUBPROCESS_SERVERS = ["pi-agent-server", "session-mcp-server"] as const;

let missing = 0;
for (const name of SUBPROCESS_SERVERS) {
  const from = join(ROOT_DIR, "packages", name, "dist");
  const to = join(destDir, name);

  if (!existsSync(join(from, "index.js"))) {
    console.error(
      `❌ ${name}: ${from}/index.js 가 없다. 'bun run server:build:subprocess' 를 먼저 실행하라.`,
    );
    missing += 1;
    continue;
  }

  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true, force: true });
  console.log(`📦 Copied ${name} → dist/resources/${name}`);
}

// 조용히 넘어가면 설치본에서만 드러난다. 빌드 시점에 시끄럽게 실패시킨다.
if (missing > 0) {
  console.error(
    `\n서브프로세스 서버 ${missing}개가 누락된 채로는 패키징하지 않는다 — ` +
      `설치본에서 로컬 모델 채팅이 piServerPath 오류로 죽는다.`,
  );
  process.exit(1);
}
