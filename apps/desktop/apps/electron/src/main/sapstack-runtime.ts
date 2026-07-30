import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { ipcMain } from 'electron'
import * as yaml from 'js-yaml'
import {
  FileSystemAssetProvider,
  SapstackRuntime,
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
  getEnvironment: 'sapstack:environment:get',
  saveEnvironment: 'sapstack:environment:save',
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
  ipcMain.handle(SAPSTACK_IPC.startSession, async (_event, input) => (await getRuntime()).sessions.start(input))
  ipcMain.handle(SAPSTACK_IPC.addEvidence, async (_event, input) => (await getRuntime()).sessions.addEvidence(input))
  ipcMain.handle(SAPSTACK_IPC.submitHypotheses, async (_event, input) => (await getRuntime()).sessions.submitHypotheses(input))
  ipcMain.handle(SAPSTACK_IPC.addFollowup, async (_event, input) => (await getRuntime()).sessions.addFollowup(input))
  ipcMain.handle(SAPSTACK_IPC.submitVerdict, async (_event, input) => (await getRuntime()).sessions.submitVerdict(input))
  ipcMain.handle(SAPSTACK_IPC.nextSession, async (_event, input) => (await getRuntime()).sessions.next(input))
  ipcMain.handle(SAPSTACK_IPC.getSession, async (_event, sessionId) => (await getRuntime()).sessions.get(sessionId))
  ipcMain.handle(SAPSTACK_IPC.listSessions, async (_event, filter) => (await getRuntime()).sessions.list(filter))
  ipcMain.handle(SAPSTACK_IPC.scrub, async (_event, text) => (await getRuntime()).security.scrub(text))
  ipcMain.handle(SAPSTACK_IPC.getEnvironment, async () => {
    try {
      return yaml.load(await readFile(environmentProfilePath(), 'utf8'))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw error
    }
  })
  ipcMain.handle(SAPSTACK_IPC.saveEnvironment, async (_event, profile) => saveEnvironmentProfile(profile))
}

function environmentProfilePath(): string {
  return join(process.env.SAPSTACK_WORKSPACE || homedir(), '.sapstack', 'config.yaml')
}

async function saveEnvironmentProfile(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const releases = new Set(['ECC6_EhP7', 'ECC6_EhP8', 'S4_2020', 'S4_2021', 'S4_2022', 'S4_2023', 'S4_2024', 'RISE', 'PublicCloud', 'Unknown'])
  const deployments = new Set(['on_premise', 'private_cloud', 'public_cloud', 'unknown'])
  const languages = new Set(['ko', 'en', 'de', 'ja', 'zh', 'vi', 'id', 'fr', 'es'])
  if (!releases.has(String(input.release))) throw new Error('A supported SAP release is required')
  if (!deployments.has(String(input.deployment))) throw new Error('A supported deployment model is required')
  if (!String(input.industry || '').trim()) throw new Error('Industry is required')
  if (!languages.has(String(input.language || 'ko'))) throw new Error('A supported language is required')

  const profile = {
    profile_version: 1,
    release: input.release,
    deployment: input.deployment,
    industry: String(input.industry).trim(),
    language: input.language || 'ko',
    ...(input.country_iso ? { country_iso: String(input.country_iso).toLowerCase() } : {}),
    ...(input.client ? { client: String(input.client) } : {}),
  }
  const target = environmentProfilePath()
  await mkdir(dirname(target), { recursive: true })
  const temporary = `${target}.${process.pid}.tmp`
  await writeFile(temporary, yaml.dump(profile, { lineWidth: -1, noRefs: true }), 'utf8')
  await rename(temporary, target)
  return profile
}
