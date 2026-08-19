import { useEffect, useState, type ComponentType, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, CalendarCheck, Code2, Download, MessageSquareText, RefreshCw, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NewChatActionParams } from '../../../shared/types'
import { buildGuidedChat, selectAdvisoryMode, type SymptomMatch } from './sap-golden-path'

interface CatalogSummary {
  plugins: number
  agents: number
  commands: number
}

interface GoldenPathItem {
  id: string
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  chat: NewChatActionParams
}

interface LearningSummary {
  total_sessions: number
  resolved_sessions: number
  candidates: Array<{ candidate_id: string; kind: 'gold_set' | 'codify'; symptom_ref?: string; modules: string[] }>
}

export function SapGoldenPath({ onOpenChat }: { onOpenChat?: (params: NewChatActionParams) => Promise<void> }) {
  const { t } = useTranslation()
  const [catalog, setCatalog] = useState<CatalogSummary>()
  const [catalogUnavailable, setCatalogUnavailable] = useState(false)
  const [request, setRequest] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string>()
  const [error, setError] = useState<string>()
  const [exportingSupport, setExportingSupport] = useState(false)
  const [learning, setLearning] = useState<LearningSummary>()
  const [inspectingLearning, setInspectingLearning] = useState(false)
  const paths: GoldenPathItem[] = [
    {
      id: 'quickAdvisory',
      title: t('sapGoldenPath.cards.quickAdvisory.title'),
      description: t('sapGoldenPath.cards.quickAdvisory.description'),
      icon: MessageSquareText,
      chat: { name: t('sapGoldenPath.cards.quickAdvisory.chatName'), input: t('sapGoldenPath.cards.quickAdvisory.chatInput') },
    },
    {
      id: 'evidenceLoop',
      title: t('sapGoldenPath.cards.evidenceLoop.title'),
      description: t('sapGoldenPath.cards.evidenceLoop.description'),
      icon: Stethoscope,
      chat: { name: t('sapGoldenPath.cards.evidenceLoop.chatName'), input: t('sapGoldenPath.cards.evidenceLoop.chatInput') },
    },
    {
      id: 'abapAnalysis',
      title: t('sapGoldenPath.cards.abapAnalysis.title'),
      description: t('sapGoldenPath.cards.abapAnalysis.description'),
      icon: Code2,
      chat: { name: t('sapGoldenPath.cards.abapAnalysis.chatName'), input: t('sapGoldenPath.cards.abapAnalysis.chatInput') },
    },
    {
      id: 'periodClose',
      title: t('sapGoldenPath.cards.periodClose.title'),
      description: t('sapGoldenPath.cards.periodClose.description'),
      icon: CalendarCheck,
      chat: { name: t('sapGoldenPath.cards.periodClose.chatName'), input: t('sapGoldenPath.cards.periodClose.chatInput') },
    },
    {
      id: 'knowledgeVault',
      title: t('sapGoldenPath.cards.knowledgeVault.title'),
      description: t('sapGoldenPath.cards.knowledgeVault.description'),
      icon: BookOpen,
      chat: { name: t('sapGoldenPath.cards.knowledgeVault.chatName'), input: t('sapGoldenPath.cards.knowledgeVault.chatInput') },
    },
  ]

  useEffect(() => {
    let active = true
    window.sapstack.catalog.list()
      .then((result) => {
        if (!active || !result || typeof result !== 'object') return
        const value = result as { plugins?: unknown[]; agents?: unknown[]; commands?: unknown[] }
        setCatalog({
          plugins: value.plugins?.length ?? 0,
          agents: value.agents?.length ?? 0,
          commands: value.commands?.length ?? 0,
        })
      })
      .catch(() => { if (active) setCatalogUnavailable(true) })
    return () => { active = false }
  }, [])

  const startGuidedRequest = async (event: FormEvent) => {
    event.preventDefault()
    const query = request.trim()
    if (!query || submitting || !onOpenChat) return
    setSubmitting(true)
    setNotice(undefined)
    setError(undefined)
    try {
      const scrub = await window.sapstack.security.scrub(query) as { scrubbedText?: unknown; hitCount?: unknown }
      if (typeof scrub.scrubbedText === 'string' && Number(scrub.hitCount) > 0 && scrub.scrubbedText !== query) {
        setRequest(scrub.scrubbedText)
        setNotice(t('sapGoldenPath.sensitiveDataRedacted', { count: Number(scrub.hitCount) }))
        return
      }

      const environment = await window.sapstack.environment.get()
      if (!environment) throw new Error(t('sapGoldenPath.environmentMissing'))
      const rawMatches = await window.sapstack.knowledge.resolveSymptom({
        query,
        language: environment.language,
        country: environment.country_iso,
        top_n: 3,
      })
      const matches = Array.isArray(rawMatches)
        ? rawMatches.filter((match): match is SymptomMatch => Boolean(
            match && typeof match === 'object' && typeof match.id === 'string' &&
            typeof match.confidence === 'number' && Array.isArray(match.likely_modules) &&
            Array.isArray(match.first_check_tcodes),
          ))
        : []
      const mode = selectAdvisoryMode(query, matches)
      let sessionId: string | undefined
      if (mode === 'evidence') {
        const matchedSymptom = matches.find(match => match.confidence >= 0.6)?.id
        const started = await window.sapstack.sessions.start({
          symptom: query,
          matched_symptom_index_entry: matchedSymptom,
          reporter_role: 'operator',
          release: environment.release,
          deployment: environment.deployment,
          industry: environment.industry,
          language: environment.language,
          country_iso: environment.country_iso,
          client: environment.client,
        }) as { session_id?: unknown }
        if (typeof started.session_id !== 'string') throw new Error(t('sapGoldenPath.sessionIdMissing'))
        sessionId = started.session_id
      }
      await onOpenChat(buildGuidedChat({ query, mode, environment, matches, sessionId }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('sapGoldenPath.startFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const exportSupportBundle = async () => {
    if (exportingSupport) return
    setExportingSupport(true)
    setError(undefined)
    try {
      const result = await window.sapstack.support.export()
      if (result.saved) setNotice(t('sapGoldenPath.supportBundleSaved'))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('sapGoldenPath.supportBundleSaveFailed'))
    } finally {
      setExportingSupport(false)
    }
  }

  const inspectLearning = async () => {
    if (inspectingLearning) return
    setInspectingLearning(true)
    setError(undefined)
    try {
      setLearning(await window.sapstack.learning.inspect())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('sapGoldenPath.learningInspectFailed'))
    } finally {
      setInspectingLearning(false)
    }
  }

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-6 text-foreground">
      <div className="w-full max-w-4xl">
        <div className="mb-7 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{t('sapGoldenPath.brand')}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t('sapGoldenPath.title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {catalog
              ? t('sapGoldenPath.catalogSummary', {
                  plugins: catalog.plugins,
                  agents: catalog.agents,
                  commands: catalog.commands,
                })
              : catalogUnavailable
                ? t('sapGoldenPath.catalogUnavailable')
                : t('sapGoldenPath.catalogLoading')}
          </p>
        </div>

        <form className="mb-5 rounded-xl border border-foreground/10 bg-foreground/[0.025] p-4 shadow-minimal" onSubmit={startGuidedRequest}>
          <label className="mb-2 block text-sm font-semibold" htmlFor="sap-guided-request">{t('sapGoldenPath.requestLabel')}</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <textarea
              id="sap-guided-request"
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              rows={2}
              maxLength={2000}
              placeholder={t('sapGoldenPath.requestPlaceholder')}
              className="min-h-20 flex-1 resize-y rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-foreground/30"
            />
            <button
              type="submit"
              disabled={!request.trim() || submitting || !onOpenChat}
              aria-busy={submitting}
              className="min-h-10 rounded-lg bg-foreground px-4 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
            >
              {submitting ? t('sapGoldenPath.analyzing') : t('sapGoldenPath.startDiagnosis')}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t('sapGoldenPath.routingHint')}</p>
          {notice && <p role="status" className="mt-2 text-sm text-foreground">{notice}</p>}
          {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
        </form>

        <div className="grid gap-3 sm:grid-cols-2">
          {paths.map((path, index) => {
            const Icon = path.icon
            return (
              <button
                key={path.id}
                type="button"
                onClick={() => onOpenChat?.(path.chat)}
                className={cn(
                  'group flex min-h-28 items-start gap-4 rounded-xl border border-foreground/10 bg-foreground/[0.025] p-4 text-left shadow-minimal transition-colors hover:bg-foreground/[0.055]',
                  index === paths.length - 1 && 'sm:col-span-2',
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background shadow-minimal">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{path.title}</span>
                  <span className="mt-1 block text-sm leading-5 text-muted-foreground">{path.description}</span>
                </span>
              </button>
            )
          })}
        </div>

        <section className="mt-5 rounded-xl border border-foreground/10 bg-foreground/[0.025] p-4 shadow-minimal" aria-labelledby="sap-learning-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="sap-learning-title" className="text-sm font-semibold">{t('sapGoldenPath.learning.title')}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('sapGoldenPath.learning.description')}
              </p>
            </div>
            <button
              type="button"
              onClick={inspectLearning}
              disabled={inspectingLearning}
              className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm hover:bg-foreground/[0.055] disabled:opacity-50"
            >
              <RefreshCw className={cn('size-4', inspectingLearning && 'animate-spin')} aria-hidden="true" />
              {inspectingLearning ? t('sapGoldenPath.learning.inspecting') : t('sapGoldenPath.learning.inspect')}
            </button>
          </div>
          {learning && (
            <div className="mt-3 border-t border-foreground/10 pt-3 text-xs text-muted-foreground" role="status">
              {t('sapGoldenPath.learning.summary', {
                resolved: learning.resolved_sessions,
                total: learning.total_sessions,
                candidates: learning.candidates.length,
              })}
              {learning.candidates.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {learning.candidates.slice(0, 5).map(candidate => (
                    <li key={candidate.candidate_id}>
                      {candidate.kind === 'gold_set' ? t('sapGoldenPath.learning.evalCandidate') : t('sapGoldenPath.learning.knowledgeCandidate')} · {candidate.symptom_ref || candidate.candidate_id} · {candidate.modules.join('/') || t('sapGoldenPath.learning.moduleUnconfirmed')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        <div className="mt-5 flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
          <p>{t('sapGoldenPath.noOrgAssumptions')}</p>
          <button
            type="button"
            onClick={exportSupportBundle}
            disabled={exportingSupport}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 hover:bg-foreground/[0.055] disabled:opacity-50"
          >
            <Download className="size-4" aria-hidden="true" />
            {exportingSupport ? t('sapGoldenPath.supportBundleSaving') : t('sapGoldenPath.supportBundleSave')}
          </button>
        </div>
      </div>
    </div>
  )
}
