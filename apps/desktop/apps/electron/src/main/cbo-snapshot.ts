/**
 * CBO 스냅샷 — 탐지·임포트·소스 자동 등록·IPC
 *
 * 스냅샷(커스텀 ABAP 소스의 오프라인 사본, 폴더 계약: bridge/abapgit-pattern.md)을
 * ① 기동 시 ~/.sapstack/cbo/{SID}/ 와 포터블 exe 인접 ./cbo/{SID}/ 에서 찾고
 * ② 인접본은 ~/.sapstack/cbo 로 1회 임포트(더 새 것이면 교체)하며
 * ③ 각 워크스페이스에 type:'local' 소스(provider: 'cbo-snapshot')로 등록한다.
 *    로컬 소스는 MCP 서버가 없다 — 에이전트는 내장 Read/Glob/Grep 을 쓰고,
 *    사용 규칙은 스냅샷이 동봉한 guide.md 가 그대로 소스 guide 가 된다.
 *
 * 슬러그는 sap-connector-policy 의 이름 정규식(sap|abap|adt…)을 피해서
 * 'cbo-snapshot' 계열을 쓴다 (로컬 소스라 정책 대상은 아니지만 미래 여지 보존).
 */

import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { ipcMain } from 'electron'
import * as yaml from 'js-yaml'
import {
  createSource,
  loadWorkspaceSources,
  saveSourceConfig,
  saveSourceGuide,
} from '@sapstack-desktop/shared/sources/storage'
import { getWorkspaces } from '@sapstack-desktop/shared/config/storage'

export const CBO_IPC = {
  status: 'sapstack:cbo:status',
  register: 'sapstack:cbo:register',
} as const

const CBO_PROVIDER = 'cbo-snapshot'

export interface CboSnapshotInfo {
  sid: string
  client: string
  exportedAt: string
  status: string
  objectCount: number
  packageCount: number
  stalenessWarnDays: number
  staleDays: number
  path: string
  registeredWorkspaces: string[]
  /** 등록된 로컬 소스 슬러그 — golden path 의 [source:] 멘션용 */
  sourceSlug: string | null
}

function cboRoot(): string {
  return join(process.env.SAPSTACK_WORKSPACE || homedir(), '.sapstack', 'cbo')
}

/** 포터블 배포에서 exe 옆의 cbo/ (electron-builder portable 이 원 위치를 env 로 준다) */
function portableAdjacentRoot(): string | null {
  const base = process.env.PORTABLE_EXECUTABLE_DIR || dirname(process.execPath)
  const candidate = join(base, 'cbo')
  return existsSync(candidate) ? candidate : null
}

interface ParsedManifest {
  sid: string
  client: string
  exported_at: string
  status: string
  totals?: { files_written?: number }
  packages?: unknown[]
  freshness?: { staleness_warn_days?: number }
}

function readManifest(snapshotDir: string): ParsedManifest | null {
  const p = join(snapshotDir, 'manifest.yaml')
  if (!existsSync(p)) return null
  try {
    const doc = yaml.load(readFileSync(p, 'utf8')) as ParsedManifest
    return doc && doc.sid ? doc : null
  } catch {
    return null
  }
}

function listSnapshots(root: string): Array<{ sid: string; dir: string; manifest: ParsedManifest }> {
  if (!existsSync(root)) return []
  const out: Array<{ sid: string; dir: string; manifest: ParsedManifest }> = []
  for (const entry of readdirSync(root)) {
    const dir = join(root, entry)
    try {
      if (!statSync(dir).isDirectory()) continue
    } catch {
      continue
    }
    const manifest = readManifest(dir)
    if (manifest) out.push({ sid: manifest.sid, dir, manifest })
  }
  return out
}

/** 포터블 인접 스냅샷을 ~/.sapstack/cbo 로 임포트 (없거나 더 새 것일 때) */
function importAdjacentSnapshots(): void {
  const adjacent = portableAdjacentRoot()
  if (!adjacent) return
  for (const snap of listSnapshots(adjacent)) {
    const target = join(cboRoot(), snap.sid)
    const existing = readManifest(target)
    const newer = !existing || String(snap.manifest.exported_at) > String(existing.exported_at)
    if (!newer) continue
    try {
      if (existsSync(target)) rmSync(target, { recursive: true, force: true })
      mkdirSync(dirname(target), { recursive: true })
      cpSync(snap.dir, target, { recursive: true })
      console.log(`[cbo] 인접 스냅샷 임포트: ${snap.sid} (${snap.manifest.exported_at})`)
    } catch (err) {
      console.error(`[cbo] 인접 스냅샷 임포트 실패 (${snap.sid}):`, err)
    }
  }
}

function taglineFor(m: ParsedManifest): string {
  const date = String(m.exported_at).slice(0, 10)
  return `커스텀 ABAP 스냅샷 (${m.sid}/${m.client}, ${date} 기준)`
}

/** 워크스페이스마다 스냅샷 소스 등록/동기화 — 멱등. 등록된 슬러그를 반환 */
async function registerForWorkspace(workspaceRootPath: string, sid: string, dir: string, m: ParsedManifest): Promise<string> {
  const sources = loadWorkspaceSources(workspaceRootPath)
  const existing = sources.find(
    (s) => s.config.provider === CBO_PROVIDER && (s.config.local?.path || '').replace(/[\\/]+$/, '').toUpperCase().endsWith(sid.toUpperCase()),
  )

  const guidePath = join(dir, 'guide.md')
  const guideRaw = existsSync(guidePath)
    ? readFileSync(guidePath, 'utf8')
    : `# CBO 스냅샷 (${sid})\n\n${taglineFor(m)}. catalog.md 에서 오브젝트를 먼저 찾은 뒤 Read 하세요.\n`

  if (!existing) {
    // 이름은 ASCII 유지 — 슬러그가 'cbo-snapshot-{sid}' 로 안정되게 (한글은 tagline 이 담당)
    const config = await createSource(workspaceRootPath, {
      name: `CBO Snapshot ${sid}`,
      provider: CBO_PROVIDER,
      type: 'local',
      local: { path: dir, format: 'filesystem' },
      icon: '🗂️',
    })
    config.tagline = taglineFor(m)
    saveSourceConfig(workspaceRootPath, config)
    saveSourceGuide(workspaceRootPath, config.slug, { raw: guideRaw })
    console.log(`[cbo] 소스 등록: ${config.slug} → ${dir}`)
    return config.slug
  }

  // 재동기화: 기준일이 바뀌었을 때만 tagline/guide 갱신
  if (existing.config.tagline !== taglineFor(m)) {
    existing.config.tagline = taglineFor(m)
    existing.config.local = { path: dir, format: 'filesystem' }
    existing.config.updatedAt = Date.now()
    saveSourceConfig(workspaceRootPath, existing.config)
    saveSourceGuide(workspaceRootPath, existing.config.slug, { raw: guideRaw })
    console.log(`[cbo] 소스 재동기화: ${existing.config.slug} (${m.exported_at})`)
  }
  return existing.config.slug
}

async function ensureCboSourcesRegistered(): Promise<CboSnapshotInfo[]> {
  importAdjacentSnapshots()
  const snapshots = listSnapshots(cboRoot())
  const workspaces = getWorkspaces()
  const infos: CboSnapshotInfo[] = []

  for (const snap of snapshots) {
    const registered: string[] = []
    let sourceSlug: string | null = null
    for (const ws of workspaces) {
      try {
        sourceSlug = await registerForWorkspace(ws.rootPath, snap.sid, snap.dir, snap.manifest)
        registered.push(ws.name || ws.rootPath)
      } catch (err) {
        console.error(`[cbo] 등록 실패 (${ws.rootPath}):`, err)
      }
    }
    const m = snap.manifest
    const exportedMs = Date.parse(String(m.exported_at)) || 0
    infos.push({
      sid: snap.sid,
      client: String(m.client ?? '?'),
      exportedAt: String(m.exported_at ?? ''),
      status: String(m.status ?? 'unknown'),
      objectCount: Number(m.totals?.files_written ?? 0),
      packageCount: Array.isArray(m.packages) ? m.packages.length : 0,
      stalenessWarnDays: Number(m.freshness?.staleness_warn_days ?? 30),
      staleDays: exportedMs ? Math.floor((Date.now() - exportedMs) / 86_400_000) : -1,
      path: snap.dir,
      registeredWorkspaces: registered,
      sourceSlug,
    })
  }
  return infos
}

export function registerCboSnapshotHandlers(): void {
  ipcMain.handle(CBO_IPC.status, async () => ensureCboSourcesRegistered())
  ipcMain.handle(CBO_IPC.register, async () => ensureCboSourcesRegistered())

  // 기동 시 1회 — 실패해도 앱 기동을 막지 않는다
  ensureCboSourcesRegistered().catch((err) => console.error('[cbo] 초기 등록 실패:', err))
}
