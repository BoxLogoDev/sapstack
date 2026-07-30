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
for (const filename of ["asset-manifest.json", "CLAUDE.md"]) {
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
