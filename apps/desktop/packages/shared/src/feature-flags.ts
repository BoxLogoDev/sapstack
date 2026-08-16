/**
 * Feature flags for controlling experimental or in-development features.
 */

/** Safe accessor for process.env — returns undefined in browser/renderer contexts. */
function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) return process.env[key];
  return undefined;
}

function parseBooleanEnv(value: string | undefined): boolean | undefined {
  if (value == null) return undefined;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return undefined;
}

/**
 * Shared runtime detector for development/debug environments.
 *
 * Use this instead of app-specific debug flags (e.g., Electron main isDebugMode)
 * so behavior stays consistent across shared code and subprocess backends.
 */
export function isDevRuntime(): boolean {
  const nodeEnv = (getEnv('NODE_ENV') || '').toLowerCase();
  return nodeEnv === 'development' || nodeEnv === 'dev' || getEnv('SAPSTACK_DESKTOP_DEBUG') === '1';
}

/**
 * Runtime-evaluated check for developer feedback feature.
 * Explicit env override has precedence over dev-runtime defaults.
 */
export function isDeveloperFeedbackEnabled(): boolean {
  const override = parseBooleanEnv(getEnv('SAPSTACK_DESKTOP_FEATURE_DEVELOPER_FEEDBACK'));
  if (override !== undefined) return override;
  return isDevRuntime();
}

/**
 * Runtime-evaluated check for sapstack-desktops-cli integration.
 *
 * Defaults to disabled. Override with SAPSTACK_DESKTOP_FEATURE_SAPSTACK_DESKTOP_AGENTS_CLI=1|0.
 */
export function isCraftAgentsCliEnabled(): boolean {
  const override = parseBooleanEnv(getEnv('SAPSTACK_DESKTOP_FEATURE_SAPSTACK_DESKTOP_AGENTS_CLI'));
  if (override !== undefined) return override;
  return false;
}

/**
 * Runtime-evaluated check for embedded server settings page.
 *
 * Defaults to disabled. Override with SAPSTACK_DESKTOP_FEATURE_EMBEDDED_SERVER=1|0.
 */
export function isEmbeddedServerEnabled(): boolean {
  const override = parseBooleanEnv(getEnv('SAPSTACK_DESKTOP_FEATURE_EMBEDDED_SERVER'));
  if (override !== undefined) return override;
  return false;
}

/**
 * Runtime-evaluated check for platform messaging (WhatsApp / Telegram / Lark).
 *
 * sapstack Desktop ships to SAP operations teams, often in air-gapped networks.
 * Messaging gateways are inherited from upstream, add outbound network surface
 * that security reviews must account for, and are useless without internet —
 * so they default to disabled. Override with SAPSTACK_DESKTOP_FEATURE_MESSAGING=1|0.
 */
export function isMessagingEnabled(): boolean {
  const override = parseBooleanEnv(getEnv('SAPSTACK_DESKTOP_FEATURE_MESSAGING'));
  if (override !== undefined) return override;
  return false;
}

/**
 * Runtime-evaluated check for the browser automation tool.
 *
 * Same rationale as messaging: upstream-inherited, unrelated to SAP diagnosis,
 * and inert in air-gapped deployments. Defaults to disabled.
 * Override with SAPSTACK_DESKTOP_FEATURE_BROWSER_TOOL=1|0.
 */
export function isBrowserToolEnabled(): boolean {
  const override = parseBooleanEnv(getEnv('SAPSTACK_DESKTOP_FEATURE_BROWSER_TOOL'));
  if (override !== undefined) return override;
  return false;
}

export const FEATURE_FLAGS = {
  /** Enable Opus 4.7 fast mode (speed:"fast" + beta header). 6x pricing. */
  fastMode: false,
  /**
   * Enable agent developer feedback tool.
   *
   * Defaults to enabled in explicit development runtimes; disabled otherwise.
   * Override with SAPSTACK_DESKTOP_FEATURE_DEVELOPER_FEEDBACK=1|0.
   */
  get developerFeedback(): boolean {
    return isDeveloperFeedbackEnabled();
  },
  /**
   * Enable sapstack-desktop CLI guidance and guardrails.
   *
   * Defaults to disabled. Override with SAPSTACK_DESKTOP_FEATURE_SAPSTACK_DESKTOP_AGENTS_CLI=1|0.
   */
  get craftAgentsCli(): boolean {
    return isCraftAgentsCliEnabled();
  },
  /**
   * Enable embedded server settings page.
   *
   * Defaults to disabled. Override with SAPSTACK_DESKTOP_FEATURE_EMBEDDED_SERVER=1|0.
   */
  get embeddedServer(): boolean {
    return isEmbeddedServerEnabled();
  },
  /**
   * Enable platform messaging (WhatsApp / Telegram / Lark).
   *
   * Defaults to disabled for SAP operations deployments.
   * Override with SAPSTACK_DESKTOP_FEATURE_MESSAGING=1|0.
   */
  get messaging(): boolean {
    return isMessagingEnabled();
  },
  /**
   * Enable the browser automation tool.
   *
   * Defaults to disabled. Override with SAPSTACK_DESKTOP_FEATURE_BROWSER_TOOL=1|0.
   */
  get browserTool(): boolean {
    return isBrowserToolEnabled();
  },
} as const;
