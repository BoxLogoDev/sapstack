/**
 * Hermetic config-dir pin for refresh-connection-runtime.test.ts.
 *
 * MUST stay the FIRST import of the test file. `CONFIG_DIR` in
 * `@sapstack-desktop/shared/config/paths.ts` is captured from
 * SAPSTACK_DESKTOP_CONFIG_DIR at module-import time, and ESM evaluates imports
 * in source order — so this module's side effect runs before SessionManager's
 * transitive storage import, pinning config resolution to a temp fixture.
 *
 * Why: the test previously resolved `slug-A` against the developer's real
 * ~/.sapstack-desktop config. It passed on machines that happened to have LLM
 * connections configured and failed on CI and clean checkouts (payload had no
 * `model`/`runtime` because no connection resolved). A test guarding the
 * supportsImages IPC invariant must not depend on host state.
 */
import { mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const dir = mkdtempSync(join(tmpdir(), 'sapstack-refresh-config-'))
process.env.SAPSTACK_DESKTOP_CONFIG_DIR = dir

// Minimal pi_compat connection with per-model supportsImages — the exact shape
// the IPC payload test asserts end-to-end (string entry included to cover the
// plain-id branch of the customModels mapping).
//
// `workspaces` must be a non-empty array: loadStoredConfig() rejects the whole
// config (returns null) when it is missing, which silently empties
// llmConnections too.
writeFileSync(
  join(dir, 'config.json'),
  JSON.stringify(
    {
      workspaces: [
        { id: 'ws_fixture', name: 'Fixture', rootPath: join(dir, 'workspace'), createdAt: 0 },
      ],
      activeWorkspaceId: 'ws_fixture',
      llmConnections: [
        {
          slug: 'slug-A',
          name: 'Hermetic Custom Endpoint',
          providerType: 'pi_compat',
          authType: 'none',
          baseUrl: 'http://localhost:11434/v1',
          customEndpoint: { api: 'openai-completions' },
          models: [
            { id: 'qwen3-coder', supportsImages: true, contextWindow: 32768 },
            'plain-model',
          ],
          defaultModel: 'qwen3-coder',
        },
      ],
    },
    null,
    2,
  ),
)
