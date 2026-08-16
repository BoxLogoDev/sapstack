/**
 * Bundled local LLM engine (llama.cpp `llama-server`).
 *
 * Air-gapped SAP operators cannot install Ollama — there is no internet to
 * download it from. This module turns the desktop app into a self-contained
 * local-inference client:
 *
 *   - The `llama-server` binary ships inside the installer as an
 *     extraResource (`<resources>/llama/llama-server.exe`, ~18 MB CPU build).
 *   - Model weights do NOT ship in the installer (a 5 GB payload would break
 *     distribution). Operators drop a GGUF "model pack" into
 *     `~/.sapstack/models/` — the same USB-import flow the air-gapped
 *     deployment guide already prescribes for the app itself.
 *   - When both pieces exist, the server is spawned on loopback and the
 *     onboarding LocalModelStep pre-fills its endpoint automatically.
 *
 * Loopback-only by design: this must keep working in air-gapped mode
 * (airgap.ts blocks *outbound* traffic; 127.0.0.1 is not outbound).
 *
 * Lifecycle mirrors sapstack-runtime.ts: lazy singleton, registered from
 * main/index.ts next to the other sapstack IPC handlers.
 */
import { spawn, type ChildProcess } from 'child_process'
import { existsSync, mkdirSync, readdirSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { app, ipcMain } from 'electron'
import { mainLog } from './logger'

const PORT = Number(process.env.SAPSTACK_LOCAL_LLM_PORT) || 11435
const HOST = '127.0.0.1'
/** Model id the server registers under (stable regardless of GGUF filename). */
const MODEL_ALIAS = 'sapstack-local'

export interface LocalLlmStatus {
  /** llama-server binary found in bundled resources. */
  serverBundled: boolean
  /** GGUF file found in the model-pack directory (basename, or null). */
  modelFile: string | null
  /** Directory scanned for model packs — shown to operators in the UI. */
  modelsDir: string
  /** Server process is running. */
  running: boolean
  /** OpenAI-compatible endpoint when running. */
  endpoint: string | null
  /** Model id to use against the endpoint. */
  modelId: string
  lastError: string | null
}

let child: ChildProcess | null = null
let lastError: string | null = null

function serverBinaryPath(): string | null {
  const name = process.platform === 'win32' ? 'llama-server.exe' : 'llama-server'
  const candidates = [
    // Packaged: extraResources land directly under process.resourcesPath.
    join(process.resourcesPath || '', 'llama', name),
    // Dev runs from source: apps/electron/resources/llama (populated by build-win.ps1).
    join(app.getAppPath(), 'resources', 'llama', name),
  ]
  for (const p of candidates) {
    if (p && existsSync(p)) return p
  }
  return null
}

/** Same root rule as sapstack-runtime.ts environmentProfilePath(). */
function modelsDir(): string {
  return join(process.env.SAPSTACK_WORKSPACE || homedir(), '.sapstack', 'models')
}

function findModelFile(): string | null {
  const dir = modelsDir()
  try {
    const ggufs = readdirSync(dir).filter(f => f.toLowerCase().endsWith('.gguf')).sort()
    return ggufs[0] ?? null
  } catch {
    return null
  }
}

function isRunning(): boolean {
  return child !== null && child.exitCode === null && !child.killed
}

export function getLocalLlmStatus(): LocalLlmStatus {
  const server = serverBinaryPath()
  const model = findModelFile()
  return {
    serverBundled: server !== null,
    modelFile: model,
    modelsDir: modelsDir(),
    running: isRunning(),
    endpoint: isRunning() ? `http://${HOST}:${PORT}` : null,
    modelId: MODEL_ALIAS,
    lastError,
  }
}

function startServer(): void {
  if (isRunning()) return
  const server = serverBinaryPath()
  const model = findModelFile()
  if (!server || !model) return

  const modelPath = join(modelsDir(), model)
  // --jinja enables the GGUF's own chat template on /v1/chat/completions —
  // required for Qwen-family instruct formatting through the pi_compat path.
  // ctx 8192 keeps a 8B Q4 model within a 16 GB no-GPU laptop's budget.
  const args = [
    '-m', modelPath,
    '--host', HOST,
    '--port', String(PORT),
    '--ctx-size', '8192',
    '--jinja',
    '-a', MODEL_ALIAS,
  ]
  mainLog.info(`[local-llm] Starting bundled llama-server: ${model} on ${HOST}:${PORT}`)
  lastError = null
  child = spawn(server, args, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true })

  let stderrTail = ''
  child.stderr?.on('data', (chunk: Buffer) => {
    stderrTail = (stderrTail + chunk.toString()).slice(-2000)
  })
  child.on('error', (err) => {
    lastError = err.message
    mainLog.error(`[local-llm] spawn failed: ${err.message}`)
    child = null
  })
  child.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      lastError = `llama-server exited with code ${code}: ${stderrTail.split('\n').slice(-3).join(' ')}`
      mainLog.error(`[local-llm] ${lastError}`)
    } else {
      mainLog.info(`[local-llm] server stopped (${signal ?? code})`)
    }
    child = null
  })
}

export function stopLocalLlm(): void {
  if (child && !child.killed) {
    mainLog.info('[local-llm] Stopping bundled llama-server')
    child.kill()
  }
  child = null
}

/**
 * Register IPC + start the server when both bundled binary and a model pack
 * are present. Safe to call when neither exists (stays a no-op with a
 * discoverable status). Call once from main/index.ts.
 */
export function initLocalLlm(): void {
  // Ensure the drop directory exists so operators see where to put the pack.
  try {
    mkdirSync(modelsDir(), { recursive: true })
  } catch {
    // Non-fatal — status() will simply report no model.
  }

  ipcMain.handle('sapstack:localLlm:status', () => getLocalLlmStatus())

  startServer()
  app.on('before-quit', () => stopLocalLlm())
}
