import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const execFile = promisify(execFileCallback);
const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'sapstack-mcp-pack-'));
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('npm_execpath is required; run this script through npm run test:pack');
const runNpm = (args, options) => execFile(process.execPath, [npmCli, ...args], options);

function parsePackJson(stdout) {
  const start = stdout.lastIndexOf('\n[');
  return JSON.parse(stdout.slice(start >= 0 ? start + 1 : stdout.indexOf('[')));
}

try {
  const packed = await runNpm(['pack', '--workspaces=false', '--json', '--pack-destination', temporaryRoot], {
    cwd: packageDir,
    maxBuffer: 20 * 1024 * 1024,
  });
  const [{ filename, files }] = parsePackJson(packed.stdout);
  for (const required of ['dist/cli.js', 'assets/asset-manifest.json', 'assets/data/tcodes.yaml', 'assets/schemas/session-state.schema.yaml']) {
    assert.ok(files.some(file => file.path === required), `tarball is missing ${required}`);
  }

  const installRoot = path.join(temporaryRoot, 'install');
  await mkdir(installRoot);
  await writeFile(path.join(installRoot, 'package.json'), '{"private":true}\n');
  await runNpm(['install', path.join(temporaryRoot, filename)], { cwd: installRoot, maxBuffer: 20 * 1024 * 1024 });

  const installed = path.join(installRoot, 'node_modules', '@boxlogodev', 'sapstack-mcp');
  await access(path.join(installed, 'assets', 'data', 'tcodes.yaml'));
  const client = new Client({ name: 'sapstack-pack-smoke', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(installed, 'dist', 'cli.js')],
    cwd: installRoot,
    stderr: 'pipe',
  });
  await client.connect(transport);
  try {
    assert.equal((await client.listTools()).tools.length, 23);
    const tcode = await client.callTool({ name: 'check_tcode', arguments: { tcode: 'F110' } });
    assert.equal(JSON.parse(tcode.content[0].text).verified, true);
    const symptoms = await client.callTool({ name: 'resolve_symptom', arguments: { query: 'F110 payment method' } });
    assert.ok(JSON.parse(symptoms.content[0].text).length > 0);

    const started = await client.callTool({
      name: 'start_session',
      arguments: { symptom: 'pack smoke', release: 'S4_2022', deployment: 'on_premise', industry: 'manufacturing' },
    });
    const sessionId = JSON.parse(started.content[0].text).session_id;
    const bundle = turn => JSON.stringify({
      session_id: sessionId,
      turn_number: turn,
      collected_by: { role: 'operator' },
      items: [{ item_id: 'evi-001', kind: 'message_text', source: { type: 'tcode', tcode: 'F110' }, inline_content: `turn ${turn}` }],
    });
    await client.callTool({ name: 'add_evidence', arguments: { session_id: sessionId, bundle_yaml: bundle(1) } });
    await client.callTool({ name: 'submit_hypothesis', arguments: {
      session_id: sessionId,
      hypotheses: ['Vendor setup', 'Payment configuration'].map(statement => ({
        statement,
        falsification_evidence: [
          { if_observed: 'Configuration is complete', then: 'refute' },
          { if_observed: 'Control case also fails', then: 'weaken' },
        ],
      })),
    } });
    await client.callTool({ name: 'add_followup_request', arguments: {
      session_id: sessionId,
      items: [{ purpose: 'Read configuration', hypothesis_ids: ['h-001', 'h-002'], action: { type: 'query_table', table: 'LFB1' }, priority: 'critical', estimated_minutes: 1 }],
    } });
    await client.callTool({ name: 'next_turn', arguments: { session_id: sessionId } });
    await client.callTool({ name: 'add_evidence', arguments: { session_id: sessionId, bundle_yaml: bundle(3) } });
    const verify = await client.callTool({ name: 'next_turn', arguments: { session_id: sessionId } });
    assert.equal(JSON.parse(verify.content[0].text).signal, 'verify_hypotheses');
  } finally {
    await client.close();
  }
  console.log('npm pack clean-install smoke OK');
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
