import type { AssetProvider } from "./assets.js";

export interface CatalogEntry {
  id: string;
  name: string;
  description?: string;
  version?: string;
  path: string;
}

function frontmatterValue(text: string, key: string): string | undefined {
  const match = text.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, "m"));
  return match?.[1]?.trim();
}

export class CatalogService {
  constructor(private readonly assets: AssetProvider) {}

  async plugins(): Promise<CatalogEntry[]> {
    const entries: CatalogEntry[] = [];
    for (const id of await this.assets.list("plugins")) {
      if (!id.startsWith("sap-")) continue;
      const metaPath = `plugins/${id}/.claude-plugin/plugin.json`;
      try {
        const meta = await this.assets.readJson<Record<string, string>>(metaPath);
        entries.push({
          id,
          name: meta.name || id,
          description: meta.description,
          version: meta.version,
          path: `plugins/${id}`,
        });
      } catch {
        entries.push({ id, name: id, path: `plugins/${id}` });
      }
    }
    return entries.sort((a, b) => a.id.localeCompare(b.id));
  }

  async agents(): Promise<CatalogEntry[]> {
    const entries: CatalogEntry[] = [];
    for (const filename of await this.assets.list("agents")) {
      if (!filename.endsWith(".md")) continue;
      const text = await this.assets.readText(`agents/${filename}`);
      const id = filename.slice(0, -3);
      entries.push({
        id,
        name: frontmatterValue(text, "name") || id,
        description: frontmatterValue(text, "description"),
        path: `agents/${filename}`,
      });
    }
    return entries.sort((a, b) => a.id.localeCompare(b.id));
  }

  async commands(): Promise<CatalogEntry[]> {
    const entries: CatalogEntry[] = [];
    for (const filename of await this.assets.list("commands")) {
      if (!filename.endsWith(".md")) continue;
      const text = await this.assets.readText(`commands/${filename}`);
      const id = filename.slice(0, -3);
      entries.push({
        id,
        name: frontmatterValue(text, "name") || id,
        description: frontmatterValue(text, "description"),
        path: `commands/${filename}`,
      });
    }
    return entries.sort((a, b) => a.id.localeCompare(b.id));
  }

  async imgGuides(module?: string) {
    const selected = module?.toLowerCase();
    const plugins = selected ? [`sap-${selected}`] : (await this.plugins()).map(entry => entry.id);
    const guides: Array<{ module: string; path: string; file: string }> = [];
    for (const plugin of plugins) {
      const base = `plugins/${plugin}/skills/${plugin}/references/img`;
      for (const file of await this.assets.list(base)) {
        if (file.endsWith(".md")) guides.push({ module: plugin.slice(4).toUpperCase(), path: `${base}/${file}`, file });
      }
    }
    return guides;
  }

  async bestPractices(module?: string, tier?: string) {
    const selected = module?.toLowerCase();
    const plugins = selected ? [`sap-${selected}`] : (await this.plugins()).map(entry => entry.id);
    const practices: Array<{ module: string; tier?: string; path: string; file: string }> = [];
    for (const plugin of plugins) {
      const base = `plugins/${plugin}/skills/${plugin}/references/best-practices`;
      for (const file of await this.assets.list(base)) {
        if (!file.endsWith(".md") || (tier && !file.toLowerCase().includes(tier.toLowerCase()))) continue;
        practices.push({ module: plugin.slice(4).toUpperCase(), tier, path: `${base}/${file}`, file });
      }
    }
    return practices;
  }

  async all() {
    const [plugins, agents, commands, manifest] = await Promise.all([
      this.plugins(),
      this.agents(),
      this.commands(),
      this.assets.manifest(),
    ]);
    return { version: manifest.productVersion, plugins, agents, commands };
  }
}
