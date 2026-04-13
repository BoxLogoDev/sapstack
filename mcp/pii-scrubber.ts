/**
 * PII (Personally Identifiable Information) Scrubber
 * Automatic masking of Korean personal data patterns
 *
 * Patterns covered:
 * - 주민번호 (Jumin Number): XXXXXX-XXXXXXX
 * - 사업자등록번호 (Business Registration Number): XXX-XX-XXXXX
 * - 신용카드 (Credit Card): XXXX-XXXX-XXXX-XXXX
 * - 계좌번호 (Bank Account): XXX-XX-XXXXXX
 * - 휴대전화 (Mobile Phone): 010-XXXX-XXXX
 * - 일반전화 (Fixed Phone): 02-XXXX-XXXX
 * - 이메일 (Email): user@example.com
 * - 성명 (Name - Korean): 김철수
 * - 입사번호 (Employee ID): E123456
 */

export interface PIIPattern {
  name: string;
  pattern: RegExp;
  classification: "RESTRICTED" | "CONFIDENTIAL" | "INTERNAL";
  mask: (match: string, ...groups: string[]) => string;
  description: string;
}

export interface ScrubberOptions {
  maskCharacter?: string;
  patterns?: PIIPattern[];
  logMatches?: boolean;
}

export interface Finding {
  patternName: string;
  classification: string;
  count: number;
  locations: number[];
  examples: Array<{ original: string; masked: string }>;
}

export interface ScrubResult {
  scrubbedText: string;
  findings: Finding[];
  hitCount: number;
  patternsMatched: string[];
  timestamp: string;
}

/**
 * Korean PII Patterns Library
 */
export const KOREAN_PII_PATTERNS: PIIPattern[] = [
  {
    name: "주민번호",
    pattern: /\d{6}-[1-4]\d{6}/g,
    classification: "RESTRICTED",
    mask: () => "######-#######",
    description:
      "Korean Resident Registration Number (XXXXXX-XXXXXXX format)",
  },
  {
    name: "사업자등록번호",
    pattern: /(\d{3})-(\d{2})-(\d{5})/g,
    classification: "RESTRICTED",
    mask: () => "###-##-#####",
    description: "Korean Business Registration Number (XXX-XX-XXXXX format)",
  },
  {
    name: "신용카드",
    pattern:
      /(?:\d{4}[-\s]?){3}\d{4}|\d{4}(?:[-\s]?\d{4}){3}|\d{16}(?=\D|$)/g,
    classification: "RESTRICTED",
    mask: (match) => {
      const digits = match.replace(/\D/g, "");
      if (digits.length === 16) {
        return `****-****-****-${digits.slice(-4)}`;
      }
      return match.replace(/\d/g, "*");
    },
    description: "Credit Card Number (masked except last 4 digits)",
  },
  {
    name: "계좌번호",
    pattern: /(\d{3})-(\d{2,3})-(\d{6,7})/g,
    classification: "RESTRICTED",
    mask: () => "***-***-***",
    description: "Bank Account Number (masked)",
  },
  {
    name: "휴대전화",
    pattern: /(?:\+82-?|0)1[0-9][-.]?\d{3,4}[-.]?\d{4}/g,
    classification: "CONFIDENTIAL",
    mask: (match) => {
      const cleaned = match.replace(/\D/g, "");
      const prefix = match.split(/-|\.|\s/)[0] || "010";
      return `${prefix}-****-****`;
    },
    description: "Mobile Phone Number (first 3 digits + masked suffix)",
  },
  {
    name: "일반전화",
    pattern: /0\d{1,2}[-.]?\d{3,4}[-.]?\d{4}/g,
    classification: "CONFIDENTIAL",
    mask: (match) => {
      const [area] = match.split(/-|\.|\s/);
      return `${area}-****-****`;
    },
    description: "Fixed Phone Number (area code + masked suffix)",
  },
  {
    name: "이메일",
    pattern: /([\w.-]+)@([\w.-]+\.\w+)/g,
    classification: "CONFIDENTIAL",
    mask: (match, local, domain) => {
      const first = local[0];
      return `${first}****@${domain}`;
    },
    description: "Email Address (first character + masked local part)",
  },
  {
    name: "성명",
    pattern: /[가-힣]{2,4}(?=\s|$|[.,;:])/g,
    classification: "CONFIDENTIAL",
    mask: (match) => {
      const first = match[0];
      return first + "*".repeat(match.length - 1);
    },
    description: "Korean Full Name (first character only visible)",
  },
  {
    name: "입사번호",
    pattern: /E\d{5,8}/g,
    classification: "INTERNAL",
    mask: (match) => match[0] + "*".repeat(match.length - 1),
    description: "Employee ID (first character + masked suffix)",
  },
];

/**
 * English/International PII Patterns (optional extension)
 */
export const INTERNATIONAL_PII_PATTERNS: PIIPattern[] = [
  {
    name: "SSN_US",
    pattern: /\d{3}-\d{2}-\d{4}/g,
    classification: "RESTRICTED",
    mask: () => "***-**-****",
    description: "US Social Security Number",
  },
  {
    name: "IP_Address",
    pattern:
      /\b(?:\d{1,3}\.){3}\d{1,3}\b(?![\w.-])|(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}\b/g,
    classification: "CONFIDENTIAL",
    mask: (match) => {
      const octets = match.split(".");
      if (octets.length === 4) {
        return `${octets[0]}.${octets[1]}.***.***.****`;
      }
      return "****:****:****:****:****";
    },
    description: "IP Address (first 2 octets only visible)",
  },
];

/**
 * Main PII Scrubber Class
 */
export class PIIScrubber {
  private patterns: PIIPattern[];
  private maskCharacter: string;
  private logMatches: boolean;

  constructor(opts: ScrubberOptions = {}) {
    this.patterns = opts.patterns || KOREAN_PII_PATTERNS;
    this.maskCharacter = opts.maskCharacter || "*";
    this.logMatches = opts.logMatches ?? false;
  }

  /**
   * Scrub PII from text
   */
  scrub(text: string): ScrubResult {
    if (!text || typeof text !== "string") {
      return {
        scrubbedText: text || "",
        findings: [],
        hitCount: 0,
        patternsMatched: [],
        timestamp: new Date().toISOString(),
      };
    }

    let scrubbedText = text;
    const findings: Finding[] = [];

    for (const pattern of this.patterns) {
      const matches = [...text.matchAll(pattern.pattern)];

      if (matches.length > 0) {
        // Collect examples (first 3 matches only, for privacy)
        const examples = matches.slice(0, 3).map((match) => {
          const original = match[0];
          const masked = pattern.mask(original, ...match.slice(1));
          return { original, masked };
        });

        findings.push({
          patternName: pattern.name,
          classification: pattern.classification,
          count: matches.length,
          locations: matches.map((m) => m.index || 0),
          examples,
        });

        // Apply masking
        scrubbedText = scrubbedText.replace(pattern.pattern, (match) => {
          return pattern.mask(match);
        });

        if (this.logMatches) {
          console.log(
            `[PII] ${pattern.name}: ${matches.length} matches found`
          );
        }
      }
    }

    return {
      scrubbedText,
      findings,
      hitCount: findings.reduce((sum, f) => sum + f.count, 0),
      patternsMatched: findings.map((f) => f.patternName),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Scrub JSON object (recursively)
   */
  scrubJson(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === "string") {
      return this.scrub(obj).scrubbedText;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.scrubJson(item));
    }

    if (typeof obj === "object") {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.scrubJson(value);
      }
      return result;
    }

    return obj;
  }

  /**
   * Check if text contains PII (without masking)
   */
  hasPII(text: string): boolean {
    if (!text || typeof text !== "string") {
      return false;
    }

    for (const pattern of this.patterns) {
      if (pattern.pattern.test(text)) {
        pattern.pattern.lastIndex = 0; // Reset global regex state
        return true;
      }
    }
    return false;
  }

  /**
   * Get PII statistics for text
   */
  analyze(text: string): Finding[] {
    return this.scrub(text).findings;
  }

  /**
   * Custom pattern registration
   */
  addPattern(pattern: PIIPattern): void {
    this.patterns.push(pattern);
  }

  /**
   * Get all registered patterns
   */
  getPatterns(): PIIPattern[] {
    return [...this.patterns];
  }
}

/**
 * Utility function: Quick scrub
 */
export function scrubPII(text: string, opts?: ScrubberOptions): ScrubResult {
  const scrubber = new PIIScrubber(opts);
  return scrubber.scrub(text);
}

/**
 * Utility function: Check for PII
 */
export function detectPII(text: string): boolean {
  const scrubber = new PIIScrubber();
  return scrubber.hasPII(text);
}

/**
 * Utility function: Scrub JSON
 */
export function scrubJSONPII(
  obj: any,
  opts?: ScrubberOptions
): {
  result: any;
  summary: ScrubResult;
} {
  const scrubber = new PIIScrubber(opts);
  const result = scrubber.scrubJson(obj);

  // Create summary
  const jsonString = JSON.stringify(obj);
  const summary = scrubber.scrub(jsonString);

  return { result, summary };
}

/**
 * Classification-based filtering
 */
export function scrubByClassification(
  text: string,
  maxClassification: "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED"
): ScrubResult {
  const classificationOrder = {
    INTERNAL: 3,
    CONFIDENTIAL: 2,
    RESTRICTED: 1,
  };

  const maxLevel = classificationOrder[maxClassification];

  const filteredPatterns = KOREAN_PII_PATTERNS.filter((p) => {
    const pLevel = classificationOrder[p.classification];
    return pLevel >= maxLevel;
  });

  const scrubber = new PIIScrubber({ patterns: filteredPatterns });
  return scrubber.scrub(text);
}

// ============================================
// Integration with Evidence Bundle
// ============================================

export interface EvidenceBundleScrubRequest {
  bundle: any;
  classification: "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  preserveFields?: string[]; // Fields to NOT scrub (e.g., ["session_id"])
}

export interface EvidenceBundleScrubResult {
  scrubbedBundle: any;
  findings: Finding[];
  fieldsScubbed: string[];
  timestamp: string;
}

/**
 * Scrub an Evidence Bundle for compliance
 */
export function scrubEvidenceBundle(
  req: EvidenceBundleScrubRequest
): EvidenceBundleScrubResult {
  const scrubber = new PIIScrubber();
  const preserve = new Set(req.preserveFields || []);

  const fieldsScrubbed: string[] = [];

  function scrubRecursive(obj: any, path: string = ""): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === "string") {
      const result = scrubber.scrub(obj);
      if (result.hitCount > 0) {
        fieldsScrubbed.push(path);
      }
      return result.scrubbedText;
    }

    if (Array.isArray(obj)) {
      return obj.map((item, idx) =>
        scrubRecursive(item, `${path}[${idx}]`)
      );
    }

    if (typeof obj === "object") {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = path ? `${path}.${key}` : key;

        if (preserve.has(fieldPath) || preserve.has(key)) {
          result[key] = value;
        } else {
          result[key] = scrubRecursive(value, fieldPath);
        }
      }
      return result;
    }

    return obj;
  }

  const scrubbedBundle = scrubRecursive(req.bundle);

  return {
    scrubbedBundle,
    findings: scrubber.analyze(JSON.stringify(req.bundle)),
    fieldsScubbed,
    timestamp: new Date().toISOString(),
  };
}

// Export default instance for convenience
export default new PIIScrubber({ logMatches: true });
