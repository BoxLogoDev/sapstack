import type { AssetManifest } from "./assets.js";

export interface SupportBundleManifest {
  schema_version: 1;
  generated_at: string;
  app: { version: string; platform: string; arch: string };
  runtime: Pick<AssetManifest, "formatVersion" | "productVersion" | "counts">;
  environment: { release?: string; deployment?: string; language?: string };
  excluded: string[];
}

const ENVIRONMENT_VALUES = {
  release: new Set(["ECC6_EhP7", "ECC6_EhP8", "S4_2020", "S4_2021", "S4_2022", "S4_2023", "S4_2024", "RISE", "PublicCloud", "Unknown"]),
  deployment: new Set(["on_premise", "private_cloud", "public_cloud", "unknown"]),
  language: new Set(["ko", "en", "de", "ja", "zh", "vi", "id", "fr", "es"]),
} as const;

export function buildSupportBundle(input: {
  appVersion: string;
  platform: string;
  arch: string;
  runtime: AssetManifest;
  environment?: unknown;
}): SupportBundleManifest {
  const environment = input.environment && typeof input.environment === "object" && !Array.isArray(input.environment)
    ? input.environment as Record<string, unknown>
    : {};
  const safeEnvironment: SupportBundleManifest["environment"] = {};
  for (const key of ["release", "deployment", "language"] as const) {
    const value = environment[key];
    if (typeof value === "string" && ENVIRONMENT_VALUES[key].has(value as never)) safeEnvironment[key] = value;
  }

  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    app: { version: input.appVersion, platform: input.platform, arch: input.arch },
    runtime: {
      formatVersion: input.runtime.formatVersion,
      productVersion: input.runtime.productVersion,
      counts: { ...input.runtime.counts },
    },
    environment: safeEnvironment,
    excluded: ["credentials", "paths", "source_names", "session_content", "evidence", "prompts", "logs", "industry", "client"],
  };
}
