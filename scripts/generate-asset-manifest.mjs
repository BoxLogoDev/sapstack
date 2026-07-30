import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');

async function countDirectories(relativePath) {
  return (await readdir(path.join(root, relativePath), { withFileTypes: true })).filter(entry => entry.isDirectory()).length;
}

async function countMarkdown(relativePath) {
  return (await readdir(path.join(root, relativePath), { withFileTypes: true })).filter(entry => entry.isFile() && entry.name.endsWith('.md')).length;
}

function section(source, start, end) {
  const from = source.indexOf(start);
  const to = end ? source.indexOf(end, from + start.length) : source.length;
  if (from < 0 || to < 0) throw new Error(`Registry section missing: ${start}`);
  return source.slice(from, to);
}

function namedEntries(source) {
  return [...source.matchAll(/^\s{2}\{/gm)].length;
}

const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const registry = await readFile(path.join(root, 'mcp', 'registry.ts'), 'utf8');
const existingPath = path.join(root, 'asset-manifest.json');
let existing;
try { existing = JSON.parse(await readFile(existingPath, 'utf8')); } catch { existing = undefined; }

const required = [
  'data/tcodes.yaml',
  'data/sap-notes.yaml',
  'data/symptom-index.yaml',
  'data/synonyms.yaml',
  'schemas/evidence-bundle.schema.yaml',
  'schemas/followup-request.schema.yaml',
  'schemas/hypothesis.schema.yaml',
  'schemas/verdict.schema.yaml',
  'schemas/session-state.schema.yaml',
];
for (const filename of required) await stat(path.join(root, filename));

const tools = namedEntries(section(registry, 'export const TOOL_REGISTRY', 'export const PROMPT_REGISTRY'));
const prompts = namedEntries(section(registry, 'export const PROMPT_REGISTRY', 'export const RESOURCE_REGISTRY'));
const staticResources = namedEntries(section(registry, 'export const RESOURCE_REGISTRY', 'export const RESOURCE_TEMPLATE_REGISTRY'));
const templates = namedEntries(section(registry, 'export const RESOURCE_TEMPLATE_REGISTRY', 'const toolsByName'));
const manifest = {
  $schema: './schemas/asset-manifest.schema.json',
  formatVersion: 1,
  productVersion: packageJson.version,
  generatedAt: existing?.generatedAt || new Date().toISOString(),
  counts: {
    plugins: await countDirectories('plugins'),
    agents: await countMarkdown('agents'),
    commands: await countMarkdown('commands'),
    tools,
    prompts,
    resources: staticResources + templates,
  },
  roots: ['plugins', 'agents', 'commands', 'data', 'schemas'],
  required,
};

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
if (checkOnly) {
  const current = await readFile(existingPath, 'utf8');
  if (current !== serialized) {
    console.error('asset-manifest.json is stale. Run: node scripts/generate-asset-manifest.mjs');
    process.exit(1);
  }
  console.log(`asset manifest OK: ${JSON.stringify(manifest.counts)}`);
} else {
  await writeFile(existingPath, serialized);
  console.log(`wrote asset-manifest.json: ${JSON.stringify(manifest.counts)}`);
}
