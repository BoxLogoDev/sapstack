import { cp, mkdir, rm } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(packageDir, "..");
const assetsDir = path.join(packageDir, "assets");

await rm(path.join(packageDir, "dist"), { recursive: true, force: true });
await rm(assetsDir, { recursive: true, force: true });
await mkdir(assetsDir, { recursive: true });

for (const directory of ["plugins", "agents", "commands", "data", "schemas"]) {
  await cp(path.join(repositoryRoot, directory), path.join(assetsDir, directory), { recursive: true });
}
// AGENTS.md 가 Universal Rules 정본이다(CLAUDE.md 는 Claude/gstack 라우팅만 담는
// 얇은 포인터). `sapstack://rules/universal` 리소스가 이 파일을 서빙한다.
for (const filename of ["asset-manifest.json", "AGENTS.md"]) {
  await cp(path.join(repositoryRoot, filename), path.join(assetsDir, filename));
}

await build({
  entryPoints: [path.join(packageDir, "server.ts"), path.join(packageDir, "cli.ts")],
  outdir: path.join(packageDir, "dist"),
  entryNames: "[name]",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  packages: "external",
  sourcemap: true,
});
