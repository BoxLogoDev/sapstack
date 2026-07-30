import { useEffect, useState, type ComponentType } from 'react'
import { BookOpen, CalendarCheck, Code2, MessageSquareText, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NewChatActionParams } from '../../../shared/types'

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
      .catch(() => {})
    return () => { active = false }
  }, [])

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-6 text-foreground">
      <div className="w-full max-w-4xl">
        <div className="mb-7 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">sapstack Desktop</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">오늘 어떤 SAP 업무를 진행할까요?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {catalog
              ? `${catalog.plugins}개 플러그인 · ${catalog.agents}개 에이전트 · ${catalog.commands}개 커맨드가 내장되어 있습니다.`
              : '내장 sapstack 카탈로그를 불러오는 중입니다.'}
          </p>
        </div>

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

        <p className="mt-5 text-center text-xs text-muted-foreground">
          회사코드·G/L 계정·코스트 센터·조직값은 입력하기 전까지 가정하지 않습니다.
        </p>
      </div>
    </div>
  )
}
