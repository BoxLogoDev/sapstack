import * as path from "node:path";
import { createDefaultAssetProvider, type AssetProvider, type DefaultAssetProviderOptions } from "./assets.js";
import { CatalogService } from "./catalog.js";
import { KnowledgeService } from "./knowledge.js";
import { FileSessionStore, SessionService, type SessionStore } from "./sessions.js";
import { SecurityService } from "./security.js";

export * from "./assets.js";
export * from "./catalog.js";
export * from "./knowledge.js";
export * from "./sessions.js";
export * from "./security.js";
export * from "./support.js";

export interface SapstackRuntimeOptions extends DefaultAssetProviderOptions {
  assets?: AssetProvider;
  sessionStore?: SessionStore;
  sessionsDir?: string;
  workspaceRoot?: string;
}

export class SapstackRuntime {
  readonly assets: AssetProvider;
  readonly catalog: CatalogService;
  readonly knowledge: KnowledgeService;
  readonly sessions: SessionService;
  readonly security: SecurityService;

  private constructor(assets: AssetProvider, store: SessionStore, security: SecurityService) {
    this.assets = assets;
    this.security = security;
    this.catalog = new CatalogService(assets);
    this.knowledge = new KnowledgeService(assets, this.catalog);
    this.sessions = new SessionService(assets, store, security);
  }

  static async create(options: SapstackRuntimeOptions = {}): Promise<SapstackRuntime> {
    const assets = options.assets || await createDefaultAssetProvider(options);
    const security = new SecurityService();
    const workspace = path.resolve(options.workspaceRoot || process.env.SAPSTACK_WORKSPACE || process.cwd());
    const sessionsDir = path.resolve(options.sessionsDir || process.env.SAPSTACK_SESSIONS_DIR || path.join(workspace, ".sapstack", "sessions"));
    const store = options.sessionStore || new FileSessionStore(sessionsDir, security);
    return new SapstackRuntime(assets, store, security);
  }
}
