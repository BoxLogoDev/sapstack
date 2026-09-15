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

import { homedir, tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { BrowserWindow, dialog, ipcMain, type IpcMainInvokeEvent } from 'electron'
import * as yaml from 'js-yaml'
import { unzipSync } from 'fflate'
import {
  createSource,
  loadWorkspaceSources,
  saveSourceConfig,
  saveSourceGuide,
} from '@sapstack-desktop/shared/sources/storage'
import { getWorkspaces } from '@sapstack-desktop/shared/config/storage'
import { getPersistedUiLanguage } from '@sapstack-desktop/shared/config/preferences'
import { environmentProfilePath } from './environment-profile'

export const CBO_IPC = {
  status: 'sapstack:cbo:status',
  register: 'sapstack:cbo:register',
  importZip: 'sapstack:cbo:importZip',
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

/** exported_at 비교 — ISO 파싱 우선, 실패 시 문자열 비교 폴백 */
function isNewer(candidate: string, existing: string): boolean {
  const [tc, te] = [Date.parse(String(candidate)), Date.parse(String(existing))]
  if (Number.isFinite(tc) && Number.isFinite(te)) return tc > te
  return String(candidate) > String(existing)
}

/**
 * manifest.yaml 탐색으로 스냅샷 루트 식별 — 디렉터리 깊이를 가정하지 않는다.
 * (Compress-Archive 는 cbo/{SID}/ 프리픽스를 만들고, ZIP 은 임의 구조일 수 있다)
 */
function findSnapshotDirs(root: string, maxDepth = 3): Array<{ sid: string; dir: string; manifest: ParsedManifest }> {
  const out: Array<{ sid: string; dir: string; manifest: ParsedManifest }> = []
  const walk = (dir: string, depth: number): void => {
    const manifest = readManifest(dir)
    if (manifest) {
      out.push({ sid: manifest.sid, dir, manifest })
      return // 스냅샷 안쪽으로는 더 내려가지 않는다
    }
    if (depth >= maxDepth) return
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry === '.git') continue
      const child = join(dir, entry)
      try {
        if (statSync(child).isDirectory()) walk(child, depth + 1)
      } catch {
        /* 접근 불가 항목 무시 */
      }
    }
  }
  walk(root, 0)
  return out
}

/**
 * 임의 위치(sourceRoot)의 스냅샷들을 ~/.sapstack/cbo 로 임포트 — 없거나 더 새 것일 때.
 * 인접 폴더·공유폴더·ZIP 추출 임시 폴더가 전부 이 경로를 탄다. 임포트된 SID 목록 반환.
 */
function importSnapshotsFrom(sourceRoot: string, origin: string): string[] {
  const imported: string[] = []
  if (!existsSync(sourceRoot)) return imported
  for (const snap of findSnapshotDirs(sourceRoot)) {
    const target = join(cboRoot(), snap.sid)
    const existing = readManifest(target)
    if (existing && !isNewer(String(snap.manifest.exported_at), String(existing.exported_at))) continue
    try {
      if (existsSync(target)) rmSync(target, { recursive: true, force: true })
      mkdirSync(dirname(target), { recursive: true })
      cpSync(snap.dir, target, { recursive: true })
      imported.push(snap.sid)
      console.log(`[cbo] 스냅샷 임포트(${origin}): ${snap.sid} (${snap.manifest.exported_at})`)
    } catch (err) {
      console.error(`[cbo] 스냅샷 임포트 실패(${origin}, ${snap.sid}):`, err)
    }
  }
  return imported
}

/** ~/.sapstack/config.yaml 의 cbo.share_roots — 공유폴더 스캔 루트 (프로비저닝/수기 설정) */
function shareRootsFromConfig(): string[] {
  try {
    const doc = yaml.load(readFileSync(environmentProfilePath(), 'utf8')) as Record<string, unknown> | null
    const cbo = (doc?.cbo ?? {}) as Record<string, unknown>
    const roots = cbo.share_roots
    return Array.isArray(roots) ? roots.map(String).filter((r) => r.trim()) : []
  } catch {
    return []
  }
}

/** UI 언어가 명시적으로 한국어 외로 저장돼 있을 때만 영어 — 미선택(undefined)은 기존 한국어 동작 유지 */
function useEnglishGuide(): boolean {
  const lang = getPersistedUiLanguage()
  return !!lang && lang !== 'ko'
}

function taglineFor(m: ParsedManifest): string {
  const date = String(m.exported_at).slice(0, 10)
  return useEnglishGuide()
    ? `Custom ABAP snapshot (${m.sid}/${m.client}, as of ${date})`
    : `커스텀 ABAP 스냅샷 (${m.sid}/${m.client}, ${date} 기준)`
}

/** 스냅샷 동봉 guide — 영어 UI면 guide.en.md(export 가 함께 기록) 우선, 없으면 guide.md */
function readGuide(dir: string, sid: string, m: ParsedManifest): string {
  const candidates = useEnglishGuide() ? ['guide.en.md', 'guide.md'] : ['guide.md']
  for (const name of candidates) {
    const p = join(dir, name)
    if (existsSync(p)) return readFileSync(p, 'utf8')
  }
  return useEnglishGuide()
    ? `# CBO snapshot (${sid})\n\n${taglineFor(m)}. Find the object in catalog.md first, then Read it.\n`
    : `# CBO 스냅샷 (${sid})\n\n${taglineFor(m)}. catalog.md 에서 오브젝트를 먼저 찾은 뒤 Read 하세요.\n`
}

/** 워크스페이스마다 스냅샷 소스 등록/동기화 — 멱등. 등록된 슬러그를 반환 */
async function registerForWorkspace(workspaceRootPath: string, sid: string, dir: string, m: ParsedManifest): Promise<string> {
  const sources = loadWorkspaceSources(workspaceRootPath)
  const existing = sources.find(
    (s) => s.config.provider === CBO_PROVIDER && (s.config.local?.path || '').replace(/[\\/]+$/, '').toUpperCase().endsWith(sid.toUpperCase()),
  )

  const guideRaw = readGuide(dir, sid, m)

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

  // 재동기화: 기준일 또는 UI 언어(tagline 언어)가 바뀌었을 때만 tagline/guide 갱신
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
  // ① 포터블 exe 인접본 ② 공유폴더(cbo.share_roots) — 로컬로 복사해 임포트
  //    (오프라인 노트북에서도 스냅샷이 계속 동작해야 하므로 제로카피 등록은 안 한다)
  const adjacent = portableAdjacentRoot()
  if (adjacent) importSnapshotsFrom(adjacent, '인접')
  for (const root of shareRootsFromConfig()) {
    try {
      importSnapshotsFrom(root, '공유폴더')
    } catch (err) {
      console.error(`[cbo] 공유폴더 스캔 실패 (${root}):`, err)
    }
  }
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

/** ZIP 항목 경로 가드 — zip-slip(../, 절대경로, 드라이브 문자) 차단 */
function isSafeZipEntry(name: string): boolean {
  if (name.includes('\\')) return false // 백슬래시 경로는 비표준 저장 — 거부
  if (name.startsWith('/') || /^[A-Za-z]:/.test(name)) return false
  return !name.split('/').some((segment) => segment === '..')
}

export interface CboImportZipResult {
  canceled: boolean
  importedSids: string[]
  snapshots: CboSnapshotInfo[]
}

/**
 * 스냅샷 ZIP 임포트 — make-distribution.ps1 -SnapshotOnly 산출물(또는 cbo/ 트리를
 * 담은 임의 ZIP)을 풀어 importSnapshotsFrom 으로 넘긴다. 공유폴더 접근이 없는
 * 현업의 갱신 폴백 경로.
 */
async function importSnapshotZip(event: IpcMainInvokeEvent, filePath?: string): Promise<CboImportZipResult> {
  let zipPath = filePath
  if (!zipPath) {
    const owner = BrowserWindow.fromWebContents(event.sender)
    const options = {
      title: 'CBO 스냅샷 ZIP 선택',
      filters: [{ name: 'ZIP', extensions: ['zip'] }],
      properties: ['openFile' as const],
    }
    const result = owner ? await dialog.showOpenDialog(owner, options) : await dialog.showOpenDialog(options)
    if (result.canceled || !result.filePaths[0]) return { canceled: true, importedSids: [], snapshots: [] }
    zipPath = result.filePaths[0]
  }

  const entries = unzipSync(new Uint8Array(readFileSync(zipPath)))
  const tmp = mkdtempSync(join(tmpdir(), 'sapstack-cbo-zip-'))
  try {
    for (const [name, bytes] of Object.entries(entries)) {
      if (!isSafeZipEntry(name)) throw new Error(`허용되지 않는 ZIP 항목 경로: ${name}`)
      if (name.endsWith('/') || name.split('/').includes('.git')) continue
      const dest = join(tmp, name)
      mkdirSync(dirname(dest), { recursive: true })
      writeFileSync(dest, bytes)
    }
    const found = findSnapshotDirs(tmp)
    if (found.length === 0) throw new Error('ZIP 에서 manifest.yaml 을 가진 스냅샷을 찾지 못했습니다')
    const failed = found.find((snap) => String(snap.manifest.status) === 'failed')
    if (failed) throw new Error(`스냅샷(${failed.sid}) status=failed — export 를 다시 실행한 산출물을 사용하세요`)
    const importedSids = importSnapshotsFrom(tmp, 'ZIP')
    const snapshots = await ensureCboSourcesRegistered()
    return { canceled: false, importedSids, snapshots }
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

export function registerCboSnapshotHandlers(): void {
  ipcMain.handle(CBO_IPC.status, async () => ensureCboSourcesRegistered())
  ipcMain.handle(CBO_IPC.register, async () => ensureCboSourcesRegistered())
  ipcMain.handle(CBO_IPC.importZip, async (event, filePath?: string) => importSnapshotZip(event, filePath))

  // 기동 시 1회 — 실패해도 앱 기동을 막지 않는다
  ensureCboSourcesRegistered().catch((err) => console.error('[cbo] 초기 등록 실패:', err))
}
