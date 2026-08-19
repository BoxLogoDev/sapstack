import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import * as yaml from 'js-yaml'
import {
  FileSystemAssetProvider,
  SapstackRuntime,
  buildSupportBundle,
} from '../../../../../../packages/runtime/src/index.js'

export const SAPSTACK_IPC = {
  catalog: 'sapstack:catalog',
  resolveSymptom: 'sapstack:knowledge:resolveSymptom',
  checkTcode: 'sapstack:knowledge:checkTcode',
  resolveSapNote: 'sapstack:knowledge:resolveSapNote',
  lookupSynonym: 'sapstack:knowledge:lookupSynonym',
  getPrompt: 'sapstack:knowledge:getPrompt',
  startSession: 'sapstack:sessions:start',
  addEvidence: 'sapstack:sessions:addEvidence',
  submitHypotheses: 'sapstack:sessions:submitHypotheses',
  addFollowup: 'sapstack:sessions:addFollowup',
  submitVerdict: 'sapstack:sessions:submitVerdict',
  nextSession: 'sapstack:sessions:next',
  getSession: 'sapstack:sessions:get',
  listSessions: 'sapstack:sessions:list',
  scrub: 'sapstack:security:scrub',
  inspectLearning: 'sapstack:learning:inspect',
  getEnvironment: 'sapstack:environment:get',
  saveEnvironment: 'sapstack:environment:save',
  exportSupportBundle: 'sapstack:support:export',
} as const

let runtimePromise: Promise<SapstackRuntime> | undefined

function getRuntime(): Promise<SapstackRuntime> {
  if (!runtimePromise) {
    const workspaceRoot = process.env.SAPSTACK_WORKSPACE || homedir()
    runtimePromise = SapstackRuntime.create({
      assets: new FileSystemAssetProvider(join(__dirname, 'resources', 'sapstack')),
      workspaceRoot,
      sessionsDir: process.env.SAPSTACK_SESSIONS_DIR || join(workspaceRoot, '.sapstack', 'sessions'),
    })
  }
  return runtimePromise
}

export function registerSapstackRuntimeHandlers(): void {
  ipcMain.handle(SAPSTACK_IPC.catalog, async () => {
    const runtime = await getRuntime()
    const [manifest, plugins, agents, commands, imgGuides, bestPractices] = await Promise.all([
      runtime.assets.manifest(),
      runtime.catalog.plugins(),
      runtime.catalog.agents(),
      runtime.catalog.commands(),
      runtime.catalog.imgGuides(),
      runtime.catalog.bestPractices(),
    ])
    return { manifest, plugins, agents, commands, imgGuides, bestPractices }
  })
  ipcMain.handle(SAPSTACK_IPC.resolveSymptom, async (_event, args) => (await getRuntime()).knowledge.resolveSymptom(args))
  ipcMain.handle(SAPSTACK_IPC.checkTcode, async (_event, tcode) => (await getRuntime()).knowledge.checkTcode(tcode))
  ipcMain.handle(SAPSTACK_IPC.resolveSapNote, async (_event, keyword) => (await getRuntime()).knowledge.resolveSapNote(keyword))
  ipcMain.handle(SAPSTACK_IPC.lookupSynonym, async (_event, term) => (await getRuntime()).knowledge.lookupSynonym(term))
  ipcMain.handle(SAPSTACK_IPC.getPrompt, async (_event, name, args) => (await getRuntime()).knowledge.getPrompt(name, args))
  ipcMain.handle(SAPSTACK_IPC.startSession, async (_event, input) => (await getRuntime()).sessions.start(desktopSessionInput(input)))
  ipcMain.handle(SAPSTACK_IPC.addEvidence, async (_event, input) => (await getRuntime()).sessions.addEvidence(desktopSessionInput(input)))
  ipcMain.handle(SAPSTACK_IPC.submitHypotheses, async (_event, input) => (await getRuntime()).sessions.submitHypotheses(desktopSessionInput(input)))
  ipcMain.handle(SAPSTACK_IPC.addFollowup, async (_event, input) => (await getRuntime()).sessions.addFollowup(desktopSessionInput(input)))
  ipcMain.handle(SAPSTACK_IPC.submitVerdict, async (_event, input) => (await getRuntime()).sessions.submitVerdict(desktopSessionInput(input)))
  ipcMain.handle(SAPSTACK_IPC.nextSession, async (_event, input) => (await getRuntime()).sessions.next(desktopSessionInput(input)))
  ipcMain.handle(SAPSTACK_IPC.getSession, async (_event, sessionId) => (await getRuntime()).sessions.get(sessionId))
  ipcMain.handle(SAPSTACK_IPC.listSessions, async (_event, filter) => (await getRuntime()).sessions.list(filter))
  ipcMain.handle(SAPSTACK_IPC.scrub, async (_event, text) => (await getRuntime()).security.scrub(text))
  ipcMain.handle(SAPSTACK_IPC.inspectLearning, async () => (await getRuntime()).learning.inspect())
  ipcMain.handle(SAPSTACK_IPC.getEnvironment, async () => readEnvironmentProfile())
  ipcMain.handle(SAPSTACK_IPC.saveEnvironment, async (_event, profile) => saveEnvironmentProfile(profile))
  ipcMain.handle(SAPSTACK_IPC.exportSupportBundle, async (event) => {
    const runtime = await getRuntime()
    const bundle = buildSupportBundle({
      appVersion: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      runtime: await runtime.assets.manifest(),
      environment: await readEnvironmentProfile(),
    })
    const options = {
      title: 'sapstack support bundle 저장',
      defaultPath: `sapstack-support-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    }
    const owner = BrowserWindow.fromWebContents(event.sender)
    const result = owner ? await dialog.showSaveDialog(owner, options) : await dialog.showSaveDialog(options)
    if (result.canceled || !result.filePath) return { saved: false }
    await writeFile(result.filePath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8')
    return { saved: true }
  })
}

function desktopSessionInput(input: any): any {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Session input must be an object')
  return { ...input, surface: 'desktop' }
}

function environmentProfilePath(): string {
  return join(process.env.SAPSTACK_WORKSPACE || homedir(), '.sapstack', 'config.yaml')
}

async function readEnvironmentProfile(): Promise<unknown> {
  try {
    return yaml.load(await readFile(environmentProfilePath(), 'utf8'))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

async function saveEnvironmentProfile(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const releases = new Set(['ECC6_EhP7', 'ECC6_EhP8', 'S4_2020', 'S4_2021', 'S4_2022', 'S4_2023', 'S4_2024', 'RISE', 'PublicCloud', 'Unknown'])
  const deployments = new Set(['on_premise', 'private_cloud', 'public_cloud', 'unknown'])
  const languages = new Set(['ko', 'en', 'de', 'ja', 'zh', 'vi', 'id', 'fr', 'es'])
  if (!releases.has(String(input.release))) throw new Error('A supported SAP release is required')
  if (!deployments.has(String(input.deployment))) throw new Error('A supported deployment model is required')
  if (!String(input.industry || '').trim()) throw new Error('Industry is required')
  if (!languages.has(String(input.language || 'ko'))) throw new Error('A supported language is required')

  // 선택 키는 기존 profile 을 베이스로 보존한다. SapEnvironmentStep 은 4개 필수
  // 필드만 보내므로, profile 을 처음부터 재작성하면 수동으로 켠 air_gapped 나
  // country_iso/client 가 환경 재설정 한 번에 소실된다. input 에 명시된 값이 우선.
  const existing = ((await readEnvironmentProfile().catch(() => null)) ?? {}) as Record<string, unknown>
  const countryIso = input.country_iso ?? existing.country_iso
  const client = input.client ?? existing.client
  const airGapped = input.air_gapped ?? existing.air_gapped

  const profile = {
    profile_version: 1,
    release: input.release,
    deployment: input.deployment,
    industry: String(input.industry).trim(),
    language: input.language || 'ko',
    ...(countryIso ? { country_iso: String(countryIso).toLowerCase() } : {}),
    ...(client ? { client: String(client) } : {}),
    // 폐쇄망 모드. main/airgap.ts 가 부팅 시 이 키를 동기로 읽어 크래시 리포팅과
    // 업데이트 폴링을 끈다. 적용하려면 재시작이 필요하다.
    ...(airGapped === true ? { air_gapped: true } : {}),
  }
  const target = environmentProfilePath()
  await mkdir(dirname(target), { recursive: true })
  const temporary = `${target}.${process.pid}.tmp`
  await writeFile(temporary, yaml.dump(profile, { lineWidth: -1, noRefs: true }), 'utf8')
  await rename(temporary, target)
  return profile
}
