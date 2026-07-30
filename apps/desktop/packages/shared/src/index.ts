/**
 * @sapstack-desktop/shared
 *
 * Shared business logic for sapstack Desktop.
 * Used by the Electron app.
 *
 * Import specific modules via subpath exports:
 *   import { CraftAgent } from '@sapstack-desktop/shared/agent';
 *   import { loadStoredConfig } from '@sapstack-desktop/shared/config';
 *   import { getCredentialManager } from '@sapstack-desktop/shared/credentials';
 *   import { CraftMcpClient } from '@sapstack-desktop/shared/mcp';
 *   import { debug } from '@sapstack-desktop/shared/utils';
 *   import { loadSource, createSource, getSourceCredentialManager } from '@sapstack-desktop/shared/sources';
 *   import { createWorkspace, loadWorkspace } from '@sapstack-desktop/shared/workspaces';
 *
 * Available modules:
 *   - agent: CraftAgent SDK wrapper, plan tools
 *   - auth: OAuth, token management, auth state
 *   - clients: Craft API client
 *   - config: Storage, models, preferences
 *   - credentials: Encrypted credential storage
 *   - mcp: MCP client, connection validation
 *   - prompts: System prompt generation
 *   - sources: Workspace-scoped source management (MCP, API, local)
 *   - utils: Debug logging, file handling, summarization
 *   - validation: URL validation
 *   - version: Version and installation management
 *   - workspaces: Workspace management (top-level organizational unit)
 */

// Export branding (standalone, no dependencies)
export * from './branding.ts';
