import { createHash } from "node:crypto";
import type { AssetProvider } from "./assets.js";
import type { SessionStore } from "./sessions.js";

export interface LearningCandidate {
  candidate_id: string;
  kind: "gold_set" | "codify";
  symptom_ref?: string;
  modules: string[];
  review_required: true;
}

export interface LearningSummary {
  schema_version: "1.0.0";
  total_sessions: number;
  resolved_sessions: number;
  skipped_sessions: number;
  resolution_rate: number;
  hypothesis_accuracy: number | null;
  module_distribution: Record<string, number>;
  candidates: LearningCandidate[];
  privacy: {
    contains_free_text: false;
    contains_environment: false;
    auto_apply: false;
  };
}

function candidateId(kind: LearningCandidate["kind"], sessionId: string): string {
  return createHash("sha256").update(`${kind}:${sessionId}`).digest("hex").slice(0, 16);
}

function safeModules(hypothesis: any): string[] {
  const current = Array.isArray(hypothesis?.impacted_modules) && hypothesis.impacted_modules.length
    ? hypothesis.impacted_modules
    : hypothesis?.likely_modules;
  return Array.isArray(current)
    ? current.map(String).filter(value => /^[A-Z0-9-]{1,16}$/i.test(value)).map(value => value.toUpperCase())
    : [];
}

export class LearningService {
  constructor(private readonly assets: AssetProvider, private readonly store: SessionStore) {}

  async inspect(): Promise<LearningSummary> {
    const goldRefs = await this.goldReferences();
    const sessionIds = await this.store.list();
    const states: any[] = [];
    let skippedSessions = 0;
    for (const sessionId of sessionIds) {
      try { states.push(await this.store.read(sessionId)); }
      catch { skippedSessions++; }
    }

    const moduleDistribution = new Map<string, number>();
    const candidates: LearningCandidate[] = [];
    let resolvedSessions = 0;
    let confirmed = 0;
    let refuted = 0;

    for (const state of states) {
      const confirmedHypotheses = new Set<string>();
      for (const verdict of state.verdicts || []) {
        for (const resolution of verdict.resolutions || []) {
          if (resolution.status === "confirmed") {
            confirmed++;
            confirmedHypotheses.add(resolution.hypothesis_id);
          } else if (resolution.status === "refuted") {
            refuted++;
          }
        }
      }

      const modules = new Set<string>();
      for (const hypothesis of state.hypotheses || []) {
        if (!confirmedHypotheses.has(hypothesis.hypothesis_id)) continue;
        for (const module of safeModules(hypothesis)) {
          modules.add(module);
          moduleDistribution.set(module, (moduleDistribution.get(module) || 0) + 1);
        }
      }

      if (state.status !== "resolved") continue;
      resolvedSessions++;
      const rawRef = state.initial_symptom?.matched_symptom_index_entry;
      const symptomRef = typeof rawRef === "string" && /^[a-z0-9-]+$/.test(rawRef) ? rawRef : undefined;
      const kind = symptomRef && !goldRefs.has(symptomRef) ? "gold_set" : !symptomRef ? "codify" : undefined;
      if (!kind) continue;
      candidates.push({
        candidate_id: candidateId(kind, String(state.session_id)),
        kind,
        ...(symptomRef ? { symptom_ref: symptomRef } : {}),
        modules: [...modules].sort(),
        review_required: true,
      });
    }

    return {
      schema_version: "1.0.0",
      total_sessions: states.length,
      resolved_sessions: resolvedSessions,
      skipped_sessions: skippedSessions,
      resolution_rate: states.length ? Number((resolvedSessions / states.length).toFixed(3)) : 0,
      hypothesis_accuracy: confirmed + refuted ? Number((confirmed / (confirmed + refuted)).toFixed(3)) : null,
      module_distribution: Object.fromEntries([...moduleDistribution.entries()].sort()),
      candidates: candidates.sort((a, b) => a.candidate_id.localeCompare(b.candidate_id)),
      privacy: { contains_free_text: false, contains_environment: false, auto_apply: false },
    };
  }

  private async goldReferences(): Promise<Set<string>> {
    try {
      const document = await this.assets.readYaml<any>("data/eval/gold-set.yaml");
      return new Set((document?.cases || []).map((entry: any) => entry?.symptom_ref).filter((value: unknown): value is string => typeof value === "string"));
    } catch {
      return new Set();
    }
  }
}
