/**
 * Config Types (Browser-safe)
 *
 * Pure type definitions for configuration.
 * Re-exports from @sapstack-desktop/core for compatibility.
 */

// Re-export all config types from core (single source of truth)
export type {
  Workspace,
  McpAuthType,
  AuthType,
  OAuthCredentials,
} from '@sapstack-desktop/core/types';

/** App-level network proxy configuration. */
export interface NetworkProxySettings {
  enabled: boolean;
  httpProxy?: string;
  httpsProxy?: string;
  noProxy?: string;
}
