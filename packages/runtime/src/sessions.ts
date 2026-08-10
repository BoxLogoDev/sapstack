import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import * as yaml from "js-yaml";
import type { AssetProvider } from "./assets.js";
import type { SecurityService } from "./security.js";

const SESSION_ID = /^sess-[0-9]{8}-[a-z0-9]{6}$/;
const SCHEMA_NAMES = ["evidence-bundle", "followup-request", "hypothesis", "verdict", "session-state"] as const;
type SchemaName = typeof SCHEMA_NAMES[number];

const SIMULATION_REQUIRED = new Set(["AFAB", "F.13", "FAGL_FC_VAL", "KSU5", "MR11", "F110"]);
const Ajv2020Constructor = Ajv2020 as unknown as new (options: Record<string, unknown>) => {
  addSchema(schema: unknown): void;
  getSchema(id: string): ValidateFunction | undefined;
  compile(schema: unknown): ValidateFunction;
};

function generateId(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${date}-${crypto.randomBytes(3).toString("hex")}`;
}

function validationMessage(errors: ErrorObject[] | null | undefined): string {
  return (errors || []).map(error => `${error.instancePath || "root"} ${error.message}`).join(", ");
}

export interface SessionStore {
  readonly root: string;
  list(): Promise<string[]>;
  read(sessionId: string): Promise<any>;
  write(sessionId: string, state: any): Promise<void>;
  writeArtifact(sessionId: string, filename: string, value: unknown): Promise<string>;
  readArtifact(relativePath: string): Promise<unknown>;
}

export class FileSessionStore implements SessionStore {
  readonly root: string;

  constructor(root: string, private readonly security: SecurityService) {
    this.root = path.resolve(root);
  }

  private sessionDir(sessionId: string): string {
    if (!SESSION_ID.test(sessionId)) throw new Error("Invalid session_id format");
    return this.security.resolveInside(this.root, sessionId);
  }

  async list(): Promise<string[]> {
    try {
      return (await fs.readdir(this.root)).filter(entry => SESSION_ID.test(entry));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  async read(sessionId: string): Promise<any> {
    const text = await fs.readFile(path.join(this.sessionDir(sessionId), "state.yaml"), "utf8");
    return yaml.load(text);
  }

  async write(sessionId: string, state: any): Promise<void> {
    const dir = this.sessionDir(sessionId);
    await fs.mkdir(path.join(dir, "files"), { recursive: true });
    await this.atomicWrite(path.join(dir, "state.yaml"), yaml.dump(state, { lineWidth: -1, noRefs: true }));
  }

  async writeArtifact(sessionId: string, filename: string, value: unknown): Promise<string> {
    const dir = this.sessionDir(sessionId);
    await fs.mkdir(dir, { recursive: true });
    const target = this.security.resolveInside(dir, filename);
    await this.atomicWrite(target, yaml.dump(value, { lineWidth: -1, noRefs: true }));
    return target;
  }

  async readArtifact(relativePath: string): Promise<unknown> {
    const target = this.security.resolveInside(this.root, relativePath);
    return yaml.load(await fs.readFile(target, "utf8"));
  }

  private async atomicWrite(target: string, content: string): Promise<void> {
    const temporary = `${target}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
    try {
      await fs.writeFile(temporary, content, { encoding: "utf8", flag: "wx" });
      await fs.rename(temporary, target);
    } catch (error) {
      await fs.rm(temporary, { force: true }).catch(() => undefined);
      throw error;
    }
  }
}

class SessionMutationQueue {
  private readonly tails = new Map<string, Promise<void>>();

  async run<T>(sessionId: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.tails.get(sessionId) || Promise.resolve();
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    const tail = previous.catch(() => undefined).then(() => gate);
    this.tails.set(sessionId, tail);
    await previous.catch(() => undefined);
    try {
      return await operation();
    } finally {
      release();
      if (this.tails.get(sessionId) === tail) this.tails.delete(sessionId);
    }
  }
}

export interface StartSessionInput {
  symptom: string;
  reporter_role?: "end_user" | "operator" | "consultant" | "basis";
  country_iso?: string;
  release?: string;
  deployment?: string;
  industry?: string;
  client?: string;
  language?: string;
  surface?: SessionSurface;
}

export type SessionSurface = "cli" | "vscode_extension" | "web_triage" | "mcp_client" | "desktop" | "email";

export class SessionService {
  private readonly queue = new SessionMutationQueue();
  private validators?: Promise<Map<SchemaName, ValidateFunction>>;

  constructor(
    private readonly assets: AssetProvider,
    private readonly store: SessionStore,
    private readonly security: SecurityService,
  ) {}

  private async getValidators(): Promise<Map<SchemaName, ValidateFunction>> {
    if (!this.validators) {
      this.validators = (async () => {
        const ajv = new Ajv2020Constructor({ strict: false, allErrors: true, validateFormats: false });
        const documents = await Promise.all(SCHEMA_NAMES.map(name => this.assets.readYaml<any>(`schemas/${name}.schema.yaml`)));
        for (const document of documents) ajv.addSchema(document);
        return new Map(SCHEMA_NAMES.map((name, index) => [name, ajv.getSchema(documents[index].$id) || ajv.compile(documents[index])]));
      })();
    }
    return this.validators;
  }

  async validate(schema: SchemaName, value: unknown): Promise<{ valid: boolean; errors: string[] }> {
    const validate = (await this.getValidators()).get(schema)!;
    const valid = Boolean(validate(value));
    return { valid, errors: valid ? [] : validationMessage(validate.errors).split(", ").filter(Boolean) };
  }

  private async assertValid(schema: SchemaName, value: unknown): Promise<void> {
    const result = await this.validate(schema, value);
    if (!result.valid) throw new Error(`${schema} validation failed: ${result.errors.join(", ")}`);
  }

  async start(input: StartSessionInput) {
    if (!input.symptom?.trim()) throw new Error("symptom is required and cannot be empty");
    const sessionId = generateId("sess");
    const now = new Date().toISOString();
    const role = input.reporter_role || "operator";
    const surface = input.surface || "mcp_client";
    const state: any = {
      session_id: sessionId,
      schema_version: "1.0.0",
      created_at: now,
      last_updated_at: now,
      created_by: { role },
      originating_surface: surface,
      status: "intake",
      initial_symptom: {
        description: input.symptom.trim(),
        reporter_role: role,
        language: input.language || "ko",
        ...(input.country_iso ? { country_iso: input.country_iso.toLowerCase() } : {}),
      },
      sap_context: {
        ...(input.release ? { release: input.release } : {}),
        ...(input.deployment ? { deployment: input.deployment } : {}),
        ...(input.industry ? { industry: input.industry } : {}),
        ...(input.client ? { client: input.client } : {}),
        ...(input.country_iso ? { country_iso: input.country_iso.toLowerCase() } : {}),
        language: input.language || "ko",
      },
      turns: [{ turn_number: 1, turn_type: "intake", started_at: now, status: "active", surface }],
      current_turn_number: 1,
      hypotheses: [],
      bundles: [],
      followup_requests: [],
      verdicts: [],
      audit_trail: [{ at: now, action: "session_created", actor: { role, surface } }],
      tags: [],
    };
    await this.assertValid("session-state", state);
    await this.store.write(sessionId, state);
    return { session_id: sessionId, state_path: path.join(this.store.root, sessionId, "state.yaml"), status: state.status };
  }

  async get(sessionId: string) {
    return this.store.read(sessionId);
  }

  async list(filter: { status?: string; country_iso?: string; limit?: number } = {}) {
    const states = await Promise.all((await this.store.list()).map(async sessionId => {
      try { return await this.store.read(sessionId); } catch { return undefined; }
    }));
    return states.filter(Boolean).filter(state => !filter.status || filter.status === "any" || state.status === filter.status)
      .filter(state => !filter.country_iso || state.initial_symptom?.country_iso === filter.country_iso)
      .sort((a, b) => String(b.last_updated_at || b.created_at).localeCompare(String(a.last_updated_at || a.created_at)))
      .slice(0, filter.limit || 20)
      .map(state => ({ session_id: state.session_id, status: state.status, country_iso: state.initial_symptom?.country_iso, last_updated_at: state.last_updated_at, description: state.initial_symptom?.description?.slice(0, 120) || "" }));
  }

  async addEvidence(args: { session_id: string; bundle_yaml?: string; bundle?: any; surface?: SessionSurface }) {
    return this.queue.run(args.session_id, async () => {
      const state = await this.store.read(args.session_id);
      let bundle: any;
      if (args.bundle) bundle = structuredClone(args.bundle);
      else {
        try { bundle = yaml.load(args.bundle_yaml || ""); }
        catch (error) { throw new Error(`Invalid YAML in bundle_yaml: ${(error as Error).message}`); }
      }
      if (!bundle || typeof bundle !== "object") throw new Error("Evidence bundle must be an object");
      bundle.bundle_id ||= generateId("evb");
      bundle.session_id ||= args.session_id;
      bundle.turn_number ||= state.current_turn_number || 1;
      bundle.collected_at ||= new Date().toISOString();
      if (bundle.session_id !== args.session_id) throw new Error("Evidence bundle session_id does not match target session");
      for (const item of bundle.items || []) {
        if (item.path) this.security.resolveInside(path.join(this.store.root, args.session_id), item.path);
      }
      await this.assertValid("evidence-bundle", bundle);
      const index = state.bundles?.length || 0;
      const artifactPath = await this.store.writeArtifact(args.session_id, `evidence-${index}.yaml`, bundle);
      state.bundles ||= [];
      state.bundles.push(bundle);
      state.last_updated_at = new Date().toISOString();
      state.audit_trail ||= [];
      state.audit_trail.push({ at: state.last_updated_at, action: "bundle_added", actor: { role: bundle.collected_by.role, surface: args.surface || "mcp_client" }, ref_id: bundle.bundle_id });
      if (state.status === "intake") state.status = "hypothesizing";
      await this.assertValid("session-state", state);
      await this.store.write(args.session_id, state);
      return { session_id: args.session_id, bundle_id: bundle.bundle_id, bundle_path: artifactPath, session_status: state.status };
    });
  }

  async submitHypotheses(args: { session_id: string; turn_number?: number; hypotheses: any[]; surface?: SessionSurface }) {
    if (!Array.isArray(args.hypotheses) || args.hypotheses.length < 2 || args.hypotheses.length > 4) {
      throw new Error("Evidence Loop requires 2-4 hypotheses");
    }
    return this.queue.run(args.session_id, async () => {
      const state = await this.store.read(args.session_id);
      const now = new Date().toISOString();
      if ((state.current_turn_number || 1) < 2) this.openTurn(state, 2, "hypothesis", now, args.surface);
      const turnNumber = args.turn_number || state.current_turn_number || 2;
      const offset = state.hypotheses?.length || 0;
      const confidence: Record<string, number> = { high: 0.8, medium: 0.5, low: 0.2 };
      const created = args.hypotheses.map((input, index) => ({
        hypothesis_id: `h-${String(offset + index + 1).padStart(3, "0")}`,
        session_id: args.session_id,
        turn_number: turnNumber,
        statement: input.statement,
        technical_chain: input.technical_chain,
        confidence: input.confidence ?? confidence[input.confidence_tier] ?? 0.5,
        confidence_tier: input.confidence_tier || "medium",
        impacted_modules: input.impacted_modules || [],
        impacted_areas: input.impacted_areas || [],
        evidence_refs: input.evidence_refs || [],
        falsification_evidence: input.falsification_evidence || [],
        related_sap_notes: input.related_sap_notes || [],
        related_tcodes: input.related_tcodes || [],
        consultant_agents_to_involve: input.consultant_agents_to_involve || [],
        status: "proposed",
      }));
      for (const hypothesis of created) {
        if (hypothesis.falsification_evidence.length < 2) throw new Error("Each hypothesis requires at least two falsification_evidence entries");
        await this.assertValid("hypothesis", hypothesis);
      }
      state.hypotheses ||= [];
      state.hypotheses.push(...created);
      state.status = "hypothesizing";
      state.last_updated_at = now;
      state.audit_trail ||= [];
      for (const hypothesis of created) state.audit_trail.push({ at: now, action: "hypothesis_proposed", actor: { surface: args.surface || "mcp_client" }, ref_id: hypothesis.hypothesis_id });
      await this.assertValid("session-state", state);
      await this.store.write(args.session_id, state);
      return { session_id: args.session_id, turn_number: turnNumber, hypotheses_created: created.length, hypothesis_ids: created.map(item => item.hypothesis_id) };
    });
  }

  async addFollowup(args: { session_id: string; turn_number?: number; items: any[]; summary?: string; surface?: SessionSurface }) {
    if (!Array.isArray(args.items) || !args.items.length) throw new Error("items must be a non-empty array");
    return this.queue.run(args.session_id, async () => {
      const state = await this.store.read(args.session_id);
      const now = new Date().toISOString();
      const turnNumber = args.turn_number || state.current_turn_number || 2;
      const checks = args.items.map((item, index) => {
        if (item.confirm_destructive === true) throw new Error("Follow-up requests must remain read-only");
        const action = item.action || { type: item.action_type, ...(item.tcode ? { tcode: item.tcode } : {}), ...(item.table ? { table: item.table } : {}) };
        return {
          check_id: item.check_id || `chk-${String(index + 1).padStart(3, "0")}`,
          purpose: item.purpose,
          hypothesis_ids: item.hypothesis_ids,
          action,
          expected_outcome: item.expected_outcome,
          priority: item.priority,
          estimated_minutes: item.estimated_minutes,
          confirm_destructive: false,
          ...(item.safe_to_skip === undefined ? {} : { safe_to_skip: item.safe_to_skip }),
          ...(item.output_format ? { output_format: item.output_format } : {}),
        };
      });
      const request = {
        request_id: generateId("flr"),
        session_id: args.session_id,
        turn_number: Math.max(2, turnNumber),
        created_at: now,
        summary: args.summary || `Turn ${turnNumber} follow-up checklist`,
        estimated_total_minutes: checks.reduce((sum, item) => sum + item.estimated_minutes, 0),
        checks,
      };
      await this.assertValid("followup-request", request);
      state.followup_requests ||= [];
      state.followup_requests.push(request);
      state.pending_followup_request_id = request.request_id;
      state.status = "awaiting_evidence";
      state.last_updated_at = now;
      state.audit_trail ||= [];
      state.audit_trail.push({ at: now, action: "followup_requested", actor: { surface: args.surface || "mcp_client" }, ref_id: request.request_id });
      await this.assertValid("session-state", state);
      await this.store.writeArtifact(args.session_id, `${request.request_id}.yaml`, request);
      await this.store.write(args.session_id, state);
      return { request_id: request.request_id, session_id: args.session_id, turn_number: request.turn_number, checks_count: checks.length, estimated_total_minutes: request.estimated_total_minutes };
    });
  }

  async submitVerdict(args: { session_id: string; turn_number?: number; overall_state: string; summary: string; resolutions: any[]; surface?: SessionSurface }) {
    if (!args.summary?.trim()) throw new Error("summary is required");
    if (!Array.isArray(args.resolutions) || !args.resolutions.length) throw new Error("resolutions must be a non-empty array");
    return this.queue.run(args.session_id, async () => {
      const state = await this.store.read(args.session_id);
      if (args.overall_state === "resolved") {
        const context = state.sap_context || {};
        const missing = ["release", "deployment", "industry"].filter(field => !context[field]);
        if (missing.length) throw new Error(`Cannot resolve without environment intake: ${missing.join(", ")}`);
      }
      for (const resolution of args.resolutions) {
        if (resolution.status !== "confirmed") continue;
        if (!resolution.fix_plan || !resolution.rollback_plan) throw new Error("Confirmed resolutions require both fix_plan and rollback_plan");
        if (typeof resolution.fix_plan.transport_required !== "boolean") throw new Error("Confirmed fix_plan must explicitly declare transport_required");
        if (!resolution.rollback_plan.steps?.length || !resolution.rollback_plan.trigger_conditions?.length) throw new Error("Rollback plan requires steps and trigger_conditions");
        for (const step of resolution.fix_plan.steps || []) {
          if ((step.tcode || step.fiori_app) && !step.menu_path) throw new Error("Every SAP fix action requires menu_path");
          if (step.tcode && SIMULATION_REQUIRED.has(String(step.tcode).toUpperCase()) && step.simulation_first !== true) {
            throw new Error(`${step.tcode} requires simulation_first=true`);
          }
        }
      }
      const now = new Date().toISOString();
      if ((state.current_turn_number || 1) < 4) this.openTurn(state, 4, "verify", now, args.surface);
      const verdict = {
        verdict_id: generateId("vdc"),
        session_id: args.session_id,
        turn_number: args.turn_number || state.current_turn_number || 4,
        created_at: now,
        overall_state: args.overall_state,
        summary: args.summary,
        resolutions: args.resolutions,
      };
      await this.assertValid("verdict", verdict);
      state.verdicts ||= [];
      state.verdicts.push(verdict);
      state.status = args.overall_state === "resolved" ? "resolved" : args.overall_state === "escalated" ? "escalated" : "verifying";
      state.last_updated_at = now;
      state.audit_trail ||= [];
      state.audit_trail.push({ at: now, action: "verdict_issued", actor: { surface: args.surface || "mcp_client" }, ref_id: verdict.verdict_id });
      if (state.status === "resolved") state.audit_trail.push({ at: now, action: "closed", actor: { surface: args.surface || "mcp_client" }, ref_id: verdict.verdict_id });
      await this.assertValid("session-state", state);
      await this.store.writeArtifact(args.session_id, `${verdict.verdict_id}.yaml`, verdict);
      await this.store.write(args.session_id, state);
      return { verdict_id: verdict.verdict_id, session_id: args.session_id, turn_number: verdict.turn_number, overall_state: args.overall_state, resolutions_count: args.resolutions.length };
    });
  }

  async next(args: { session_id: string; force_hypothesize?: boolean; surface?: SessionSurface }) {
    return this.queue.run(args.session_id, async () => {
      const state = await this.store.read(args.session_id);
      const now = new Date().toISOString();
      let signal = "no_transition";
      if (state.status === "intake" && state.bundles?.length) {
        state.status = "hypothesizing";
        this.openTurn(state, (state.current_turn_number || 1) + 1, "hypothesis", now, args.surface);
        signal = "generate_hypotheses";
      } else if (state.status === "hypothesizing" && state.hypotheses?.length && state.followup_requests?.length) {
        state.status = "awaiting_evidence";
        this.completeCurrentTurn(state, now);
        this.openTurn(state, (state.current_turn_number || 2) + 1, "collect", now, args.surface);
        signal = "waiting_for_evidence";
      } else if (state.status === "hypothesizing" && args.force_hypothesize) {
        signal = "generate_hypotheses";
      } else if (state.status === "awaiting_evidence" && state.bundles?.length > 1) {
        state.status = "verifying";
        this.completeCurrentTurn(state, now);
        this.openTurn(state, (state.current_turn_number || 3) + 1, "verify", now, args.surface);
        signal = "verify_hypotheses";
      } else if (state.status === "verifying" && state.verdicts?.length) {
        const latest = state.verdicts.at(-1);
        if (latest.overall_state === "resolved") {
          state.status = "resolved";
          this.completeCurrentTurn(state, now);
          signal = "session_complete";
        } else if (latest.overall_state === "needs_next_loop") {
          state.status = "hypothesizing";
          this.completeCurrentTurn(state, now);
          this.openTurn(state, (state.current_turn_number || 4) + 1, "hypothesis", now, args.surface);
          signal = "generate_hypotheses";
        }
      }
      state.last_updated_at = now;
      await this.assertValid("session-state", state);
      await this.store.write(args.session_id, state);
      return { session_id: args.session_id, status: state.status, current_turn: state.current_turn_number, signal };
    });
  }

  async validateFile(relativePath: string, schema: SchemaName) {
    if (!SCHEMA_NAMES.includes(schema)) throw new Error(`Invalid schema name: ${schema}`);
    const value = await this.store.readArtifact(relativePath);
    return { ...(await this.validate(schema, value)), path: relativePath, schema };
  }

  private completeCurrentTurn(state: any, now: string) {
    const turn = state.turns?.findLast((entry: any) => entry.status === "active");
    if (turn) { turn.status = "complete"; turn.completed_at = now; }
  }

  private openTurn(state: any, turnNumber: number, turnType: string, now: string, surface?: SessionSurface) {
    this.completeCurrentTurn(state, now);
    state.turns ||= [];
    if (!state.turns.some((entry: any) => entry.turn_number === turnNumber)) {
      state.turns.push({ turn_number: turnNumber, turn_type: turnType, started_at: now, status: "active", surface: surface || "mcp_client" });
    }
    state.current_turn_number = turnNumber;
  }
}
