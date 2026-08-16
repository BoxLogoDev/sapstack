import { useEffect, useState, type ComponentType, type FormEvent } from 'react'
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

const paths: GoldenPathItem[] = [
  {
    title: 'Quick Advisory',
    description: 'T-code, 설정, ECC·S/4 차이를 빠르게 확인합니다.',
    icon: MessageSquareText,
    chat: { name: 'SAP Quick Advisory', input: 'sapstack Quick Advisory로 다음 질문에 답해 주세요: ' },
  },
  {
    title: 'Evidence Loop 진단',
    description: '증상부터 가설·증거·검증·Rollback까지 추적합니다.',
    icon: Stethoscope,
    chat: { name: 'SAP Evidence Loop', input: 'sapstack Evidence Loop 세션을 시작해 주세요. 현재 증상은: ' },
  },
  {
    title: 'CBO / ABAP 분석',
    description: 'Clean Core, ATC, Dump, Transport 영향을 검토합니다.',
    icon: Code2,
    chat: { name: 'CBO / ABAP 분석', input: 'sapstack sap-abap 지식을 사용해 다음 코드 또는 장애를 분석해 주세요: ' },
  },
  {
    title: '기간 마감',
    description: 'Test Run과 운영자 승인 gate가 있는 마감 순서를 준비합니다.',
    icon: CalendarCheck,
    chat: { name: 'SAP 기간 마감', input: 'sapstack period-end sequence로 마감 사전점검을 시작해 주세요. 대상 마감은: ' },
  },
  {
    title: '지식 / Vault',
    description: '내부 자료와 sapstack 근거를 함께 찾아 답변합니다.',
    icon: BookOpen,
    chat: { name: 'SAP 지식 검색', input: 'Vault와 sapstack 지식을 함께 검색해 다음 내용을 조사해 주세요: ' },
  },
]

export function SapGoldenPath({ onOpenChat }: { onOpenChat?: (params: NewChatActionParams) => Promise<void> }) {
  const [catalog, setCatalog] = useState<CatalogSummary>()
  const [catalogUnavailable, setCatalogUnavailable] = useState(false)
  const [request, setRequest] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string>()
  const [error, setError] = useState<string>()
  const [exportingSupport, setExportingSupport] = useState(false)
  const [learning, setLearning] = useState<LearningSummary>()
  const [inspectingLearning, setInspectingLearning] = useState(false)

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
        setNotice(`민감정보 ${Number(scrub.hitCount)}건을 가렸습니다. 내용을 확인한 뒤 다시 시작해 주세요.`)
        return
      }

      const environment = await window.sapstack.environment.get()
      if (!environment) throw new Error('SAP 환경 프로필이 없습니다. 앱을 다시 시작해 환경을 설정해 주세요.')
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
        if (typeof started.session_id !== 'string') throw new Error('Evidence Loop 세션 ID를 받지 못했습니다.')
        sessionId = started.session_id
      }
      await onOpenChat(buildGuidedChat({ query, mode, environment, matches, sessionId }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'SAP 진단을 시작하지 못했습니다.')
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
      if (result.saved) setNotice('민감정보를 제외한 support bundle을 저장했습니다.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Support bundle을 저장하지 못했습니다.')
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
      setError(cause instanceof Error ? cause.message : '개선 후보를 확인하지 못했습니다.')
    } finally {
      setInspectingLearning(false)
    }
  }

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-6 text-foreground">
      <div className="w-full max-w-4xl">
        <div className="mb-7 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">sapstack Desktop</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">오늘 어떤 SAP 업무를 진행할까요?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {catalog
              ? `${catalog.plugins}개 플러그인 · ${catalog.agents}개 에이전트 · ${catalog.commands}개 커맨드가 내장되어 있습니다.`
              : catalogUnavailable
                ? '내장 카탈로그를 불러오지 못했습니다. 진단은 계속 시작할 수 있습니다.'
                : '내장 sapstack 카탈로그를 불러오는 중입니다.'}
          </p>
        </div>

        <form className="mb-5 rounded-xl border border-foreground/10 bg-foreground/[0.025] p-4 shadow-minimal" onSubmit={startGuidedRequest}>
          <label className="mb-2 block text-sm font-semibold" htmlFor="sap-guided-request">증상이나 질문을 입력하세요</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <textarea
              id="sap-guided-request"
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="예: F110 돌렸는데 한 벤더만 지급방법 오류가 뜨네요"
              className="min-h-20 flex-1 resize-y rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-foreground/30"
            />
            <button
              type="submit"
              disabled={!request.trim() || submitting || !onOpenChat}
              aria-busy={submitting}
              className="min-h-10 rounded-lg bg-foreground px-4 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
            >
              {submitting ? '분석 중…' : '진단 시작'}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">환경과 증상 매칭을 확인해 Quick Advisory 또는 Evidence Loop로 자동 연결합니다.</p>
          {notice && <p role="status" className="mt-2 text-sm text-foreground">{notice}</p>}
          {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
        </form>

        <div className="grid gap-3 sm:grid-cols-2">
          {paths.map((path, index) => {
            const Icon = path.icon
            return (
              <button
                key={path.title}
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
              <h2 id="sap-learning-title" className="text-sm font-semibold">로컬 개선 후보</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                해결된 Evidence Loop의 비식별 메트릭만 확인합니다. 후보는 자동 적용·외부 전송되지 않습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={inspectLearning}
              disabled={inspectingLearning}
              className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm hover:bg-foreground/[0.055] disabled:opacity-50"
            >
              <RefreshCw className={cn('size-4', inspectingLearning && 'animate-spin')} aria-hidden="true" />
              {inspectingLearning ? '확인 중…' : '후보 확인'}
            </button>
          </div>
          {learning && (
            <div className="mt-3 border-t border-foreground/10 pt-3 text-xs text-muted-foreground" role="status">
              해결 {learning.resolved_sessions}/{learning.total_sessions}개 · 검수 대기 {learning.candidates.length}건
              {learning.candidates.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {learning.candidates.slice(0, 5).map(candidate => (
                    <li key={candidate.candidate_id}>
                      {candidate.kind === 'gold_set' ? 'Eval 후보' : '지식 후보'} · {candidate.symptom_ref || candidate.candidate_id} · {candidate.modules.join('/') || '모듈 미확정'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        <div className="mt-5 flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
          <p>회사코드·G/L 계정·코스트 센터·조직값은 입력하기 전까지 가정하지 않습니다.</p>
          <button
            type="button"
            onClick={exportSupportBundle}
            disabled={exportingSupport}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 hover:bg-foreground/[0.055] disabled:opacity-50"
          >
            <Download className="size-4" aria-hidden="true" />
            {exportingSupport ? 'Support bundle 저장 중…' : 'Support bundle 저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
