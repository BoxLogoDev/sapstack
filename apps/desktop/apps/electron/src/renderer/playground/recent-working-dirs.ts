export type RecentDirScenario = 'none' | 'few' | 'many'

const RECENT_DIR_SCENARIO_DATA: Record<RecentDirScenario, string[]> = {
  none: [],
  few: [
    '/Users/demo/projects/sapstack-desktop',
    '/Users/demo/projects/sapstack-desktop/apps/electron',
    '/Users/demo/projects/sapstack-desktop/packages/shared',
  ],
  many: [
    '/Users/demo/projects/sapstack-desktop',
    '/Users/demo/projects/sapstack-desktop/apps/electron',
    '/Users/demo/projects/sapstack-desktop/apps/viewer',
    '/Users/demo/projects/sapstack-desktop/apps/cli',
    '/Users/demo/projects/sapstack-desktop/packages/shared',
    '/Users/demo/projects/sapstack-desktop/packages/server-core',
    '/Users/demo/projects/sapstack-desktop/packages/pi-agent-server',
    '/Users/demo/projects/sapstack-desktop/packages/ui',
    '/Users/demo/projects/sapstack-desktop/scripts',
  ],
}

/** Return a copy of the fixture list for the selected scenario. */
export function getRecentDirsForScenario(scenario: RecentDirScenario): string[] {
  return [...RECENT_DIR_SCENARIO_DATA[scenario]]
}
