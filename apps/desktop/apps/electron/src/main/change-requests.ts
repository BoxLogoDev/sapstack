/**
 * change-requests — 변경 요청서를 LS ITC Azure DevOps Boards 에 요청자 본인 토큰으로 생성한다.
 *
 * renderer 가 초안·설명(Markdown)·전문(옵션)을 보내면 ① 로컬 큐 파일을 먼저 쓰고 ② 로그인
 * 리프레시 토큰으로 DevOps 토큰을 받아 ③ (첨부 →) 작업 항목을 만들고 ④ 결과를 큐에 남긴다.
 * 실패한 초안은 설정 › 변경 요청에서 재시도/폐기한다. 백엔드 서버 없음.
 *
 * 폐쇄망·미로그인·설정 없음이면 status 가 사유를 돌려주고 UI 는 버튼을 숨긴다.
 * 큐·REST 는 change-requests-client.ts(electron 무의존, 테스트 대상), 여기는 electron 배선.
 */

import { ipcMain } from 'electron'
import {
  ADO_SCOPE,
  boardUrl,
  parseChangeRequestsConfig,
  type ChangeRequestItem,
  type ChangeRequestsConfig,
  type ChangeRequestsStatus,
  type ChangeRequestSubmitInput,
  type QueuedChangeRequest,
} from '../shared/change-requests-core'
import { discardRecord, listMyWorkItems, newRecord, readQueue, submitRecord, type SubmitDeps } from './change-requests-client'
import { readEnvironmentProfile } from './environment-profile'
import { getAccessToken, getSignedInIdentity } from './identity'
import { isAirGapped } from './airgap'

export const CR_IPC = {
  status: 'sapstack:changeRequests:status',
  submit: 'sapstack:changeRequests:submit',
  listMine: 'sapstack:changeRequests:listMine',
  queue: 'sapstack:changeRequests:queue',
  retry: 'sapstack:changeRequests:retry',
  discard: 'sapstack:changeRequests:discard',
} as const

export async function loadChangeRequestsConfig(): Promise<{ config: ChangeRequestsConfig | null; error?: string }> {
  const profile = (await readEnvironmentProfile().catch(() => null)) as Record<string, unknown> | null
  try {
    return { config: parseChangeRequestsConfig(profile?.change_requests) }
  } catch (err) {
    return { config: null, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function getChangeRequestsStatus(): Promise<ChangeRequestsStatus> {
  const { config, error } = await loadChangeRequestsConfig()
  if (error) return { enabled: false, reason: 'misconfigured', detail: error }
  if (!config) return { enabled: false, reason: 'not_configured' }
  const base = { orgUrl: config.orgUrl, project: config.project, boardUrl: boardUrl(config) }
  if (isAirGapped()) return { enabled: false, reason: 'air_gapped', ...base }
  if (!(await getSignedInIdentity())) return { enabled: false, reason: 'not_signed_in', ...base }
  return { enabled: true, ...base }
}

async function submitDeps(): Promise<SubmitDeps> {
  const { config, error } = await loadChangeRequestsConfig()
  return { fetch, getToken: () => getAccessToken([ADO_SCOPE]), config, ...(error ? { configError: error } : {}) }
}

export async function submitChangeRequest(input: ChangeRequestSubmitInput): Promise<QueuedChangeRequest> {
  return submitRecord(newRecord(input), await submitDeps())
}

export async function retryChangeRequest(id: string): Promise<QueuedChangeRequest | null> {
  const rec = readQueue().find((r) => r.id === id)
  return rec ? submitRecord(rec, await submitDeps()) : null
}

export async function listMyChangeRequests(): Promise<ChangeRequestItem[]> {
  const { config } = await loadChangeRequestsConfig()
  if (!config) return []
  const token = await getAccessToken([ADO_SCOPE])
  if (!token) throw new Error('Sign in with your Microsoft account first')
  return listMyWorkItems({ fetch, token, config })
}

export function registerChangeRequestHandlers(): void {
  ipcMain.handle(CR_IPC.status, async () => getChangeRequestsStatus())
  ipcMain.handle(CR_IPC.submit, async (_e, input: ChangeRequestSubmitInput) => submitChangeRequest(input))
  ipcMain.handle(CR_IPC.listMine, async () => listMyChangeRequests())
  ipcMain.handle(CR_IPC.queue, async () => readQueue())
  ipcMain.handle(CR_IPC.retry, async (_e, id: string) => retryChangeRequest(id))
  ipcMain.handle(CR_IPC.discard, async (_e, id: string) => discardRecord(id))
}
