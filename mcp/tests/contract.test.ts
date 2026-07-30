import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { FileSystemAssetProvider, SapstackRuntime } from "../../packages/runtime/src/index.js";
import { PROMPT_REGISTRY, RESOURCE_REGISTRY, RESOURCE_TEMPLATE_REGISTRY, TOOL_REGISTRY } from "../registry.js";
import { createSapstackMcpServer } from "../server.js";

const repositoryRoot = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));

async function fixture(t: test.TestContext) {
  const sessionsDir = await mkdtemp(path.join(tmpdir(), "sapstack-mcp-contract-"));
  const runtime = await SapstackRuntime.create({
    assets: new FileSystemAssetProvider(repositoryRoot),
    sessionsDir,
  });
  const server = createSapstackMcpServer(runtime);
  const client = new Client({ name: "sapstack-contract-test", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
    await rm(sessionsDir, { recursive: true, force: true });
  });
  return { client, runtime };
}

function value(result: Awaited<ReturnType<Client["callTool"]>>): any {
  const block = (result.content as Array<{ type: string; text?: string }>)[0];
  assert.equal(block?.type, "text");
  assert.ok(block.text);
  return JSON.parse(block.text);
}

test("MCP exposes exactly the registry-backed tools, prompts, and resources", async t => {
  const { client } = await fixture(t);
  const tools = await client.listTools();
  const prompts = await client.listPrompts();
  const resources = await client.listResources();
  const templates = await client.listResourceTemplates();

  assert.deepEqual(tools.tools.map(tool => tool.name), TOOL_REGISTRY.map(tool => tool.name));
  assert.equal(tools.tools.length, 23);
  assert.deepEqual(prompts.prompts.map(prompt => prompt.name), PROMPT_REGISTRY.map(prompt => prompt.name));
  assert.equal(prompts.prompts.length, 12);
  assert.deepEqual(resources.resources.map(resource => resource.uri), RESOURCE_REGISTRY.map(resource => resource.uri));
  assert.deepEqual(templates.resourceTemplates.map(template => template.uriTemplate), RESOURCE_TEMPLATE_REGISTRY.map(template => template.uriTemplate));
  assert.equal(resources.resources.length + templates.resourceTemplates.length, 9);
});

test("MCP knowledge results are equivalent to direct runtime calls", async t => {
  const { client, runtime } = await fixture(t);
  const throughMcp = value(await client.callTool({ name: "check_tcode", arguments: { tcode: "F110" } }));
  assert.deepEqual(throughMcp, await runtime.knowledge.checkTcode("F110"));

  const symptom = value(await client.callTool({ name: "resolve_symptom", arguments: { query: "F110 payment method", language: "en" } }));
  assert.deepEqual(symptom, await runtime.knowledge.resolveSymptom({ query: "F110 payment method", language: "en" }));

  const prompt = await client.getPrompt({ name: "sap-fi-consultant", arguments: { issue: "F110 proposal failed" } });
  assert.match((prompt.messages[0].content as { text: string }).text, /F110 proposal failed/);
  const rules = await client.readResource({ uri: "sapstack://rules/universal" });
  assert.match((rules.contents[0] as { text: string }).text, /Universal Rules/);
});

test("MCP client completes a four-turn Evidence Loop", async t => {
  const { client } = await fixture(t);
  const started = value(await client.callTool({
    name: "start_session",
    arguments: {
      symptom: "F110 proposal fails",
      release: "S4_2022",
      deployment: "on_premise",
      industry: "manufacturing",
      country_iso: "kr",
      language: "ko",
    },
  }));
  const sessionId = started.session_id as string;
  const bundle = (turn: number) => ({
    session_id: sessionId,
    turn_number: turn,
    collected_by: { role: "operator" },
    items: [{ item_id: "evi-001", kind: "message_text", source: { type: "tcode", tcode: "F110" }, inline_content: `turn ${turn}` }],
  });
  await client.callTool({ name: "add_evidence", arguments: { session_id: sessionId, bundle_yaml: JSON.stringify(bundle(1)) } });
  await client.callTool({
    name: "submit_hypothesis",
    arguments: {
      session_id: sessionId,
      hypotheses: ["Vendor payment method missing", "Bank determination incomplete"].map(statement => ({
        statement,
        technical_chain: ["Configuration influences proposal selection"],
        confidence_tier: "medium",
        falsification_evidence: [
          { if_observed: "Configuration is complete", then: "refute" },
          { if_observed: "Control vendor also fails", then: "weaken" },
        ],
      })),
    },
  });
  await client.callTool({
    name: "add_followup_request",
    arguments: {
      session_id: sessionId,
      items: [{
        purpose: "Read the vendor payment method",
        hypothesis_ids: ["h-001", "h-002"],
        action: { type: "query_table", table: "LFB1" },
        priority: "critical",
        estimated_minutes: 2,
      }],
    },
  });
  await client.callTool({ name: "next_turn", arguments: { session_id: sessionId } });
  await client.callTool({ name: "add_evidence", arguments: { session_id: sessionId, bundle_yaml: JSON.stringify(bundle(3)) } });
  const verification = value(await client.callTool({ name: "next_turn", arguments: { session_id: sessionId } }));
  assert.equal(verification.signal, "verify_hypotheses");

  await client.callTool({
    name: "submit_verdict",
    arguments: {
      session_id: sessionId,
      overall_state: "resolved",
      summary: "Payment method configuration confirmed",
      resolutions: [{
        hypothesis_id: "h-001",
        status: "confirmed",
        fix_plan: {
          steps: [{ step_number: 1, description: "Apply the approved master-data correction", tcode: "XK02", menu_path: "Accounting > Financial Accounting > Accounts Payable > Master Records > Change", simulation_first: false }],
          reviewer_required: true,
          transport_required: false,
        },
        rollback_plan: {
          steps: [{ step_number: 1, description: "Restore the prior value", tcode: "XK02", menu_path: "Accounting > Financial Accounting > Accounts Payable > Master Records > Change" }],
          trigger_conditions: ["The payment proposal produces a new error"],
        },
      }],
    },
  });
  const session = await client.readResource({ uri: `sapstack://session/${sessionId}` });
  assert.match((session.contents[0] as { text: string }).text, /status: resolved/);
});
