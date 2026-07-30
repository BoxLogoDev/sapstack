import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'asset-manifest.json'), 'utf8'));
const { plugins, agents, commands, tools, prompts, resources } = manifest.counts;
const marker = `sapstack-stats: version=${manifest.productVersion} plugins=${plugins} agents=${agents} commands=${commands} tools=${tools} prompts=${prompts} resources=${resources}`;
const documents = [
  'README.md',
  'AGENTS.md',
  'docs/architecture.md',
  'docs/kiro-quickstart.md',
  'docs/kiro-integration.md',
  'mcp/README.md',
];

const missing = [];
for (const document of documents) {
  const text = await readFile(path.join(root, document), 'utf8');
  if (!text.includes(marker)) missing.push(document);
}
if (missing.length) {
  console.error(`Documentation stats are stale or missing in: ${missing.join(', ')}`);
  console.error(`Expected marker: <!-- ${marker} -->`);
  process.exit(1);
}
console.log(`documentation stats OK in ${documents.length} files`);
