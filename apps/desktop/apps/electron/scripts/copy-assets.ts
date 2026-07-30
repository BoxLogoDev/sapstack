/**
 * Cross-platform asset copy script.
 *
 * Copies the resources/ directory to dist/resources/.
 * All bundled assets (docs, themes, permissions, tool-icons) now live in resources/
 * which electron-builder handles natively via directories.buildResources.
 *
 * At Electron startup, setBundledAssetsRoot(__dirname) is called, and then
 * getBundledAssetsDir('docs') resolves to <__dirname>/resources/docs/, etc.
 *
 * Run: bun scripts/copy-assets.ts
 */

import { cpSync, copyFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

// Copy all resources (icons, themes, docs, permissions, tool-icons, etc.)
cpSync('resources', 'dist/resources', { recursive: true });

console.log('✓ Copied resources/ → dist/resources/');

// Bundle the canonical sapstack assets used by the in-process runtime. This is
// the same asset contract shipped by the npm MCP package.
const repositoryRoot = resolve('../../../..');
const sapstackAssetsDest = join('dist', 'resources', 'sapstack');
mkdirSync(sapstackAssetsDest, { recursive: true });
for (const directory of ['plugins', 'agents', 'commands', 'data', 'schemas']) {
  cpSync(join(repositoryRoot, directory), join(sapstackAssetsDest, directory), { recursive: true });
}
for (const filename of ['asset-manifest.json', 'CLAUDE.md']) {
  copyFileSync(join(repositoryRoot, filename), join(sapstackAssetsDest, filename));
}
console.log('✓ Copied canonical sapstack assets → dist/resources/sapstack/');

// Copy PowerShell parser script (for Windows command validation in Explore mode)
// Source: packages/shared/src/agent/powershell-parser.ps1
// Destination: dist/resources/powershell-parser.ps1
const psParserSrc = join('..', '..', 'packages', 'shared', 'src', 'agent', 'powershell-parser.ps1');
const psParserDest = join('dist', 'resources', 'powershell-parser.ps1');
try {
  copyFileSync(psParserSrc, psParserDest);
  console.log('✓ Copied powershell-parser.ps1 → dist/resources/');
} catch (err) {
  // Only warn - PowerShell validation is optional on non-Windows platforms
  console.log('⚠ powershell-parser.ps1 copy skipped (not critical on non-Windows)');
}
