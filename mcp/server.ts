/**
 * sapstack MCP Server — runtime scaffolding (v1.5.0)
 *
 * This file is the TypeScript entry point for the sapstack MCP server
 * declared in mcp/sapstack-server.json. It exposes sapstack's knowledge
 * base + Evidence Loop session management via the Model Context Protocol.
 *
 * ## Design goals
 *
 * 1. **No live SAP connection.** All operations work on local files only.
 * 2. **Workspace-relative.** Sessions live under .sapstack/sessions/ of the
 *    current working directory. The server does not touch anything outside.
 * 3. **Minimal dependencies.** Only @modelcontextprotocol/sdk, js-yaml, ajv.
 * 4. **Schema-enforced.** Every read/write validates against the YAML
 *    schemas in ../schemas/.
 * 5. **Append-only audit trail.** Tools never modify or delete past events.
 *
 * ## Status (v1.5.0)
 *
 * This file is **scaffolding** — it declares the shape of the server and
 * implements the read-only subset (listSessions, getSession, resolveSymptom,
 * checkTcode, resolveSapNote, listPlugins). Write tools (startSession,
 * addEvidence, nextTurn) throw NotImplementedError until v1.6.0.
 *
 * Why ship scaffolding now?
 * - MCP-aware clients (Claude Desktop, Cursor) can discover and introspect
 *   the server immediately via the manifest.
 * - The read-only tools are already useful (symptom matching, session
 *   browsing in VS Code via yamlValidation).
 * - Having the skeleton means v1.6.0 implementation is purely "fill in the
 *   todo()s" — no architectural decisions pending.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as yaml from "js-yaml";
import Ajv from "ajv";
import * as crypto from "node:crypto";

// ─────────────────────────────────────────────────────────────
// Paths & constants
// ─────────────────────────────────────────────────────────────

const WORKSPACE_ROOT = process.env.SAPSTACK_WORKSPACE || process.cwd();
const SAPSTACK_ROOT = process.env.SAPSTACK_ROOT || path.join(WORKSPACE_ROOT, "sapstack");
const SESSIONS_DIR = path.join(WORKSPACE_ROOT, ".sapstack", "sessions");
const DATA_DIR = path.join(SAPSTACK_ROOT, "data");
const SCHEMAS_DIR = path.join(SAPSTACK_ROOT, "schemas");
const PLUGINS_DIR = path.join(SAPSTACK_ROOT, "plugins");

// ─────────────────────────────────────────────────────────────
// Schema validation & utilities
// ─────────────────────────────────────────────────────────────

let ajv: Ajv | null = null;
const schemas: Record<string, unknown> = {};

async function initializeAjv() {
  if (ajv) return;
  ajv = new Ajv({ strict: true });

  // Load all schemas
  const schemaNames = ["evidence-bundle", "followup-request", "hypothesis", "verdict", "session-state"];
  for (const name of schemaNames) {
    try {
      const schemaPath = path.join(SCHEMAS_DIR, `${name}.schema.yaml`);
      const content = await readFileSafe(schemaPath);
      schemas[name] = yaml.load(content);
    } catch (err) {
      console.error(`[sapstack] Failed to load schema ${name}:`, err);
    }
  }
}

function generateId(prefix: string): string {
  const now = new Date();
  const dateStr = now.toISOString().substring(0, 10).replace(/-/g, "");
  const randomStr = crypto.randomBytes(4).toString("hex").substring(0, 6);
  return `${prefix}-${dateStr}-${randomStr}`;
}

function validateWithSchema(schema: string, data: unknown): { valid: boolean; errors?: string[] } {
  if (!ajv || !schemas[schema]) {
    return { valid: false, errors: [`Schema '${schema}' not loaded`] };
  }
  const validate = ajv.compile(schemas[schema]);
  const valid = validate(data) as boolean;
  if (!valid) {
    const errors = (validate.errors || []).map(e =>
      `${e.instancePath || "root"} ${e.keyword}: ${e.message}`
    );
    return { valid: false, errors };
  }
  return { valid: true };
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`sapstack MCP runtime: '${feature}' is not implemented in v1.5.0 scaffolding. Planned for v1.6.0.`);
    this.name = "NotImplementedError";
  }
}

async function readFileSafe(p: string): Promise<string> {
  try {
    return await fs.readFile(p, "utf-8");
  } catch (err) {
    throw new Error(`sapstack MCP: cannot read ${p} — ${(err as Error).message}`);
  }
}

async function loadYaml<T = unknown>(p: string): Promise<T> {
  const text = await readFileSafe(p);
  return yaml.load(text) as T;
}

async function listDir(p: string): Promise<string[]> {
  try {
    return await fs.readdir(p);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Symptom Index types (matches data/symptom-index.yaml)
// ─────────────────────────────────────────────────────────────

interface Symptom {
  id: string;
  symptom_ko?: string;
  symptom_ko_variants?: string[];  // Slice 8-c
  symptom_en?: string;
  symptom_de?: string;
  symptom_ja?: string;
  likely_modules?: string[];
  first_check_tcodes?: string[];
  typical_causes?: string[];
  localized_checks?: Record<string, string[]>;
  severity?: string;
  recurrence?: string;
}

// Slice 8-d — Synonym index
interface SynonymIndex {
  variantToCanonical: Map<string, string>;   // "코스트센터" → "cost_center"
  canonicalToAllForms: Map<string, string[]>; // "cost_center" → ["코스트 센터", "원가센터", ...]
}

interface QueryExpansion {
  original: string[];
  expanded: string[];
  hits: string[];
}

interface SymptomIndex {
  schema_version: string;
  symptoms: Symptom[];
  meta: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────
// Session types (matches schemas/session-state.schema.yaml)
// ─────────────────────────────────────────────────────────────

interface SessionState {
  session_id: string;
  schema_version: string;
  created_at: string;
  status: string;
  initial_symptom: {
    description: string;
    reporter_role: string;
    language: string;
    country_iso?: string;
  };
  sap_context?: Record<string, unknown>;
  turns?: unknown[];
  current_turn_number?: number;
  hypotheses?: unknown[];
  bundles?: unknown[];
  verdicts?: unknown[];
  audit_trail?: unknown[];
  last_updated_at?: string;
}

// ─────────────────────────────────────────────────────────────
// Read-only tool implementations (working in v1.5.0)
// ─────────────────────────────────────────────────────────────

async function listSessions(filter: { status?: string; country_iso?: string; limit?: number }) {
  const entries = await listDir(SESSIONS_DIR);
  const sessions: Array<{ session_id: string; status: string; country_iso?: string; last_updated_at?: string; description: string }> = [];

  for (const dirName of entries) {
    if (!dirName.startsWith("sess-")) continue;
    const statePath = path.join(SESSIONS_DIR, dirName, "state.yaml");
    try {
      const state = await loadYaml<SessionState>(statePath);
      if (filter.status && filter.status !== "any" && state.status !== filter.status) continue;
      if (filter.country_iso && state.initial_symptom?.country_iso !== filter.country_iso) continue;
      sessions.push({
        session_id: state.session_id,
        status: state.status,
        country_iso: state.initial_symptom?.country_iso,
        last_updated_at: state.last_updated_at,
        description: state.initial_symptom?.description?.slice(0, 120) || "",
      });
    } catch {
      // Skip malformed sessions
      continue;
    }
  }

  // Sort by last_updated_at desc
  sessions.sort((a, b) => (b.last_updated_at || "").localeCompare(a.last_updated_at || ""));
  return sessions.slice(0, filter.limit || 20);
}

async function getSession(sessionId: string): Promise<SessionState> {
  const statePath = path.join(SESSIONS_DIR, sessionId, "state.yaml");
  return loadYaml<SessionState>(statePath);
}

async function loadSymptomIndex(): Promise<SymptomIndex> {
  return loadYaml<SymptomIndex>(path.join(DATA_DIR, "symptom-index.yaml"));
}

// ─────────────────────────────────────────────────────────────
// Slice 8-d — synonyms.yaml loader + query expansion
// ─────────────────────────────────────────────────────────────

let cachedSynonyms: SynonymIndex | null = null;

async function loadSynonyms(): Promise<SynonymIndex | null> {
  if (cachedSynonyms) return cachedSynonyms;
  try {
    const raw = await loadYaml<any>(path.join(DATA_DIR, "synonyms.yaml"));
    const variantToCanonical = new Map<string, string>();
    const canonicalToAllForms = new Map<string, string[]>();

    const addForms = (canonical: string, forms: string[]) => {
      const filtered = forms.filter(Boolean).map(f => String(f).trim()).filter(f => f);
      canonicalToAllForms.set(canonical, filtered);
      for (const form of filtered) {
        const key = form.toLowerCase().replace(/\s+/g, "");
        if (!variantToCanonical.has(key)) {
          variantToCanonical.set(key, canonical);
        }
      }
    };

    // terms[] 처리
    for (const term of raw.terms || []) {
      if (!term.canonical) continue;
      const forms: string[] = [];
      if (term.en) forms.push(term.en);
      if (Array.isArray(term.field_forms)) forms.push(...term.field_forms);
      if (term.ko?.primary) forms.push(term.ko.primary);
      if (Array.isArray(term.ko?.variants)) forms.push(...term.ko.variants);
      if (term.de?.primary) forms.push(term.de.primary);
      if (Array.isArray(term.de?.variants)) forms.push(...term.de.variants);
      if (term.ja?.primary) forms.push(term.ja.primary);
      if (Array.isArray(term.ja?.variants)) forms.push(...term.ja.variants);
      addForms(term.canonical, forms);
    }

    // abbreviations[] 처리
    for (const ab of raw.abbreviations || []) {
      if (!ab.short) continue;
      const forms = [ab.short];
      if (ab.ko_pronunciation) forms.push(...String(ab.ko_pronunciation).split("/").map((s: string) => s.trim()));
      addForms(ab.short, forms);
    }

    // business_time_expressions[] 처리
    for (const bt of raw.business_time_expressions || []) {
      if (!bt.canonical) continue;
      const forms = [];
      if (bt.ko) forms.push(bt.ko);
      if (Array.isArray(bt.ko_variants)) forms.push(...bt.ko_variants);
      addForms(bt.canonical, forms);
    }

    cachedSynonyms = { variantToCanonical, canonicalToAllForms };
    return cachedSynonyms;
  } catch (err) {
    console.error("[sapstack MCP] synonyms.yaml load failed — matching will work without expansion", err);
    return null;
  }
}

function expandQueryTokens(tokens: string[], synonyms: SynonymIndex | null): QueryExpansion {
  if (!synonyms) return { original: tokens, expanded: [], hits: [] };
  const expanded = new Set<string>();
  const hitCanonicals = new Set<string>();

  for (const t of tokens) {
    const key = t.toLowerCase().replace(/\s+/g, "");
    if (synonyms.variantToCanonical.has(key)) {
      hitCanonicals.add(synonyms.variantToCanonical.get(key)!);
    }
  }

  // 2-3 그램 매칭
  for (let n = 2; n <= 3; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const ngram = tokens.slice(i, i + n).join("");
      if (synonyms.variantToCanonical.has(ngram)) {
        hitCanonicals.add(synonyms.variantToCanonical.get(ngram)!);
      }
    }
  }

  for (const c of hitCanonicals) {
    const forms = synonyms.canonicalToAllForms.get(c) || [];
    for (const f of forms) {
      expanded.add(f.toLowerCase());
    }
  }

  return { original: tokens, expanded: Array.from(expanded), hits: Array.from(hitCanonicals) };
}

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[.,!?'"()\[\]{}]/g, " ")
    .split(/\s+/)
    .filter(t => t.length >= 2);
}

function extractTcodes(text: string): string[] {
  const matches = text.toUpperCase().match(/\b[A-Z]{2}[0-9A-Z]{1,6}\b/g) || [];
  return Array.from(new Set(matches));
}

function scoreSymptom(sym: Symptom, queryTokens: string[], queryTcodes: string[], expansion: QueryExpansion, lang: string): number {
  let score = 0;
  const haystack: string[] = [];
  const primary = (sym as any)[`symptom_${lang}`] as string | undefined;
  if (primary) haystack.push(primary);
  if (sym.symptom_en) haystack.push(sym.symptom_en);

  // Slice 8-c: ko_variants + typical_causes
  if (lang === "ko" && Array.isArray(sym.symptom_ko_variants)) {
    sym.symptom_ko_variants.forEach(v => haystack.push(v));
  }
  if (Array.isArray(sym.typical_causes)) {
    sym.typical_causes.forEach(c => haystack.push(c));
  }

  haystack.push(sym.id);
  (sym.likely_modules || []).forEach(m => haystack.push(m));
  (sym.first_check_tcodes || []).forEach(t => haystack.push(t));

  const hay = haystack.join(" ").toLowerCase();
  const hayTokens = tokenize(hay);

  for (const qt of queryTokens) {
    if (hayTokens.some(ht => ht.includes(qt) || qt.includes(ht))) score += 2;
    if (hay.includes(qt)) score += 1;
  }

  // Slice 8-d: synonym 확장 가중
  for (const et of expansion.expanded) {
    if (hay.includes(et)) score += 3;
  }
  if (expansion.hits.length > 0) {
    score += Math.min(expansion.hits.length * 1.5, 6);
  }

  for (const qtc of queryTcodes) {
    if ((sym.first_check_tcodes || []).map(t => t.toUpperCase()).includes(qtc)) score += 5;
    if (hay.toUpperCase().includes(qtc)) score += 3;
  }
  if (sym.severity === "critical") score += 0.5;
  if (sym.recurrence === "frequent") score += 0.3;
  return score;
}

async function resolveSymptom(args: { query: string; language?: string; country?: string; top_n?: number }) {
  const index = await loadSymptomIndex();
  const synonyms = await loadSynonyms();
  const queryTokens = tokenize(args.query);
  const queryTcodes = extractTcodes(args.query);
  const expansion = expandQueryTokens(queryTokens, synonyms);
  const lang = args.language || "ko";
  const topN = args.top_n || 5;

  const scored = index.symptoms
    .map(sym => ({ sym, score: scoreSymptom(sym, queryTokens, queryTcodes, expansion, lang) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  const maxScore = scored[0]?.score || 1;
  return scored.map(({ sym, score }) => ({
    id: sym.id,
    symptom: (sym as any)[`symptom_${lang}`] || sym.symptom_en,
    confidence: Math.min(score / maxScore, 1),
    likely_modules: sym.likely_modules || [],
    first_check_tcodes: sym.first_check_tcodes || [],
    typical_causes: sym.typical_causes || [],
    localized_checks: (args.country && sym.localized_checks?.[args.country]) || [],
  }));
}

async function resolveSapNote(args: { keyword: string }) {
  const notes = await loadYaml<{ notes: unknown[] }>(path.join(DATA_DIR, "sap-notes.yaml"));
  const keyword = args.keyword.toLowerCase();
  const matched = (notes.notes || []).filter((n: any) => {
    const text = JSON.stringify(n).toLowerCase();
    return text.includes(keyword);
  });
  return matched.slice(0, 10);
}

async function checkTcode(args: { tcode: string }) {
  const tcodes = await loadYaml<{ tcodes: unknown[] }>(path.join(DATA_DIR, "tcodes.yaml"));
  const target = args.tcode.toUpperCase();
  const found = (tcodes.tcodes || []).find((t: any) => (t.code || t.tcode || "").toUpperCase() === target);
  return {
    tcode: args.tcode,
    verified: !!found,
    details: found || null,
  };
}

async function listPlugins() {
  const entries = await listDir(PLUGINS_DIR);
  const plugins = [];
  for (const name of entries) {
    if (!name.startsWith("sap-")) continue;
    const pluginJsonPath = path.join(PLUGINS_DIR, name, ".claude-plugin", "plugin.json");
    try {
      const text = await readFileSafe(pluginJsonPath);
      const meta = JSON.parse(text);
      plugins.push({ id: meta.id || name, name: meta.name, version: meta.version, description: meta.description });
    } catch {
      plugins.push({ id: name, name, version: "unknown", description: "no plugin.json" });
    }
  }
  return plugins;
}

// ─────────────────────────────────────────────────────────────
// Write-path tool implementations (v1.6.0)
// ─────────────────────────────────────────────────────────────

interface StartSessionArgs {
  symptom: string;
  reporter_role?: string;
  country_iso?: string;
  release?: string;
  deployment?: string;
  client?: string;
  language?: string;
}

async function startSession(args: StartSessionArgs) {
  const {
    symptom,
    reporter_role = "operator",
    country_iso = "kr",
    language = "ko",
  } = args;

  if (!symptom || symptom.trim().length === 0) {
    throw new Error("symptom is required and cannot be empty");
  }

  const sessionId = generateId("sess");
  const sessionDir = path.join(SESSIONS_DIR, sessionId);
  const filesDir = path.join(sessionDir, "files");

  // Create directories
  await fs.mkdir(filesDir, { recursive: true });

  // Create initial state.yaml
  const now = new Date().toISOString();
  const initialState: any = {
    session_id: sessionId,
    schema_version: "1.0.0",
    created_at: now,
    last_updated_at: now,
    created_by: {
      role: reporter_role,
    },
    originating_surface: "mcp_client",
    status: "intake",
    initial_symptom: {
      description: symptom,
      reporter_role,
      language,
      country_iso,
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
        actor: {
          role: reporter_role,
          surface: "mcp_client",
        },
        note: `Session started for symptom: ${symptom.substring(0, 100)}`,
      },
    ],
    tags: [],
  };

  const stateYaml = yaml.dump(initialState, { lineWidth: -1 });
  const statePath = path.join(sessionDir, "state.yaml");

  // Atomic write: write to temp, then rename
  const tmpPath = `${statePath}.tmp`;
  await fs.writeFile(tmpPath, stateYaml, "utf-8");
  await fs.rename(tmpPath, statePath);

  return {
    session_id: sessionId,
    state_path: statePath,
    status: "intake",
    message: `Session ${sessionId} created. Ready for evidence bundle.`,
  };
}

interface AddEvidenceArgs {
  session_id: string;
  bundle_yaml: string;
}

async function addEvidence(args: AddEvidenceArgs) {
  const { session_id, bundle_yaml } = args;

  if (!session_id || !/^sess-[0-9]{8}-[a-z0-9]{6}$/.test(session_id)) {
    throw new Error("Invalid session_id format");
  }

  if (!bundle_yaml || bundle_yaml.trim().length === 0) {
    throw new Error("bundle_yaml cannot be empty");
  }

  // Parse and validate bundle
  let bundleData: any;
  try {
    bundleData = yaml.load(bundle_yaml);
  } catch (err) {
    throw new Error(`Invalid YAML in bundle_yaml: ${(err as Error).message}`);
  }

  const validation = validateWithSchema("evidence-bundle", bundleData);
  if (!validation.valid) {
    throw new Error(`Bundle validation failed: ${validation.errors?.join(", ")}`);
  }

  // Load session state
  const sessionDir = path.join(SESSIONS_DIR, session_id);
  const statePath = path.join(sessionDir, "state.yaml");
  let state: any;
  try {
    state = await loadYaml<any>(statePath);
  } catch (err) {
    throw new Error(`Cannot load session ${session_id}: ${(err as Error).message}`);
  }

  // Ensure bundle has required fields
  if (!bundleData.bundle_id) {
    bundleData.bundle_id = generateId("evb");
  }
  if (!bundleData.session_id) {
    bundleData.session_id = session_id;
  }
  if (!bundleData.collected_at) {
    bundleData.collected_at = new Date().toISOString();
  }

  // Write bundle file
  const bundleFilename = `evidence-${state.bundles?.length || 0}.yaml`;
  const bundlePath = path.join(sessionDir, bundleFilename);
  const bundleYaml = yaml.dump(bundleData, { lineWidth: -1 });

  const tmpPath = `${bundlePath}.tmp`;
  await fs.writeFile(tmpPath, bundleYaml, "utf-8");
  await fs.rename(tmpPath, bundlePath);

  // Update session state
  const now = new Date().toISOString();
  if (!state.bundles) state.bundles = [];
  state.bundles.push(bundleData);
  state.last_updated_at = now;

  if (!state.audit_trail) state.audit_trail = [];
  state.audit_trail.push({
    at: now,
    action: "bundle_added",
    actor: {
      role: bundleData.collected_by?.role || "operator",
      handle: bundleData.collected_by?.handle,
      surface: "mcp_client",
    },
    ref_id: bundleData.bundle_id,
    note: `Evidence bundle added with ${bundleData.items?.length || 0} items`,
  });

  // State transition: if intake, move to awaiting_hypothesis (which AI will process)
  if (state.status === "intake") {
    state.status = "hypothesizing";
  }

  const stateYaml = yaml.dump(state, { lineWidth: -1 });
  const tmpStatePath = `${statePath}.tmp`;
  await fs.writeFile(tmpStatePath, stateYaml, "utf-8");
  await fs.rename(tmpStatePath, statePath);

  return {
    session_id,
    bundle_id: bundleData.bundle_id,
    bundle_path: bundlePath,
    message: `Evidence bundle ${bundleData.bundle_id} added to session`,
    session_status: state.status,
  };
}

interface NextTurnArgs {
  session_id: string;
  force_hypothesize?: boolean;
}

async function nextTurn(args: NextTurnArgs) {
  const { session_id, force_hypothesize = false } = args;

  if (!session_id || !/^sess-[0-9]{8}-[a-z0-9]{6}$/.test(session_id)) {
    throw new Error("Invalid session_id format");
  }

  // Load session state
  const sessionDir = path.join(SESSIONS_DIR, session_id);
  const statePath = path.join(sessionDir, "state.yaml");
  let state: any;
  try {
    state = await loadYaml<any>(statePath);
  } catch (err) {
    throw new Error(`Cannot load session ${session_id}: ${(err as Error).message}`);
  }

  const now = new Date().toISOString();
  const currentStatus = state.status;
  const currentTurn = state.current_turn_number || 1;
  let nextStatus = currentStatus;
  let signal = "";

  // State machine transitions
  if (currentStatus === "intake" && (state.bundles?.length || 0) > 0) {
    // Intake with evidence → Hypothesis turn needed
    nextStatus = "hypothesizing";
    signal = "generate_hypotheses";

    // Create turn 2 (Hypothesis)
    if (!state.turns) state.turns = [];
    const nextTurnNum = currentTurn + 1;
    state.turns.push({
      turn_number: nextTurnNum,
      turn_type: "hypothesis",
      started_at: now,
      status: "active",
      surface: "mcp_client",
    });
    state.current_turn_number = nextTurnNum;
  } else if (currentStatus === "hypothesizing" && force_hypothesize) {
    // Already hypothesizing — transition to awaiting_evidence
    nextStatus = "awaiting_evidence";
    signal = "waiting_for_evidence";

    // Mark Hypothesis turn complete, create Collect turn
    if (state.turns && state.turns.length > 0) {
      const lastTurn = state.turns[state.turns.length - 1];
      if (lastTurn.turn_type === "hypothesis" && lastTurn.status === "active") {
        lastTurn.status = "complete";
        lastTurn.completed_at = now;
      }
    }

    const nextTurnNum = currentTurn + 1;
    state.turns.push({
      turn_number: nextTurnNum,
      turn_type: "collect",
      started_at: now,
      status: "active",
      surface: "mcp_client",
    });
    state.current_turn_number = nextTurnNum;
  } else if (currentStatus === "awaiting_evidence" && (state.bundles?.length || 0) > 1) {
    // More evidence arrived → Verify turn
    nextStatus = "verifying";
    signal = "verify_hypotheses";

    if (state.turns && state.turns.length > 0) {
      const lastTurn = state.turns[state.turns.length - 1];
      if (lastTurn.turn_type === "collect" && lastTurn.status === "active") {
        lastTurn.status = "complete";
        lastTurn.completed_at = now;
      }
    }

    const nextTurnNum = currentTurn + 1;
    state.turns.push({
      turn_number: nextTurnNum,
      turn_type: "verify",
      started_at: now,
      status: "active",
      surface: "mcp_client",
    });
    state.current_turn_number = nextTurnNum;
  } else if (currentStatus === "verifying" && (state.verdicts?.length || 0) > 0) {
    // Verdict issued → resolved or needs next loop
    const latestVerdict = state.verdicts[state.verdicts.length - 1];
    if (latestVerdict?.overall_state === "resolved") {
      nextStatus = "resolved";
      signal = "session_complete";
    } else if (latestVerdict?.overall_state === "needs_next_loop") {
      nextStatus = "hypothesizing";
      signal = "generate_hypotheses";
      const nextTurnNum = currentTurn + 1;
      state.turns.push({
        turn_number: nextTurnNum,
        turn_type: "hypothesis",
        started_at: now,
        status: "active",
        surface: "mcp_client",
      });
      state.current_turn_number = nextTurnNum;
    } else {
      nextStatus = latestVerdict?.overall_state || currentStatus;
      signal = "waiting_for_input";
    }
  } else {
    signal = "no_transition";
  }

  state.status = nextStatus;
  state.last_updated_at = now;

  if (!state.audit_trail) state.audit_trail = [];
  state.audit_trail.push({
    at: now,
    action: "session_updated",
    actor: { surface: "mcp_client" },
    note: `Status transitioned from ${currentStatus} to ${nextStatus}. Signal: ${signal}`,
  });

  const stateYaml = yaml.dump(state, { lineWidth: -1 });
  const tmpStatePath = `${statePath}.tmp`;
  await fs.writeFile(tmpStatePath, stateYaml, "utf-8");
  await fs.rename(tmpStatePath, statePath);

  return {
    session_id,
    status: nextStatus,
    current_turn: state.current_turn_number,
    signal,
    message: `Session advanced. Signal: ${signal}`,
  };
}

interface ValidateSessionFileArgs {
  path: string;
  schema: string;
}

async function validateSessionFile(args: ValidateSessionFileArgs) {
  const { path: filePath, schema } = args;

  if (!schema || !["session-state", "evidence-bundle", "hypothesis", "followup-request", "verdict"].includes(schema)) {
    throw new Error(`Invalid schema name: ${schema}`);
  }

  // Resolve path safely — must be under .sapstack/sessions/
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(SESSIONS_DIR, filePath);

  if (!resolvedPath.startsWith(SESSIONS_DIR)) {
    throw new Error("Path traversal not allowed — must be under .sapstack/sessions/");
  }

  try {
    const content = await readFileSafe(resolvedPath);
    const data = yaml.load(content);
    const validation = validateWithSchema(schema, data);

    if (!validation.valid) {
      return {
        valid: false,
        path: filePath,
        schema,
        errors: validation.errors,
      };
    }

    return {
      valid: true,
      path: filePath,
      schema,
      message: "Validation passed",
    };
  } catch (err) {
    throw new Error(`Cannot read or parse file ${filePath}: ${(err as Error).message}`);
  }
}

// ─────────────────────────────────────────────────────────────
// MCP Server setup
// ─────────────────────────────────────────────────────────────

const server = new Server(
  {
    name: "sapstack",
    version: "1.6.0",
  },
  {
    capabilities: {
      resources: { subscribe: true, listChanged: true },
      prompts: { listChanged: false },
      tools: { listChanged: false },
    },
  }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      { name: "resolve_sap_note", description: "Search verified SAP Notes by keyword", inputSchema: { type: "object", properties: { keyword: { type: "string" } }, required: ["keyword"] } },
      { name: "check_tcode", description: "Verify T-code existence in verified registry", inputSchema: { type: "object", properties: { tcode: { type: "string" } }, required: ["tcode"] } },
      { name: "list_plugins", description: "List all sapstack plugins", inputSchema: { type: "object", properties: {} } },
      { name: "resolve_symptom", description: "Fuzzy-match symptom against symptom-index.yaml", inputSchema: { type: "object", properties: { query: { type: "string" }, language: { type: "string" }, country: { type: "string" }, top_n: { type: "integer" } }, required: ["query"] } },
      { name: "start_session", description: "[v1.6.0] Start a new Evidence Loop session", inputSchema: { type: "object", properties: { symptom: { type: "string" } }, required: ["symptom"] } },
      { name: "add_evidence", description: "[v1.6.0] Add evidence bundle to session", inputSchema: { type: "object", properties: { session_id: { type: "string" }, bundle_yaml: { type: "string" } }, required: ["session_id", "bundle_yaml"] } },
      { name: "next_turn", description: "[v1.6.0] Run next turn of Evidence Loop", inputSchema: { type: "object", properties: { session_id: { type: "string" } }, required: ["session_id"] } },
      { name: "list_sessions", description: "List Evidence Loop sessions", inputSchema: { type: "object", properties: { status: { type: "string" }, country_iso: { type: "string" }, limit: { type: "integer" } } } },
      { name: "validate_session_file", description: "[v1.6.0] Validate session YAML against schema", inputSchema: { type: "object", properties: { path: { type: "string" }, schema: { type: "string" } }, required: ["path", "schema"] } },
    ],
  };
});

// Call tool
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    let result: unknown;
    switch (name) {
      case "resolve_sap_note":    result = await resolveSapNote(args as any); break;
      case "check_tcode":         result = await checkTcode(args as any); break;
      case "list_plugins":        result = await listPlugins(); break;
      case "resolve_symptom":     result = await resolveSymptom(args as any); break;
      case "list_sessions":       result = await listSessions(args as any); break;
      case "start_session":       result = await startSession(args); break;
      case "add_evidence":        result = await addEvidence(args); break;
      case "next_turn":           result = await nextTurn(args); break;
      case "validate_session_file": result = await validateSessionFile(args); break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
      isError: true,
    };
  }
});

// List resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const sessions = await listSessions({ limit: 50 });
  return {
    resources: [
      { uri: "sapstack://rules/universal", name: "sapstack Universal Rules", mimeType: "text/markdown" },
      { uri: "sapstack://data/tcodes", name: "T-code Registry", mimeType: "application/yaml" },
      { uri: "sapstack://data/sap-notes", name: "SAP Notes Catalog", mimeType: "application/yaml" },
      { uri: "sapstack://data/symptom-index", name: "Symptom Index", mimeType: "application/yaml" },
      ...sessions.map(s => ({
        uri: `sapstack://session/${s.session_id}`,
        name: `Session ${s.session_id} (${s.status})`,
        description: s.description,
        mimeType: "application/yaml",
      })),
    ],
  };
});

// Read resource
server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  const uri = req.params.uri;

  if (uri === "sapstack://rules/universal") {
    const text = await readFileSafe(path.join(SAPSTACK_ROOT, "CLAUDE.md"));
    return { contents: [{ uri, mimeType: "text/markdown", text }] };
  }
  if (uri === "sapstack://data/tcodes") {
    const text = await readFileSafe(path.join(DATA_DIR, "tcodes.yaml"));
    return { contents: [{ uri, mimeType: "application/yaml", text }] };
  }
  if (uri === "sapstack://data/sap-notes") {
    const text = await readFileSafe(path.join(DATA_DIR, "sap-notes.yaml"));
    return { contents: [{ uri, mimeType: "application/yaml", text }] };
  }
  if (uri === "sapstack://data/symptom-index") {
    const text = await readFileSafe(path.join(DATA_DIR, "symptom-index.yaml"));
    return { contents: [{ uri, mimeType: "application/yaml", text }] };
  }

  // Session pattern: sapstack://session/{id}
  const sessionMatch = uri.match(/^sapstack:\/\/session\/(sess-[0-9]{8}-[a-z0-9]{6})$/);
  if (sessionMatch) {
    const sessionId = sessionMatch[1];
    const text = await readFileSafe(path.join(SESSIONS_DIR, sessionId, "state.yaml"));
    return { contents: [{ uri, mimeType: "application/yaml", text }] };
  }

  // Schema pattern: sapstack://schema/{name}
  const schemaMatch = uri.match(/^sapstack:\/\/schema\/([\w-]+)$/);
  if (schemaMatch) {
    const schemaName = schemaMatch[1];
    const text = await readFileSafe(path.join(SCHEMAS_DIR, `${schemaName}.schema.yaml`));
    return { contents: [{ uri, mimeType: "application/yaml", text }] };
  }

  throw new Error(`Unknown resource URI: ${uri}`);
});

// List prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      { name: "sap-fi-consultant", description: "FI consultant systematic diagnosis" },
      { name: "sap-abap-developer", description: "ABAP code review (Clean Core, HANA)" },
      { name: "sap-s4-migration-advisor", description: "S/4HANA migration advisory" },
      { name: "sap-basis-consultant", description: "Basis issue routing" },
      { name: "sap-mm-consultant", description: "MM procurement/inventory" },
      { name: "sap-session-turn2-hypothesis", description: "Evidence Loop Turn 2 (v1.5.0)" },
      { name: "sap-session-turn4-verify", description: "Evidence Loop Turn 4 (v1.5.0)" },
    ],
  };
});

// Get prompt
server.setRequestHandler(GetPromptRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  if (name.startsWith("sap-") && !name.startsWith("sap-session-")) {
    // Legacy agent prompts — load from agents/
    const text = await readFileSafe(path.join(SAPSTACK_ROOT, "agents", `${name}.md`));
    return {
      messages: [
        { role: "user", content: { type: "text", text: `${text}\n\nIssue: ${(args as any)?.issue || (args as any)?.code || (args as any)?.scenario || (args as any)?.symptom || ""}` } },
      ],
    };
  }

  if (name === "sap-session-turn2-hypothesis" || name === "sap-session-turn4-verify") {
    throw new NotImplementedError(`prompt:${name}`);
  }

  throw new Error(`Unknown prompt: ${name}`);
});

// ─────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────

async function main() {
  // Initialize Ajv and load schemas
  await initializeAjv();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`sapstack MCP server v1.6.0 (write-path enabled) started. Workspace: ${WORKSPACE_ROOT}`);
}

main().catch((err) => {
  console.error("sapstack MCP server failed:", err);
  process.exit(1);
});
