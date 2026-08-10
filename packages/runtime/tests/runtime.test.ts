import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { buildSupportBundle, FileSystemAssetProvider, SapstackRuntime } from "../src/index.js";

const repositoryRoot = path.resolve(fileURLToPath(new URL("../../../", import.meta.url)));

async function runtimeFixture() {
  const sessionsDir = await mkdtemp(path.join(tmpdir(), "sapstack-runtime-"));
  const runtime = await SapstackRuntime.create({
    assets: new FileSystemAssetProvider(repositoryRoot),
    sessionsDir,
  });
  return { runtime, sessionsDir };
}

function evidence(sessionId: string, index = 1) {
  return {
    session_id: sessionId,
    turn_number: index === 1 ? 1 : 3,
    collected_by: { role: "operator", sap_user_redacted: true },
    sap_context: {
      release: "S4_2022",
      deployment: "on_premise",
      country_iso: "kr",
      language: "ko",
    },
    items: [{
      item_id: "evi-001",
      kind: "message_text",
      source: { type: "tcode", tcode: "F110" },
      inline_content: `F110 proposal result ${index}`,
    }],
  };
}

const hypothesisInputs = ["LFB1 payment method is missing", "FBZP determination is incomplete"].map((statement, index) => ({
  statement,
  technical_chain: ["The observed configuration affects proposal selection"],
  confidence_tier: index ? "low" : "high",
  impacted_modules: ["FI"],
  falsification_evidence: [
    { if_observed: "The relevant configuration is complete", then: "refute" },
    { if_observed: "A control vendor has the same failure", then: "weaken" },
  ],
  related_tcodes: ["F110"],
  consultant_agents_to_involve: ["sap-fi-consultant"],
}));

test("catalog and knowledge services use the canonical repository assets", async t => {
  const { runtime, sessionsDir } = await runtimeFixture();
  t.after(() => rm(sessionsDir, { recursive: true, force: true }));

  assert.equal((await runtime.catalog.plugins()).length, 24);
  assert.equal((await runtime.catalog.agents()).length, 20);
  assert.equal((await runtime.catalog.commands()).length, 22);
  assert.equal((await runtime.knowledge.checkTcode("F110")).verified, true);
  assert.ok((await runtime.knowledge.resolveSymptom({ query: "F110 payment method" })).length > 0);
  assert.equal((await runtime.knowledge.lookupSynonym("코스트센터")).canonical, "cost_center");
});

test("security scrubs PII and rejects path traversal", async t => {
  const { runtime, sessionsDir } = await runtimeFixture();
  t.after(() => rm(sessionsDir, { recursive: true, force: true }));

  const result = runtime.security.scrub("user@example.com 900101-1234567 010-1234-5678");
  assert.equal(result.hitCount, 3);
  assert.doesNotMatch(result.scrubbedText, /900101-1234567|010-1234-5678/);
  assert.throws(() => runtime.security.resolveInside(sessionsDir, "../outside"), /traversal/);
});

test("support bundles contain diagnostics without customer data", async t => {
  const { runtime, sessionsDir } = await runtimeFixture();
  t.after(() => rm(sessionsDir, { recursive: true, force: true }));

  const bundle = buildSupportBundle({
    appVersion: "1.5.0",
    platform: "win32",
    arch: "x64",
    runtime: await runtime.assets.manifest(),
    environment: {
      release: "S4_2022",
      deployment: "on_premise",
      language: "ko",
      industry: "Secret Customer Industry",
      client: "100",
    },
  });
  const serialized = JSON.stringify(bundle);
  assert.equal(bundle.environment.release, "S4_2022");
  assert.doesNotMatch(serialized, /Secret Customer Industry|"100"/);
  assert.ok(bundle.excluded.includes("evidence"));
});

test("Evidence Loop completes the canonical four-turn flow", async t => {
  const { runtime, sessionsDir } = await runtimeFixture();
  t.after(() => rm(sessionsDir, { recursive: true, force: true }));

  const started = await runtime.sessions.start({
    symptom: "F110 proposal fails for one vendor",
    reporter_role: "operator",
    release: "S4_2022",
    deployment: "on_premise",
    industry: "manufacturing",
    country_iso: "kr",
    language: "ko",
  });
  await runtime.sessions.addEvidence({ session_id: started.session_id, bundle: evidence(started.session_id) });
  await runtime.sessions.submitHypotheses({ session_id: started.session_id, hypotheses: hypothesisInputs });
  await runtime.sessions.addFollowup({
    session_id: started.session_id,
    items: [{
      purpose: "Check the vendor payment method without changing data",
      hypothesis_ids: ["h-001", "h-002"],
      action: { type: "query_table", table: "LFB1", fields_of_interest: ["ZWELS"] },
      expected_outcome: "A populated ZWELS refutes the first hypothesis",
      priority: "critical",
      estimated_minutes: 3,
      output_format: "text_paste",
    }],
  });
  await runtime.sessions.next({ session_id: started.session_id });
  await runtime.sessions.addEvidence({ session_id: started.session_id, bundle: evidence(started.session_id, 2) });
  const transition = await runtime.sessions.next({ session_id: started.session_id });
  assert.equal(transition.signal, "verify_hypotheses");

  await runtime.sessions.submitVerdict({
    session_id: started.session_id,
    overall_state: "resolved",
    summary: "The vendor payment method configuration is the confirmed cause.",
    resolutions: [{
      hypothesis_id: "h-001",
      status: "confirmed",
      fix_plan: {
        audience: "operator",
        steps: [{
          step_number: 1,
          description: "Update the vendor payment method after approval",
          tcode: "XK02",
          menu_path: "Accounting > Financial Accounting > Accounts Payable > Master Records > Change",
          simulation_first: false,
        }],
        reviewer_required: true,
        transport_required: false,
      },
      rollback_plan: {
        steps: [{ step_number: 1, description: "Restore the previous value", tcode: "XK02", menu_path: "Accounting > Financial Accounting > Accounts Payable > Master Records > Change" }],
        trigger_conditions: ["The follow-up payment proposal introduces a new error"],
      },
    }],
  });

  const state = await runtime.sessions.get(started.session_id);
  assert.equal(state.status, "resolved");
  assert.equal(state.turns.at(-1).turn_type, "verify");
  assert.equal(state.bundles.length, 2);
  assert.equal(state.verdicts.length, 1);
});

test("session mutations are serialized without lost evidence", async t => {
  const { runtime, sessionsDir } = await runtimeFixture();
  t.after(() => rm(sessionsDir, { recursive: true, force: true }));
  const started = await runtime.sessions.start({ symptom: "Concurrent evidence test" });

  await Promise.all(Array.from({ length: 12 }, (_, index) => runtime.sessions.addEvidence({
    session_id: started.session_id,
    bundle: evidence(started.session_id, index + 1),
  })));
  assert.equal((await runtime.sessions.get(started.session_id)).bundles.length, 12);
});

test("Desktop sessions preserve their originating surface in the audit trail", async t => {
  const { runtime, sessionsDir } = await runtimeFixture();
  t.after(() => rm(sessionsDir, { recursive: true, force: true }));
  const started = await runtime.sessions.start({ symptom: "Desktop intake", surface: "desktop" });
  await runtime.sessions.addEvidence({ session_id: started.session_id, bundle: evidence(started.session_id), surface: "desktop" });

  const state = await runtime.sessions.get(started.session_id);
  assert.equal(state.originating_surface, "desktop");
  assert.equal(state.turns[0].surface, "desktop");
  assert.deepEqual(state.audit_trail.map((entry: any) => entry.actor.surface), ["desktop", "desktop"]);
});

test("resolved verdicts require environment, fix, and rollback", async t => {
  const { runtime, sessionsDir } = await runtimeFixture();
  t.after(() => rm(sessionsDir, { recursive: true, force: true }));
  const started = await runtime.sessions.start({ symptom: "Missing environment test" });

  await assert.rejects(() => runtime.sessions.submitVerdict({
    session_id: started.session_id,
    overall_state: "resolved",
    summary: "Should fail",
    resolutions: [{ hypothesis_id: "h-001", status: "confirmed" }],
  }), /environment intake/);
});
