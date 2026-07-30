import * as path from "node:path";

export interface PiiFinding {
  type: string;
  classification: "RESTRICTED" | "CONFIDENTIAL" | "INTERNAL";
  count: number;
}

export interface ScrubResult {
  scrubbedText: string;
  findings: PiiFinding[];
  hitCount: number;
}

const PII_PATTERNS: Array<{
  type: string;
  classification: PiiFinding["classification"];
  pattern: RegExp;
  replace: string | ((substring: string, ...args: string[]) => string);
}> = [
  { type: "resident_registration_number", classification: "RESTRICTED", pattern: /\b\d{6}-[1-4]\d{6}\b/g, replace: "######-#######" },
  { type: "business_registration_number", classification: "RESTRICTED", pattern: /\b\d{3}-\d{2}-\d{5}\b/g, replace: "###-##-#####" },
  { type: "credit_card", classification: "RESTRICTED", pattern: /\b(?:\d{4}[- ]?){3}\d{4}\b/g, replace: value => `****-****-****-${value.replace(/\D/g, "").slice(-4)}` },
  { type: "mobile_phone", classification: "CONFIDENTIAL", pattern: /\b(?:\+82[- ]?|0)1\d[- ]?\d{3,4}[- ]?\d{4}\b/g, replace: "010-****-****" },
  { type: "email", classification: "CONFIDENTIAL", pattern: /\b([\w.+-])([\w.+-]*)@([\w.-]+\.[A-Za-z]{2,})\b/g, replace: (_value, first, _rest, domain) => `${first}****@${domain}` },
  { type: "employee_id", classification: "INTERNAL", pattern: /\bE\d{5,8}\b/g, replace: value => `${value[0]}${"*".repeat(value.length - 1)}` },
];

export class SecurityService {
  scrub(text: string): ScrubResult {
    let scrubbedText = text || "";
    const findings: PiiFinding[] = [];
    for (const entry of PII_PATTERNS) {
      const matches = [...scrubbedText.matchAll(entry.pattern)];
      if (!matches.length) continue;
      findings.push({ type: entry.type, classification: entry.classification, count: matches.length });
      scrubbedText = scrubbedText.replace(entry.pattern, entry.replace as never);
    }
    return { scrubbedText, findings, hitCount: findings.reduce((sum, finding) => sum + finding.count, 0) };
  }

  scrubJson<T>(value: T): T {
    if (typeof value === "string") return this.scrub(value).scrubbedText as T;
    if (Array.isArray(value)) return value.map(item => this.scrubJson(item)) as T;
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.scrubJson(item)])) as T;
    }
    return value;
  }

  resolveInside(root: string, relativePath: string): string {
    if (path.isAbsolute(relativePath)) throw new Error("Absolute paths are not allowed");
    const resolvedRoot = path.resolve(root);
    const resolved = path.resolve(resolvedRoot, relativePath);
    if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
      throw new Error("Path traversal is not allowed");
    }
    return resolved;
  }
}
