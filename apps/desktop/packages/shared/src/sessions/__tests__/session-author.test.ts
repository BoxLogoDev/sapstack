import { describe, expect, it } from 'bun:test';
import { SESSION_PERSISTENT_FIELDS } from '../types.ts';
import { pickSessionFields } from '../utils.ts';

describe('session persistence: createdBy (Entra sign-in author stamp)', () => {
  it('includes createdBy in SESSION_PERSISTENT_FIELDS', () => {
    expect(SESSION_PERSISTENT_FIELDS).toContain('createdBy');
  });

  it('pickSessionFields preserves createdBy and drops it when undefined', () => {
    const author = { email: 'mikyung.song@lsinjectionusa.com', name: 'Mikyung Song', oid: '00000000-0000-0000-0000-000000000001' };
    const picked = pickSessionFields({ id: 's1', workspaceRootPath: '/tmp/ws', createdAt: 1, lastUsedAt: 2, createdBy: author });
    expect(picked.createdBy).toEqual(author);

    const anonymous = pickSessionFields({ id: 's2', workspaceRootPath: '/tmp/ws', createdAt: 1, lastUsedAt: 2, createdBy: undefined });
    expect('createdBy' in anonymous).toBe(false);
  });
});
