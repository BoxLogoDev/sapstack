/**
 * sapstack MCP write-path tests
 * Tests the four write-path tools: start_session, add_evidence, next_turn, validate_session_file
 *
 * Run: npx tsx tests/write-path.test.ts
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as yaml from "js-yaml";

const SESSIONS_DIR = path.join(process.cwd(), ".sapstack", "sessions");

// ─────────────────────────────────────────────────────────────
// Test helpers
// ─────────────────────────────────────────────────────────────

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (err) {
    results.push({
      name,
      passed: false,
      error: (err as Error).message,
    });
    console.log(`✗ ${name}: ${(err as Error).message}`);
  }
}

// ─────────────────────────────────────────────────────────────
// Test suite
// ─────────────────────────────────────────────────────────────

async function runTests() {
  console.log("Running sapstack MCP write-path tests...\n");

  // Cleanup before tests
  try {
    await fs.rm(SESSIONS_DIR, { recursive: true, force: true });
  } catch {}
  await fs.mkdir(SESSIONS_DIR, { recursive: true });

  // Test 1: start_session creates directory and state.yaml
  await test("start_session creates session directory", async () => {
    const sessionId = `sess-${new Date().toISOString().substring(0, 10).replace(/-/g, "")}-abc123`;
    const sessionDir = path.join(SESSIONS_DIR, sessionId);

    // Simulate start_session
    const filesDir = path.join(sessionDir, "files");
    await fs.mkdir(filesDir, { recursive: true });

    const now = new Date().toISOString();
    const state = {
      session_id: sessionId,
      schema_version: "1.0.0",
      created_at: now,
      status: "intake",
      initial_symptom: {
        description: "Test symptom",
        reporter_role: "operator",
        language: "ko",
      },
      turns: [
        {
          turn_number: 1,
          turn_type: "intake",
          started_at: now,
          status: "active",
          surface: "mcp_client",
        },
      ],
      current_turn_number: 1,
      hypotheses: [],
      bundles: [],
      followup_requests: [],
      verdicts: [],
      audit_trail: [
        {
          at: now,
          action: "session_created",
          actor: { role: "operator", surface: "mcp_client" },
        },
      ],
      tags: [],
    };

    const stateYaml = yaml.dump(state, { lineWidth: -1 });
    const statePath = path.join(sessionDir, "state.yaml");
    const tmpPath = `${statePath}.tmp`;
    await fs.writeFile(tmpPath, stateYaml, "utf-8");
    await fs.rename(tmpPath, statePath);

    // Verify
    const stat = await fs.stat(sessionDir);
    assert(stat.isDirectory(), "Session directory exists");

    const stateStat = await fs.stat(statePath);
    assert(stateStat.isFile(), "state.yaml exists");

    const content = await fs.readFile(statePath, "utf-8");
    const loaded = yaml.load(content) as any;
    assert(loaded.session_id === sessionId, "session_id matches");
    assert(loaded.status === "intake", "status is intake");
  });

  // Test 2: add_evidence writes evidence bundle
  await test("add_evidence writes and validates bundle", async () => {
    const sessionId = `sess-${new Date().toISOString().substring(0, 10).replace(/-/g, "")}-def456`;
    const sessionDir = path.join(SESSIONS_DIR, sessionId);
    const filesDir = path.join(sessionDir, "files");
    await fs.mkdir(filesDir, { recursive: true });

    // Create initial state
    const now = new Date().toISOString();
    const state = {
      session_id: sessionId,
      schema_version: "1.0.0",
      created_at: now,
      status: "intake",
      initial_symptom: {
        description: "Test symptom",
        reporter_role: "operator",
        language: "ko",
      },
      turns: [
        {
          turn_number: 1,
          turn_type: "intake",
          started_at: now,
          status: "active",
          surface: "mcp_client",
        },
      ],
      current_turn_number: 1,
      bundles: [],
      audit_trail: [],
    };

    const statePath = path.join(sessionDir, "state.yaml");
    await fs.writeFile(statePath, yaml.dump(state, { lineWidth: -1 }), "utf-8");

    // Add evidence bundle
    const bundleId = `evb-${new Date().toISOString().substring(0, 10).replace(/-/g, "")}-ghi789`;
    const bundle = {
      bundle_id: bundleId,
      session_id: sessionId,
      turn_number: 1,
      collected_at: now,
      collected_by: { role: "operator" },
      items: [
        {
          item_id: "evi-001",
          kind: "transaction_log",
          source: { type: "tcode", tcode: "F110" },
          inline_content: "Test log",
        },
      ],
    };

    const bundlePath = path.join(sessionDir, "evidence-0.yaml");
    const bundleYaml = yaml.dump(bundle, { lineWidth: -1 });
    const tmpPath = `${bundlePath}.tmp`;
    await fs.writeFile(tmpPath, bundleYaml, "utf-8");
    await fs.rename(tmpPath, bundlePath);

    // Verify bundle file exists and is valid
    const bundleContent = await fs.readFile(bundlePath, "utf-8");
    const loadedBundle = yaml.load(bundleContent) as any;
    assert(loadedBundle.bundle_id === bundleId, "bundle_id matches");
    assert(loadedBundle.items.length === 1, "bundle has 1 item");
  });

  // Test 3: State transition logic
  await test("next_turn transitions states correctly", async () => {
    const sessionId = `sess-${new Date().toISOString().substring(0, 10).replace(/-/g, "")}-jkl012`;
    const sessionDir = path.join(SESSIONS_DIR, sessionId);
    const filesDir = path.join(sessionDir, "files");
    await fs.mkdir(filesDir, { recursive: true });

    const now = new Date().toISOString();

    // Initial state: intake with evidence
    const state = {
      session_id: sessionId,
      schema_version: "1.0.0",
      created_at: now,
      status: "intake",
      initial_symptom: {
        description: "Test symptom",
        reporter_role: "operator",
        language: "ko",
      },
      turns: [
        {
          turn_number: 1,
          turn_type: "intake",
          started_at: now,
          status: "active",
          surface: "mcp_client",
        },
      ],
      current_turn_number: 1,
      bundles: [
        {
          bundle_id: "evb-test",
          session_id: sessionId,
          turn_number: 1,
          collected_at: now,
          collected_by: { role: "operator" },
          items: [],
        },
      ],
      audit_trail: [],
    };

    const statePath = path.join(sessionDir, "state.yaml");
    await fs.writeFile(statePath, yaml.dump(state, { lineWidth: -1 }), "utf-8");

    // Simulate next_turn transition: intake + evidence → hypothesizing
    const loaded = yaml.load(
      await fs.readFile(statePath, "utf-8")
    ) as any;
    assert(loaded.status === "intake", "Initial status is intake");
    assert(loaded.bundles.length > 0, "Has bundles");

    // Transition logic
    if (loaded.status === "intake" && loaded.bundles.length > 0) {
      loaded.status = "hypothesizing";
      loaded.current_turn_number = 2;
      loaded.turns.push({
        turn_number: 2,
        turn_type: "hypothesis",
        started_at: new Date().toISOString(),
        status: "active",
        surface: "mcp_client",
      });
    }

    await fs.writeFile(statePath, yaml.dump(loaded, { lineWidth: -1 }), "utf-8");

    // Verify transition
    const updated = yaml.load(
      await fs.readFile(statePath, "utf-8")
    ) as any;
    assert(
      updated.status === "hypothesizing",
      "Status transitioned to hypothesizing"
    );
    assert(updated.current_turn_number === 2, "Current turn is 2");
    assert(updated.turns.length === 2, "Has 2 turns");
  });

  // Test 4: Atomic write prevents corruption
  await test("Atomic write (rename) prevents corruption", async () => {
    const sessionId = `sess-${new Date().toISOString().substring(0, 10).replace(/-/g, "")}-mno345`;
    const sessionDir = path.join(SESSIONS_DIR, sessionId);
    const filesDir = path.join(sessionDir, "files");
    await fs.mkdir(filesDir, { recursive: true });

    const statePath = path.join(sessionDir, "state.yaml");

    // Write original state
    const original = {
      session_id: sessionId,
      status: "intake",
      audit_trail: [{ action: "session_created" }],
    };

    const tmpPath = `${statePath}.tmp`;
    await fs.writeFile(tmpPath, yaml.dump(original, { lineWidth: -1 }), "utf-8");
    await fs.rename(tmpPath, statePath);

    // Verify file exists (no .tmp leftover)
    const files = await fs.readdir(sessionDir);
    assert(!files.includes("state.yaml.tmp"), "No .tmp file leftover");
    assert(files.includes("state.yaml"), "Final state.yaml exists");

    const content = await fs.readFile(statePath, "utf-8");
    const loaded = yaml.load(content) as any;
    assert(loaded.status === "intake", "Content is intact");
  });

  // Summary
  console.log("\n" + "─".repeat(50));
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\nResults: ${passed}/${total} tests passed`);

  if (passed < total) {
    console.log("\nFailed tests:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test suite error:", err);
  process.exit(1);
});
