/**
 * sapstack MCP Server — Type definitions
 *
 * Derived from JSON schemas in ../schemas/
 * These types are for TypeScript strict mode compile-time checking.
 * Runtime validation uses Ajv + YAML schemas.
 */

// ─────────────────────────────────────────────────────────────
// Session State
// ─────────────────────────────────────────────────────────────

export type SessionStatus =
  | "intake"
  | "hypothesizing"
  | "awaiting_evidence"
  | "verifying"
  | "resolved"
  | "escalated"
  | "abandoned"
  | "reopened";

export type TurnType = "intake" | "hypothesis" | "collect" | "verify";

export interface Turn {
  turn_number: number;
  turn_type: TurnType;
  started_at: string; // ISO 8601
  completed_at?: string;
  status: "pending" | "active" | "complete" | "abandoned";
  surface: "cli" | "vscode_extension" | "web_triage" | "mcp_client" | "email";
  artifact_refs?: {
    bundle_ids?: string[];
    hypothesis_ids?: string[];
    followup_request_id?: string;
    verdict_id?: string;
  };
  duration_minutes?: number;
}

export interface AuditTrailEntry {
  at: string; // ISO 8601
  action:
    | "session_created"
    | "bundle_added"
    | "hypothesis_proposed"
    | "followup_requested"
    | "evidence_collected"
    | "hypothesis_confirmed"
    | "hypothesis_refuted"
    | "verdict_issued"
    | "fix_applied"
    | "rollback_applied"
    | "escalated"
    | "closed"
    | "reopened"
    | "handoff"
    | "session_updated";
  actor: {
    role?: string;
    handle?: string;
    surface?: string;
  };
  ref_id?: string;
  note?: string;
}

export interface SessionState {
  session_id: string; // Format: sess-yyyymmdd-xxxxxx
  schema_version: "1.0.0";
  created_at: string; // ISO 8601
  last_updated_at?: string;
  created_by?: {
    role: "end_user" | "operator" | "consultant" | "basis" | "auditor";
    handle?: string;
  };
  originating_surface?: "cli" | "vscode_extension" | "web_triage" | "mcp_client" | "email";
  status: SessionStatus;
  initial_symptom: {
    description: string;
    reporter_role: "end_user" | "operator" | "consultant" | "basis";
    language: string;
    country_iso?: string;
    matched_symptom_index_entry?: string;
  };
  sap_context?: SapContext;
  turns: Turn[];
  current_turn_number?: number;
  pending_followup_request_id?: string;
  hypotheses?: Hypothesis[];
  bundles?: EvidenceBundle[];
  followup_requests?: FollowupRequest[];
  verdicts?: Verdict[];
  audit_trail?: AuditTrailEntry[];
  tags?: string[];
  related_sessions?: string[];
}

// ─────────────────────────────────────────────────────────────
// Evidence Bundle
// ─────────────────────────────────────────────────────────────

export type EvidenceItemKind =
  | "screenshot"
  | "table_export"
  | "transaction_log"
  | "dump_st22"
  | "system_log_sm21"
  | "work_process_sm50"
  | "short_dump_trace"
  | "fiori_page_html"
  | "message_text"
  | "email_thread"
  | "custom_note";

export type EvidenceSourceType = "tcode" | "table" | "report" | "fiori_app" | "ticket" | "screenshot_tool" | "other";

export interface EvidenceSource {
  type: EvidenceSourceType;
  tcode?: string;
  table?: string;
  fiori_app_id?: string;
  ticket_id?: string;
  url?: string;
}

export interface EvidenceItem {
  item_id: string; // Format: evi-nnn
  kind: EvidenceItemKind;
  source: EvidenceSource;
  path?: string;
  inline_content?: string;
  content_hash?: string; // Format: sha256:...
  redacted_fields?: string[];
  captured_at?: string; // ISO 8601
  tags?: string[];
}

export interface SapContext {
  release?: "ECC6_EhP7" | "ECC6_EhP8" | "S4_2020" | "S4_2021" | "S4_2022" | "S4_2023" | "S4_2024" | "RISE" | "PublicCloud" | "Unknown";
  deployment?: "on_premise" | "private_cloud" | "public_cloud" | "unknown";
  client?: string; // Pattern: ^\d{3}$
  company_code?: string;
  country_iso?: string; // Pattern: ^[a-z]{2}$
  language?: "ko" | "en" | "de" | "ja" | "zh" | "vi" | "id" | "fr" | "es";
}

export interface CollectedBy {
  role: "end_user" | "operator" | "consultant" | "basis" | "auditor";
  handle?: string;
  sap_user_redacted?: boolean;
}

export interface EvidenceBundle {
  bundle_id: string; // Format: evb-yyyymmdd-xxxxxx
  session_id: string;
  turn_number: number;
  collected_at: string; // ISO 8601
  collected_by: CollectedBy;
  sap_context?: SapContext;
  items: EvidenceItem[];
  notes?: string;
}

// ─────────────────────────────────────────────────────────────
// Hypothesis
// ─────────────────────────────────────────────────────────────

export type ConfidenceTier = "high" | "medium" | "low";

export type SapModule = "FI" | "CO" | "TR" | "MM" | "SD" | "PP" | "HCM" | "SFSF" | "ABAP" | "BASIS" | "BC" | "GTS" | "BTP" | "S4MIG";

export type HypothesisStatus = "proposed" | "under_verification" | "confirmed" | "refuted" | "superseded";

export interface EvidenceRef {
  bundle_id: string;
  item_id: string;
  interpretation: string;
}

export interface FalsificationCriterion {
  if_observed: string;
  then: "refute" | "weaken" | "confirm" | "strengthen";
}

export type ConsultantAgent =
  | "sap-fi-consultant"
  | "sap-co-consultant"
  | "sap-mm-consultant"
  | "sap-sd-consultant"
  | "sap-pp-consultant"
  | "sap-abap-developer"
  | "sap-basis-consultant"
  | "sap-s4-migration-advisor"
  | "sap-integration-advisor";

export interface Hypothesis {
  hypothesis_id: string; // Format: h-nnn
  session_id: string;
  turn_number: number;
  parent_hypothesis_id?: string;
  statement: string;
  technical_chain: string[];
  confidence: number; // 0.0–1.0
  confidence_tier: ConfidenceTier;
  impacted_modules?: SapModule[];
  impacted_areas?: string[];
  evidence_refs: EvidenceRef[];
  falsification_evidence: FalsificationCriterion[];
  related_sap_notes?: string[];
  related_tcodes?: string[];
  consultant_agents_to_involve?: ConsultantAgent[];
  status?: HypothesisStatus;
  status_reason?: string;
  localization_notes?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────
// Follow-up Request
// ─────────────────────────────────────────────────────────────

export type CheckActionType =
  | "run_tcode"
  | "query_table"
  | "export_report"
  | "capture_screenshot"
  | "read_dump"
  | "check_config"
  | "check_note_status"
  | "check_authorization"
  | "read_log"
  | "other";

export type CheckPriority = "critical" | "high" | "medium" | "low";

export type OutputFormat = "screenshot_png" | "csv_export" | "text_paste" | "xlsx_export" | "pdf_export";

export type EscalationRole = "basis" | "security" | "functional_consultant" | "developer" | "auditor" | "none";

export interface CheckAction {
  type: CheckActionType;
  tcode?: string;
  table?: string;
  report?: string;
  parameters?: Record<string, string>;
  fields_of_interest?: string[];
  description?: string;
}

export interface CheckItem {
  check_id: string; // Format: chk-nnn
  purpose: string;
  hypothesis_ids: string[];
  action: CheckAction;
  expected_outcome: string;
  priority: CheckPriority;
  estimated_minutes: number;
  confirm_destructive?: boolean;
  safe_to_skip?: boolean;
  output_format?: OutputFormat;
}

export interface FollowupRequest {
  request_id: string; // Format: flr-yyyymmdd-xxxxxx
  session_id: string;
  turn_number: number;
  created_at: string; // ISO 8601
  summary: string;
  estimated_total_minutes: number;
  checks: CheckItem[];
  escalation_hint?: {
    to_role: EscalationRole;
    reason: string;
  };
}

// ─────────────────────────────────────────────────────────────
// Verdict
// ─────────────────────────────────────────────────────────────

export type OverallState = "resolved" | "needs_next_loop" | "escalated" | "insufficient_evidence";

export type ResolutionStatus = "confirmed" | "refuted" | "partial" | "inconclusive";

export type FixAudience = "end_user" | "operator" | "consultant" | "developer" | "basis";

export type SignoffStatus = "pending" | "signed_off" | "objected" | "not_applicable";

export interface FixStep {
  step_number: number;
  description: string;
  tcode?: string;
  fiori_app?: string;
  menu_path?: string;
  simulation_first?: boolean;
}

export interface FixPlan {
  audience: FixAudience;
  steps: FixStep[];
  reviewer_required: boolean;
  transport_required?: boolean;
  transport_notes?: string;
  estimated_duration_minutes?: number;
}

export interface RollbackStep {
  step_number: number;
  description: string;
  tcode?: string;
  menu_path?: string;
}

export interface RollbackPlan {
  steps: RollbackStep[];
  trigger_conditions: string[];
  max_rollback_window_minutes?: number;
}

export interface PreventionPlan {
  recommendations?: string[];
  monitoring_checks?: Array<{
    name: string;
    frequency: "daily" | "weekly" | "monthly" | "quarterly" | "on_demand";
    tcode?: string;
  }>;
}

export interface Resolution {
  hypothesis_id: string;
  status: ResolutionStatus;
  evidence_refs?: Array<{
    bundle_id: string;
    item_id: string;
    finding: string;
  }>;
  fix_plan?: FixPlan;
  rollback_plan?: RollbackPlan;
  prevention_plan?: PreventionPlan;
  affected_sap_notes?: string[];
}

export interface LocalizationSignoff {
  country_iso: string;
  role: string;
  status: SignoffStatus;
  notes?: string;
}

export interface Verdict {
  verdict_id: string; // Format: vdc-yyyymmdd-xxxxxx
  session_id: string;
  turn_number: number;
  created_at: string; // ISO 8601
  overall_state: OverallState;
  summary: string;
  resolutions: Resolution[];
  next_turn_preview?: {
    new_hypothesis_seeds: string[];
    additional_evidence_needed: boolean;
  };
  localization_signoffs?: LocalizationSignoff[];
}

// ─────────────────────────────────────────────────────────────
// Tool Arguments
// ─────────────────────────────────────────────────────────────

export interface StartSessionArgs {
  symptom: string;
  reporter_role?: "end_user" | "operator" | "consultant";
  country_iso?: string;
  release?: string;
  deployment?: string;
  client?: string;
  language?: string;
}

export interface AddEvidenceArgs {
  session_id: string;
  bundle_yaml: string;
}

export interface NextTurnArgs {
  session_id: string;
  force_hypothesize?: boolean;
}

export interface ValidateSessionFileArgs {
  path: string;
  schema: "session-state" | "evidence-bundle" | "hypothesis" | "followup-request" | "verdict";
}

// ─────────────────────────────────────────────────────────────
// New Tool Arguments (v1.7.0)
// ─────────────────────────────────────────────────────────────

export interface ListTcodesByModuleArgs {
  module: string;
}

export interface ListAgentsForIndustryArgs {
  industry: string;
  top_n?: number;
}

export interface GetPeriodEndSequenceArgs {
  modules?: string[];
}

export interface LookupSynonymArgs {
  term: string;
  lang?: string;
}

export interface ListImgGuidesArgs {
  module?: string;
}

export interface ListBestPracticesArgs {
  module?: string;
  tier?: string;
}

export interface GetMasterDataRulesArgs {
  master_type: string;
}

export interface FindSapNoteByModuleArgs {
  module: string;
  max?: number;
}

export interface FollowupCheckItem {
  check_id?: string;
  purpose: string;
  hypothesis_ids: string[];
  action_type: string;
  tcode?: string;
  expected_outcome: string;
  priority: string;
  estimated_minutes: number;
}

export interface AddFollowupRequestArgs {
  session_id: string;
  turn_number?: number;
  items: FollowupCheckItem[];
  summary?: string;
}

export interface HypothesisInput {
  statement: string;
  technical_chain: string[];
  confidence_tier: string;
  impacted_modules?: string[];
  evidence_refs?: Array<{ bundle_id: string; item_id: string; interpretation: string }>;
  falsification_evidence?: Array<{ if_observed: string; then: string }>;
  related_sap_notes?: string[];
  related_tcodes?: string[];
  consultant_agents_to_involve?: string[];
}

export interface SubmitHypothesisArgs {
  session_id: string;
  turn_number?: number;
  hypotheses: HypothesisInput[];
}

export interface ResolutionInput {
  hypothesis_id: string;
  status: string;
  evidence_refs?: Array<{ bundle_id: string; item_id: string; finding: string }>;
  fix_plan?: {
    audience: string;
    steps: Array<{ step_number: number; description: string; tcode?: string }>;
    reviewer_required?: boolean;
    transport_required?: boolean;
  };
  rollback_plan?: {
    steps: Array<{ step_number: number; description: string; tcode?: string }>;
    trigger_conditions?: string[];
  };
}

export interface SubmitVerdictArgs {
  session_id: string;
  turn_number?: number;
  overall_state: string;
  summary: string;
  resolutions: ResolutionInput[];
}
