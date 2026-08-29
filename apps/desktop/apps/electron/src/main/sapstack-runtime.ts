import { homedir } from 'node:os'
import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import {
  FileSystemAssetProvider,
  SapstackRuntime,
  buildSupportBundle,
} from '../../../../../../packages/runtime/src/index.js'
import { getSapConnection, probeSapConnection, saveSapConnection } from './sap-connection'
import { readEnvironmentProfile, saveEnvironmentProfile } from './environment-profile'

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
  getSapConnection: 'sapstack:connection:get',
  saveSapConnection: 'sapstack:connection:save',
  probeSapConnection: 'sapstack:connection:probe',
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
  ipcMain.handle(SAPSTACK_IPC.getEnvironment, async () => {
    // 프로비저닝이 ui_mode/cbo 만 시딩한 부분 config.yaml 은 프로파일이 아니다 —
    // release 가 없으면 null 을 돌려 SapEnvironmentStep 게이트가 유지되게 한다.
    const profile = (await readEnvironmentProfile()) as Record<string, unknown> | null
    return profile && profile.release ? profile : null
  })
  ipcMain.handle(SAPSTACK_IPC.saveEnvironment, async (_event, profile) => saveEnvironmentProfile(profile))
  ipcMain.handle(SAPSTACK_IPC.getSapConnection, async () => getSapConnection())
  ipcMain.handle(SAPSTACK_IPC.saveSapConnection, async (_event, input) => saveSapConnection(input))
  ipcMain.handle(SAPSTACK_IPC.probeSapConnection, async (_event, input) => probeSapConnection(input))
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

// 환경 프로파일 읽기·저장은 ./environment-profile 로 이동 (provisioning.ts 와 공유,
// electron 무의존이라 bun test 가능).
