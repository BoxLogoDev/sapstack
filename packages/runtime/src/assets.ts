import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";

export interface AssetManifest {
  formatVersion: number;
  productVersion: string;
  generatedAt?: string;
  counts: {
    plugins: number;
    agents: number;
    commands: number;
    tools: number;
    prompts: number;
    resources: number;
  };
  roots: string[];
  required: string[];
}

export interface AssetProvider {
  readonly root: string;
  readText(relativePath: string): Promise<string>;
  readJson<T = unknown>(relativePath: string): Promise<T>;
  readYaml<T = unknown>(relativePath: string): Promise<T>;
  list(relativePath: string): Promise<string[]>;
  exists(relativePath: string): Promise<boolean>;
  manifest(): Promise<AssetManifest>;
}

function assertRelativeAssetPath(relativePath: string): string {
  if (!relativePath || path.isAbsolute(relativePath)) {
    throw new Error(`Asset path must be relative: ${relativePath}`);
  }
  const normalized = path.normalize(relativePath);
  if (normalized === ".." || normalized.startsWith(`..${path.sep}`)) {
    throw new Error(`Asset path traversal is not allowed: ${relativePath}`);
  }
  return normalized;
}

export class FileSystemAssetProvider implements AssetProvider {
  readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  private resolve(relativePath: string): string {
    const target = path.resolve(this.root, assertRelativeAssetPath(relativePath));
    const prefix = `${this.root}${path.sep}`;
    if (target !== this.root && !target.startsWith(prefix)) {
      throw new Error(`Asset path escapes provider root: ${relativePath}`);
    }
    return target;
  }

  async readText(relativePath: string): Promise<string> {
    return fs.readFile(this.resolve(relativePath), "utf8");
  }

  async readJson<T = unknown>(relativePath: string): Promise<T> {
    return JSON.parse(await this.readText(relativePath)) as T;
  }

  async readYaml<T = unknown>(relativePath: string): Promise<T> {
    return yaml.load(await this.readText(relativePath)) as T;
  }

  async list(relativePath: string): Promise<string[]> {
    try {
      return await fs.readdir(this.resolve(relativePath));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  async exists(relativePath: string): Promise<boolean> {
    try {
      await fs.access(this.resolve(relativePath));
      return true;
    } catch {
      return false;
    }
  }

  async manifest(): Promise<AssetManifest> {
    return this.readJson<AssetManifest>("asset-manifest.json");
  }
}

async function isAssetRoot(candidate: string): Promise<boolean> {
  try {
    await Promise.all([
      fs.access(path.join(candidate, "data", "tcodes.yaml")),
      fs.access(path.join(candidate, "schemas", "session-state.schema.yaml")),
      fs.access(path.join(candidate, "asset-manifest.json")),
    ]);
    return true;
  } catch {
    return false;
  }
}

export interface DefaultAssetProviderOptions {
  overrideRoot?: string;
  moduleUrl?: string;
  cwd?: string;
}

/**
 * Resolve assets in a deterministic order. SAPSTACK_ROOT remains a development
 * override; packaged assets win over workspace heuristics when no override is set.
 */
export async function createDefaultAssetProvider(
  options: DefaultAssetProviderOptions = {},
): Promise<FileSystemAssetProvider> {
  const cwd = path.resolve(options.cwd || process.cwd());
  const moduleDir = options.moduleUrl
    ? path.dirname(fileURLToPath(options.moduleUrl))
    : cwd;
  const override = options.overrideRoot || process.env.SAPSTACK_ROOT;
  const candidates = [
    override,
    path.resolve(moduleDir, "../assets"),
    path.resolve(moduleDir, "../../assets"),
    path.resolve(moduleDir, "../../../mcp/assets"),
    cwd,
    path.join(cwd, "sapstack"),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of [...new Set(candidates.map(value => path.resolve(value)))]) {
    if (await isAssetRoot(candidate)) return new FileSystemAssetProvider(candidate);
  }

  throw new Error(
    `sapstack assets not found. Checked: ${candidates.join(", ")}. ` +
      "Run the build step to bundle assets; SAPSTACK_ROOT is only needed for development overrides.",
  );
}
