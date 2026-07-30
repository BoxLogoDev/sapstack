import type { AssetProvider } from "./assets.js";
import type { CatalogService } from "./catalog.js";

interface Symptom {
  id: string;
  symptom_ko?: string;
  symptom_ko_variants?: string[];
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

interface SynonymIndex {
  variantToCanonical: Map<string, string>;
  canonicalToForms: Map<string, string[]>;
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[.,!?"'()[\]{}]/g, " ").split(/\s+/).filter(token => token.length >= 2);
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

export class KnowledgeService {
  private synonyms?: Promise<SynonymIndex>;

  constructor(
    private readonly assets: AssetProvider,
    private readonly catalog: CatalogService,
  ) {}

  private loadSynonyms(): Promise<SynonymIndex> {
    if (!this.synonyms) {
      this.synonyms = this.assets.readYaml<any>("data/synonyms.yaml").then(raw => {
        const variantToCanonical = new Map<string, string>();
        const canonicalToForms = new Map<string, string[]>();
        const add = (canonical: string, forms: unknown[]) => {
          const values = forms.flatMap(value => Array.isArray(value) ? value : [value])
            .filter((value): value is string => typeof value === "string" && Boolean(value.trim()));
          canonicalToForms.set(canonical, [...new Set(values)]);
          for (const value of values) variantToCanonical.set(normalize(value), canonical);
        };
        for (const term of raw.terms || []) {
          add(term.canonical, [term.en, term.field_forms, term.ko?.primary, term.ko?.variants, term.de?.primary, term.de?.variants, term.ja?.primary, term.ja?.variants]);
        }
        for (const abbreviation of raw.abbreviations || []) {
          add(abbreviation.short, [abbreviation.short, String(abbreviation.ko_pronunciation || "").split("/")]);
        }
        for (const expression of raw.business_time_expressions || []) {
          add(expression.canonical, [expression.ko, expression.ko_variants]);
        }
        return { variantToCanonical, canonicalToForms };
      });
    }
    return this.synonyms;
  }

  async resolveSymptom(args: { query: string; language?: string; country?: string; top_n?: number }) {
    if (!args.query?.trim()) throw new Error("query is required");
    const raw = await this.assets.readYaml<{ symptoms: Symptom[] }>("data/symptom-index.yaml");
    const synonyms = await this.loadSynonyms();
    const tokens = tokenize(args.query);
    const queryTcodes = [...new Set(args.query.toUpperCase().match(/\b[A-Z]{2}[0-9A-Z_]{1,12}\b/g) || [])];
    const canonicalHits = new Set<string>();
    for (const token of tokens) {
      const hit = synonyms.variantToCanonical.get(normalize(token));
      if (hit) canonicalHits.add(hit);
    }
    for (let width = 2; width <= 3; width++) {
      for (let index = 0; index <= tokens.length - width; index++) {
        const hit = synonyms.variantToCanonical.get(normalize(tokens.slice(index, index + width).join("")));
        if (hit) canonicalHits.add(hit);
      }
    }
    const expanded = [...canonicalHits].flatMap(hit => synonyms.canonicalToForms.get(hit) || []).map(value => value.toLowerCase());
    const language = args.language || "ko";
    const scored = (raw.symptoms || []).map(symptom => {
      const localized = (symptom as unknown as Record<string, unknown>)[`symptom_${language}`];
      const fields = [localized, symptom.symptom_en, symptom.symptom_ko_variants, symptom.typical_causes, symptom.id, symptom.likely_modules, symptom.first_check_tcodes]
        .flat().filter(Boolean).join(" ").toLowerCase();
      const hayTokens = tokenize(fields);
      let score = 0;
      for (const token of tokens) {
        if (fields.includes(token)) score += 1;
        if (hayTokens.some(candidate => candidate.includes(token) || token.includes(candidate))) score += 2;
      }
      for (const variant of expanded) if (fields.includes(variant)) score += 3;
      for (const tcode of queryTcodes) if ((symptom.first_check_tcodes || []).includes(tcode)) score += 5;
      return { symptom, score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, args.top_n || 5);
    const max = scored[0]?.score || 1;
    return scored.map(({ symptom, score }) => ({
      id: symptom.id,
      symptom: (symptom as unknown as Record<string, unknown>)[`symptom_${language}`] || symptom.symptom_en,
      confidence: Math.min(score / max, 1),
      likely_modules: symptom.likely_modules || [],
      first_check_tcodes: symptom.first_check_tcodes || [],
      typical_causes: symptom.typical_causes || [],
      localized_checks: args.country ? symptom.localized_checks?.[args.country] || [] : [],
    }));
  }

  async checkTcode(tcode: string) {
    const registry = await this.assets.readYaml<Record<string, any>>("data/tcodes.yaml");
    const target = tcode?.toUpperCase();
    const direct = registry[target];
    const nested = Array.isArray(registry.tcodes)
      ? registry.tcodes.find((entry: any) => String(entry.code || entry.tcode).toUpperCase() === target)
      : undefined;
    const details = direct && typeof direct === "object" ? { code: target, ...direct } : nested;
    return { tcode: target, verified: Boolean(details), details: details || null };
  }

  async listTcodesByModule(module: string) {
    const registry = await this.assets.readYaml<Record<string, any>>("data/tcodes.yaml");
    const target = module.toUpperCase();
    const tcodes = Object.entries(registry)
      .filter(([, value]) => value && typeof value === "object" && Array.isArray(value.modules) && value.modules.includes(target))
      .map(([code, value]) => ({ code, ...value }));
    return { module: target, count: tcodes.length, tcodes };
  }

  async resolveSapNote(keyword: string) {
    const registry = await this.assets.readYaml<{ notes: any[] }>("data/sap-notes.yaml");
    const query = keyword.toLowerCase();
    return (registry.notes || []).filter(note => JSON.stringify(note).toLowerCase().includes(query)).slice(0, 10);
  }

  async findSapNoteByModule(module: string, max = 10) {
    const registry = await this.assets.readYaml<{ notes: any[] }>("data/sap-notes.yaml");
    const target = module.toUpperCase();
    const notes = (registry.notes || []).filter(note => (note.modules || []).some((item: string) => item === target || item === "ALL")).slice(0, max);
    return { module: target, count: notes.length, notes };
  }

  async lookupSynonym(term: string) {
    const synonyms = await this.loadSynonyms();
    const canonical = synonyms.variantToCanonical.get(normalize(term));
    return canonical
      ? { term, found: true, canonical, all_variants: synonyms.canonicalToForms.get(canonical) || [] }
      : { term, found: false, message: "Not found in synonym index" };
  }

  async agentsForIndustry(industry: string, topN = 10) {
    const matrix = await this.assets.readYaml<Record<string, any>>("data/industry-matrix.yaml");
    const key = industry.toLowerCase();
    if (!matrix[key]) return { industry: key, error: `Unknown industry: ${key}`, available: Object.keys(matrix).filter(name => !name.startsWith("_")) };
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
    const agents = Object.entries(matrix[key].modules || {}).map(([module, value]: [string, any]) => ({ module, ...value }))
      .sort((a, b) => (order[a.importance] ?? 9) - (order[b.importance] ?? 9)).slice(0, topN);
    return { industry: matrix[key].name || key, description: matrix[key].description, agents };
  }

  async periodEndSequence(modules?: string[]) {
    const sequence = await this.assets.readYaml<Record<string, any[]>>("data/period-end-sequence.yaml");
    const targets = modules?.map(module => module.toUpperCase());
    const steps = ["monthly_close", "quarterly_close", "yearly_close"].flatMap(cadence =>
      (sequence[cadence] || []).map(step => ({ cadence, ...step })),
    ).filter(step => !targets || targets.includes(String(step.module).toUpperCase()));
    return { modules_filter: targets || null, total_steps: steps.length, steps };
  }

  async masterDataRules(masterType: string) {
    const rules = await this.assets.readYaml<any>("data/master-data-rules.yaml");
    const candidates = rules.master_data_types || rules.rules || rules;
    const found = Array.isArray(candidates)
      ? candidates.find(item => [item.id, item.type, item.name].includes(masterType))
      : candidates[masterType];
    return found ? { master_type: masterType, found: true, ...found } : { master_type: masterType, found: false, available: Object.keys(candidates) };
  }

  async findImgNode(keyword: string) {
    const guides = await this.catalog.imgGuides();
    const matches = [];
    for (const guide of guides) {
      const text = await this.assets.readText(guide.path);
      if (!text.toLowerCase().includes(keyword.toLowerCase())) continue;
      const lines = text.split(/\r?\n/);
      matches.push({ ...guide, matched_lines: lines.filter(line => line.toLowerCase().includes(keyword.toLowerCase())).slice(0, 5), spro_paths: lines.filter(line => line.includes("SPRO")).slice(0, 3) });
    }
    return { keyword, count: matches.length, matches: matches.slice(0, 20) };
  }

  async symptomToAgent(symptom: string) {
    const matches = await this.resolveSymptom({ query: symptom, top_n: 3 });
    const agents = await this.catalog.agents();
    const recommended = new Set<string>();
    for (const match of matches) {
      for (const module of match.likely_modules) {
        const token = String(module).toLowerCase().replace("s4mig", "s4-migration");
        const agent = agents.find(entry => entry.id.includes(token));
        if (agent) recommended.add(agent.id);
      }
    }
    return { symptom, matches, recommended_agents: [...recommended] };
  }

  async sapNoteSteps(noteId: string) {
    const notes = await this.assets.readYaml<{ notes: any[] }>("data/sap-notes.yaml");
    const note = (notes.notes || []).find(entry => String(entry.id) === String(noteId));
    if (!note) return { note_id: noteId, found: false };
    const index = await this.assets.readYaml<{ symptoms: Symptom[] }>("data/symptom-index.yaml");
    const symptoms = (index.symptoms || []).filter(symptom => JSON.stringify(symptom).includes(String(noteId)));
    return { note_id: noteId, found: true, note, diagnostic_steps: symptoms.map(symptom => ({ symptom_id: symptom.id, tcodes: symptom.first_check_tcodes, causes: symptom.typical_causes })) };
  }

  async getPrompt(name: string, args: Record<string, unknown> = {}) {
    const agent = (await this.catalog.agents()).find(entry => entry.id === name);
    if (agent) {
      const issue = args.issue || args.code || args.scenario || args.symptom || "";
      return `${await this.assets.readText(agent.path)}\n\nIssue: ${issue}`;
    }
    const prompts: Record<string, string> = {
      "sap-session-turn2-hypothesis": "Generate 2-4 falsifiable SAP hypotheses. Each hypothesis requires at least two falsification observations and a read-only follow-up checklist.",
      "evidence-loop-turn2": "Generate 2-4 falsifiable SAP hypotheses. Each hypothesis requires at least two falsification observations and a read-only follow-up checklist.",
      "sap-session-turn4-verify": "Verify the SAP hypotheses against collected evidence. A confirmed resolution must include a Fix plan and a Rollback plan; do not resolve without both.",
      "evidence-loop-turn4": "Verify the SAP hypotheses against collected evidence. A confirmed resolution must include a Fix plan and a Rollback plan; do not resolve without both.",
      "korean-field-language": "Translate to Korean SAP field language. Preserve T-codes and field codes, and pair field terms with their official translation on first use.",
      "img-config-walk": "Provide SAP IMG configuration steps with T-code and menu path, ECC versus S/4HANA differences, Transport requirement, test run, verification, and rollback.",
      "best-practice-review": "Review the SAP setup across Operational, Period-End, and Governance tiers. Cite only verified T-codes and SAP Notes from sapstack assets.",
    };
    if (!prompts[name]) throw new Error(`Unknown prompt: ${name}`);
    return `${prompts[name]}\n\nInput:\n${JSON.stringify(args, null, 2)}`;
  }
}
