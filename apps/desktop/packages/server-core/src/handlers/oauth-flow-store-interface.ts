/**
 * IOAuthFlowStore — abstract interface for the pending OAuth flow store.
 *
 * Handlers program against this; concrete implementations satisfy it.
 * See OAuthFlowStore in @sapstack-desktop/shared/auth for the canonical impl.
 */

import type { PendingOAuthFlow } from '@sapstack-desktop/shared/auth'

export interface IOAuthFlowStore {
  store(flow: PendingOAuthFlow): void
  getByState(state: string): PendingOAuthFlow | null
  remove(state: string): void
}
