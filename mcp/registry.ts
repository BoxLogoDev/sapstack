import type { SapstackRuntime } from "../packages/runtime/src/index.js";

type JsonSchema = Record<string, unknown>;

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  invoke(runtime: SapstackRuntime, args: any): Promise<unknown>;
}

const objectSchema = (properties: JsonSchema = {}, required: string[] = []): JsonSchema => ({
  type: "object",
  properties,
  ...(required.length ? { required } : {}),
  additionalProperties: false,
});

const string = (description?: string): JsonSchema => ({ type: "string", ...(description ? { description } : {}) });
const integer = (description?: string): JsonSchema => ({ type: "integer", ...(description ? { description } : {}) });
const array = (items: JsonSchema = {}): JsonSchema => ({ type: "array", items });

export const TOOL_REGISTRY: readonly ToolDefinition[] = [
  { name: "resolve_sap_note", description: "Search verified SAP Notes by keyword", inputSchema: objectSchema({ keyword: string() }, ["keyword"]), invoke: (r, a) => r.knowledge.resolveSapNote(a.keyword) },
  { name: "check_tcode", description: "Verify T-code existence in the sapstack registry", inputSchema: objectSchema({ tcode: string() }, ["tcode"]), invoke: (r, a) => r.knowledge.checkTcode(a.tcode) },
  { name: "list_plugins", description: "List all sapstack plugins", inputSchema: objectSchema(), invoke: r => r.catalog.plugins() },
  { name: "resolve_symptom", description: "Fuzzy-match a symptom against the multilingual symptom index", inputSchema: objectSchema({ query: string(), language: string(), country: string(), top_n: integer() }, ["query"]), invoke: (r, a) => r.knowledge.resolveSymptom(a) },
  { name: "start_session", description: "Start a canonical Evidence Loop session", inputSchema: objectSchema({ symptom: string(), matched_symptom_index_entry: string(), reporter_role: string(), country_iso: string(), release: string(), deployment: string(), industry: string(), client: string(), language: string() }, ["symptom"]), invoke: (r, a) => r.sessions.start(a) },
  { name: "add_evidence", description: "Validate and append an Evidence Bundle", inputSchema: objectSchema({ session_id: string(), bundle_yaml: string() }, ["session_id", "bundle_yaml"]), invoke: (r, a) => r.sessions.addEvidence(a) },
  { name: "next_turn", description: "Advance the Evidence Loop state machine", inputSchema: objectSchema({ session_id: string(), force_hypothesize: { type: "boolean" } }, ["session_id"]), invoke: (r, a) => r.sessions.next(a) },
  { name: "list_sessions", description: "List canonical Evidence Loop sessions", inputSchema: objectSchema({ status: string(), country_iso: string(), limit: integer() }), invoke: (r, a) => r.sessions.list(a) },
  { name: "validate_session_file", description: "Validate a canonical session artifact against its schema", inputSchema: objectSchema({ path: string(), schema: { type: "string", enum: ["session-state", "evidence-bundle", "hypothesis", "followup-request", "verdict"] } }, ["path", "schema"]), invoke: (r, a) => r.sessions.validateFile(a.path, a.schema) },
  { name: "list_tcodes_by_module", description: "List verified T-codes for an SAP module", inputSchema: objectSchema({ module: string() }, ["module"]), invoke: (r, a) => r.knowledge.listTcodesByModule(a.module) },
  { name: "list_agents_for_industry", description: "List prioritized sapstack agents for an industry", inputSchema: objectSchema({ industry: string(), top_n: integer() }, ["industry"]), invoke: (r, a) => r.knowledge.agentsForIndustry(a.industry, a.top_n) },
  { name: "get_period_end_sequence", description: "Return period-end steps with dependencies and safety gates", inputSchema: objectSchema({ modules: array(string()) }), invoke: (r, a) => r.knowledge.periodEndSequence(a.modules) },
  { name: "lookup_synonym", description: "Resolve a field-language synonym to its canonical term", inputSchema: objectSchema({ term: string(), lang: string() }, ["term"]), invoke: (r, a) => r.knowledge.lookupSynonym(a.term) },
  { name: "list_img_guides", description: "List IMG configuration guides", inputSchema: objectSchema({ module: string() }), invoke: (r, a) => r.catalog.imgGuides(a.module) },
  { name: "list_best_practices", description: "List SAP best-practice references by module and tier", inputSchema: objectSchema({ module: string(), tier: string() }), invoke: (r, a) => r.catalog.bestPractices(a.module, a.tier) },
  { name: "get_master_data_rules", description: "Get sapstack master-data governance rules", inputSchema: objectSchema({ master_type: string() }, ["master_type"]), invoke: (r, a) => r.knowledge.masterDataRules(a.master_type) },
  { name: "find_sap_note_by_module", description: "Search verified SAP Notes by module", inputSchema: objectSchema({ module: string(), max: integer() }, ["module"]), invoke: (r, a) => r.knowledge.findSapNoteByModule(a.module, a.max) },
  { name: "add_followup_request", description: "Append a read-only Evidence Loop follow-up checklist", inputSchema: objectSchema({ session_id: string(), turn_number: integer(), items: array(objectSchema()), summary: string() }, ["session_id", "items"]), invoke: (r, a) => r.sessions.addFollowup(a) },
  { name: "submit_hypothesis", description: "Submit 2-4 falsifiable hypotheses", inputSchema: objectSchema({ session_id: string(), turn_number: integer(), hypotheses: array(objectSchema()) }, ["session_id", "hypotheses"]), invoke: (r, a) => r.sessions.submitHypotheses(a) },
  { name: "submit_verdict", description: "Submit a verdict with mandatory Fix and Rollback pairing", inputSchema: objectSchema({ session_id: string(), turn_number: integer(), overall_state: string(), summary: string(), resolutions: array(objectSchema()) }, ["session_id", "overall_state", "summary", "resolutions"]), invoke: (r, a) => r.sessions.submitVerdict(a) },
  { name: "find_img_node_by_keyword", description: "Search IMG guides and SPRO paths by keyword", inputSchema: objectSchema({ keyword: string() }, ["keyword"]), invoke: (r, a) => r.knowledge.findImgNode(a.keyword) },
  { name: "symptom_to_agent_auto", description: "Route a symptom to matching consultant agents", inputSchema: objectSchema({ symptom: string() }, ["symptom"]), invoke: (r, a) => r.knowledge.symptomToAgent(a.symptom) },
  { name: "sap_note_steps", description: "Return verified SAP Note metadata with symptom-linked diagnostic steps", inputSchema: objectSchema({ note_id: string() }, ["note_id"]), invoke: (r, a) => r.knowledge.sapNoteSteps(a.note_id) },
] as const;

export const PROMPT_REGISTRY = [
  { name: "sap-fi-consultant", description: "FI consultant systematic diagnosis", arguments: [{ name: "issue", required: true }] },
  { name: "sap-abap-developer", description: "ABAP Clean Core and HANA code review", arguments: [{ name: "code", required: true }] },
  { name: "sap-s4-migration-advisor", description: "S/4HANA migration advisory", arguments: [{ name: "scenario", required: true }] },
  { name: "sap-basis-consultant", description: "Basis issue routing", arguments: [{ name: "symptom", required: true }] },
  { name: "sap-mm-consultant", description: "MM procurement and inventory diagnosis", arguments: [{ name: "issue", required: true }] },
  { name: "sap-session-turn2-hypothesis", description: "Evidence Loop Turn 2 hypothesis generation", arguments: [{ name: "bundle_data", required: true }] },
  { name: "sap-session-turn4-verify", description: "Evidence Loop Turn 4 verification", arguments: [{ name: "session_data", required: true }] },
  { name: "korean-field-language", description: "Korean SAP field-language conversion", arguments: [{ name: "text", required: true }] },
  { name: "img-config-walk", description: "IMG configuration walkthrough", arguments: [{ name: "topic", required: true }] },
  { name: "best-practice-review", description: "Three-tier SAP best-practice review", arguments: [{ name: "setup_description", required: true }] },
  { name: "evidence-loop-turn2", description: "Compatibility alias for Evidence Loop Turn 2", arguments: [{ name: "bundle_data", required: true }] },
  { name: "evidence-loop-turn4", description: "Compatibility alias for Evidence Loop Turn 4", arguments: [{ name: "session_data", required: true }] },
] as const;

export const RESOURCE_REGISTRY = [
  { uri: "sapstack://rules/universal", name: "sapstack Universal Rules", mimeType: "text/markdown" },
  { uri: "sapstack://data/tcodes", name: "Verified T-code Registry", mimeType: "application/yaml" },
  { uri: "sapstack://data/sap-notes", name: "Verified SAP Notes", mimeType: "application/yaml" },
  { uri: "sapstack://data/symptom-index", name: "Symptom Index", mimeType: "application/yaml" },
  { uri: "sapstack://sessions/list", name: "Canonical Sessions Index", mimeType: "application/json" },
] as const;

export const RESOURCE_TEMPLATE_REGISTRY = [
  { uriTemplate: "sapstack://skill/{module}", name: "Module skill", mimeType: "text/markdown" },
  { uriTemplate: "sapstack://schema/{schema}", name: "Evidence Loop schema", mimeType: "application/yaml" },
  { uriTemplate: "sapstack://session/{session_id}", name: "Canonical session", mimeType: "application/yaml" },
  { uriTemplate: "sapstack://session/{session_id}/bundle/{bundle_id}", name: "Evidence bundle", mimeType: "application/yaml" },
] as const;

const toolsByName = new Map(TOOL_REGISTRY.map(tool => [tool.name, tool]));

export async function dispatchTool(runtime: SapstackRuntime, name: string, args: unknown): Promise<unknown> {
  const tool = toolsByName.get(name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return tool.invoke(runtime, args || {});
}
