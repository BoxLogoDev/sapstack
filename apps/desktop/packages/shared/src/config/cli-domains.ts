export type CliDomainNamespace = 'label' | 'source' | 'skill' | 'automation' | 'permission' | 'theme'

export interface CliDomainPolicy {
  namespace: CliDomainNamespace
  helpCommand: string
  workspacePathScopes: string[]
  readActions: string[]
  quickExamples: string[]
  /** Optional workspace-relative paths guarded for direct Bash operations */
  bashGuardPaths?: string[]
}

const POLICIES: Record<CliDomainNamespace, CliDomainPolicy> = {
  label: {
    namespace: 'label',
    helpCommand: 'sapstack-desktop label --help',
    workspacePathScopes: ['labels/**'],
    readActions: ['list', 'get', 'auto-rule-list', 'auto-rule-validate'],
    quickExamples: [
      'sapstack-desktop label list',
      'sapstack-desktop label create --name "Bug" --color "accent"',
      'sapstack-desktop label update bug --json \'{"name":"Bug Report"}\'',
    ],
    bashGuardPaths: ['labels/**'],
  },
  source: {
    namespace: 'source',
    helpCommand: 'sapstack-desktop source --help',
    workspacePathScopes: ['sources/**'],
    readActions: ['list', 'get', 'validate', 'test', 'auth-help'],
    quickExamples: [
      'sapstack-desktop source list',
      'sapstack-desktop source get <slug>',
      'sapstack-desktop source update <slug> --json "{...}"',
      'sapstack-desktop source validate <slug>',
    ],
  },
  skill: {
    namespace: 'skill',
    helpCommand: 'sapstack-desktop skill --help',
    workspacePathScopes: ['skills/**'],
    readActions: ['list', 'get', 'validate', 'where'],
    quickExamples: [
      'sapstack-desktop skill list',
      'sapstack-desktop skill get <slug>',
      'sapstack-desktop skill update <slug> --json "{...}"',
      'sapstack-desktop skill validate <slug>',
    ],
  },
  automation: {
    namespace: 'automation',
    helpCommand: 'sapstack-desktop automation --help',
    workspacePathScopes: ['automations.json', 'automations-history.jsonl'],
    readActions: ['list', 'get', 'validate', 'history', 'last-executed', 'test', 'lint'],
    quickExamples: [
      'sapstack-desktop automation list',
      'sapstack-desktop automation create --event UserPromptSubmit --prompt "Summarize this prompt"',
      'sapstack-desktop automation update <id> --json "{\"enabled\":false}"',
      'sapstack-desktop automation history <id> --limit 20',
      'sapstack-desktop automation validate',
    ],
    bashGuardPaths: ['automations.json', 'automations-history.jsonl'],
  },
  permission: {
    namespace: 'permission',
    helpCommand: 'sapstack-desktop permission --help',
    workspacePathScopes: ['permissions.json', 'sources/*/permissions.json'],
    readActions: ['list', 'get', 'validate'],
    quickExamples: [
      'sapstack-desktop permission list',
      'sapstack-desktop permission get --source linear',
      'sapstack-desktop permission add-mcp-pattern "list" --comment "All list ops" --source linear',
      'sapstack-desktop permission validate',
    ],
    bashGuardPaths: ['permissions.json', 'sources/*/permissions.json'],
  },
  theme: {
    namespace: 'theme',
    helpCommand: 'sapstack-desktop theme --help',
    workspacePathScopes: ['config.json', 'theme.json', 'themes/*.json'],
    readActions: ['get', 'validate', 'list-presets', 'get-preset'],
    quickExamples: [
      'sapstack-desktop theme get',
      'sapstack-desktop theme list-presets',
      'sapstack-desktop theme set-color-theme nord',
      'sapstack-desktop theme set-workspace-color-theme default',
      'sapstack-desktop theme set-override --json "{\"accent\":\"#3b82f6\"}"',
    ],
    bashGuardPaths: ['config.json', 'theme.json', 'themes/*.json'],
  },
}

export const CLI_DOMAIN_POLICIES = POLICIES

export interface CliDomainScopeEntry {
  namespace: CliDomainNamespace
  scope: string
}

function dedupeScopes(scopes: string[]): string[] {
  return [...new Set(scopes)]
}

/**
 * Canonical workspace-relative path scopes owned by sapstack-desktop CLI domains.
 * Use these for file-path ownership checks to avoid drift across call sites.
 */
export const SAPSTACK_DESKTOP_AGENTS_CLI_OWNED_WORKSPACE_PATH_SCOPES = dedupeScopes(
  Object.values(POLICIES).flatMap(policy => policy.workspacePathScopes)
)

/**
 * Canonical workspace-relative path scopes guarded for direct Bash operations.
 */
export const SAPSTACK_DESKTOP_AGENTS_CLI_OWNED_BASH_GUARD_PATH_SCOPES = dedupeScopes(
  Object.values(POLICIES).flatMap(policy => policy.bashGuardPaths ?? [])
)

/**
 * Namespace-aware workspace scope entries for sapstack-desktop CLI owned paths.
 */
export const SAPSTACK_DESKTOP_AGENTS_CLI_WORKSPACE_SCOPE_ENTRIES: CliDomainScopeEntry[] = Object.values(POLICIES)
  .flatMap(policy => policy.workspacePathScopes.map(scope => ({ namespace: policy.namespace, scope })))

/**
 * Namespace-aware Bash guard scope entries.
 */
export const SAPSTACK_DESKTOP_AGENTS_CLI_BASH_GUARD_SCOPE_ENTRIES: CliDomainScopeEntry[] = Object.values(POLICIES)
  .flatMap(policy => (policy.bashGuardPaths ?? []).map(scope => ({ namespace: policy.namespace, scope })))

export interface BashPatternRule {
  pattern: string
  comment: string
}

/**
 * Derive the canonical Explore-mode read-only sapstack-desktop bash patterns from
 * CLI domain policies. Keeps permissions regexes aligned with command metadata.
 */
export function getCraftAgentReadOnlyBashPatterns(): BashPatternRule[] {
  const namespaces = Object.keys(POLICIES) as CliDomainNamespace[]
  const namespaceAlternation = namespaces.join('|')

  const rules: BashPatternRule[] = namespaces.map((namespace) => {
    const policy = POLICIES[namespace]
    const actions = policy.readActions.join('|')
    return {
      pattern: `^sapstack-desktop\\s+${namespace}\\s+(${actions})\\b`,
      comment: `sapstack-desktop ${namespace} read-only operations`,
    }
  })

  rules.push(
    { pattern: '^sapstack-desktop\\s*$', comment: 'sapstack-desktop bare invocation (prints help)' },
    { pattern: `^sapstack-desktop\\s+(${namespaceAlternation})\\s*$`, comment: 'sapstack-desktop entity help' },
    { pattern: `^sapstack-desktop\\s+(${namespaceAlternation})\\s+--help\\b`, comment: 'sapstack-desktop entity help flags' },
    { pattern: '^sapstack-desktop\\s+--(help|version|discover)\\b', comment: 'sapstack-desktop global flags' },
  )

  return rules
}

export function getCliDomainPolicy(namespace: CliDomainNamespace): CliDomainPolicy {
  return POLICIES[namespace]
}
