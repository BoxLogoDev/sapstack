/**
 * LocalModelStep — Onboarding step for local model configuration.
 *
 * Shows endpoint URL and model fields only — no API key input.
 * Pre-filled with Ollama defaults (localhost:11434, qwen3-coder).
 *
 * When the app ships with the bundled llama-server engine AND the operator has
 * dropped a GGUF model pack into ~/.sapstack/models, the bundled endpoint is
 * detected via `window.sapstack.localLlm.status()` and pre-filled instead —
 * air-gapped operators cannot download Ollama, so this is their only path.
 */

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { StepFormLayout, BackButton, ContinueButton } from "./primitives"

export interface LocalModelSubmitData {
  baseUrl: string
  model: string
  models: string[]
}

interface LocalModelStepProps {
  onSubmit: (data: LocalModelSubmitData) => void
  onBack: () => void
  status?: 'idle' | 'validating' | 'success' | 'error'
  errorMessage?: string
}

function parseModelList(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function LocalModelStep({
  onSubmit,
  onBack,
  status = 'idle',
  errorMessage,
}: LocalModelStepProps) {
  const { t } = useTranslation()
  const [baseUrl, setBaseUrl] = useState('http://localhost:11434')
  const [model, setModel] = useState('qwen3-coder')
  const [modelError, setModelError] = useState<string | null>(null)
  const [bundledRunning, setBundledRunning] = useState(false)
  const [modelPackDir, setModelPackDir] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    window.sapstack?.localLlm
      ?.status()
      .then((s) => {
        if (cancelled) return
        if (s.running && s.endpoint) {
          // Bundled engine is live — pre-fill it (operator can still edit).
          setBundledRunning(true)
          setBaseUrl(s.endpoint)
          setModel(s.modelId)
        } else if (s.serverBundled && !s.modelFile) {
          // Engine shipped but no model pack imported yet — tell the operator
          // exactly where to drop it instead of failing with a raw error later.
          setModelPackDir(s.modelsDir)
        }
      })
      .catch(() => {
        // Bridge unavailable (e.g. playground) — keep Ollama defaults.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const isDisabled = status === 'validating'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedUrl = baseUrl.trim()
    const parsedModels = parseModelList(model)

    if (!trimmedUrl) {
      setModelError(t('onboarding.localModel.endpointRequired'))
      return
    }
    if (parsedModels.length === 0) {
      setModelError(t('onboarding.localModel.modelRequired'))
      return
    }

    setModelError(null)
    onSubmit({
      baseUrl: trimmedUrl,
      model: parsedModels[0],
      models: parsedModels,
    })
  }

  return (
    <StepFormLayout
      title={t("onboarding.localModel.title")}
      description={t("onboarding.localModel.description")}
      actions={
        <>
          <BackButton onClick={onBack} disabled={isDisabled} />
          <ContinueButton
            type="submit"
            form="local-model-form"
            disabled={false}
            loading={status === 'validating'}
            loadingText={t("common.connecting")}
          />
        </>
      }
    >
      <form id="local-model-form" onSubmit={handleSubmit} className="space-y-6">
        {bundledRunning && (
          <p className="text-xs rounded-md bg-foreground/5 px-3 py-2 text-foreground/70">
            {t("onboarding.localModel.bundledDetected")}
          </p>
        )}
        {!bundledRunning && modelPackDir && (
          <p className="text-xs rounded-md bg-foreground/5 px-3 py-2 text-foreground/70">
            {t("onboarding.localModel.modelPackHint", { dir: modelPackDir })}
          </p>
        )}
        {/* Endpoint URL */}
        <div className="space-y-2">
          <Label htmlFor="local-base-url">{t("onboarding.localModel.endpoint")}</Label>
          <div className={cn(
            "rounded-md shadow-minimal transition-colors",
            "bg-foreground-2 focus-within:bg-background"
          )}>
            <Input
              id="local-base-url"
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={t("onboarding.localModel.endpointPlaceholder")}
              className="border-0 bg-transparent shadow-none"
              disabled={isDisabled}
              autoFocus
            />
          </div>
          <p className="text-xs text-foreground/30">
            {t("onboarding.localModel.endpointHelper")}
          </p>
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="local-model">
            {t("onboarding.localModel.model")}{' '}
            <span className="text-foreground/30">· {t("onboarding.localModel.required")}</span>
          </Label>
          <div className={cn(
            "rounded-md shadow-minimal transition-colors",
            "bg-foreground-2 focus-within:bg-background",
            modelError && "ring-1 ring-destructive/40"
          )}>
            <Input
              id="local-model"
              type="text"
              value={model}
              onChange={(e) => {
                setModel(e.target.value)
                setModelError(null)
              }}
              placeholder={t("onboarding.localModel.modelPlaceholder")}
              className="border-0 bg-transparent shadow-none"
              disabled={isDisabled}
            />
          </div>
          {modelError && (
            <p className="text-xs text-destructive">{modelError}</p>
          )}
          <p className="text-xs text-foreground/30">
            {t("onboarding.localModel.modelHelper")}
          </p>
        </div>

        {/* Error message */}
        {status === 'error' && errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
      </form>
    </StepFormLayout>
  )
}
