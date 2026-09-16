/**
 * ChangeRequestsSettingsPage — 변경 요청 연결 상태·내 요청(Azure DevOps)·이 PC 의 미전송 초안.
 *
 * "내 요청" 은 마운트 시 + 새로 고침 버튼으로만 조회한다(백그라운드 폴링 없음). 관리자 대시보드는
 * Azure DevOps 내장 기능이라 여기서는 보드 링크만 연다(docs/change-requests.md).
 */

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardList, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { PanelHeader } from '@/components/app-shell/PanelHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Spinner } from '@sapstack-desktop/ui'
import type { DetailsPageMeta } from '@/lib/navigation-registry'
import type { ChangeRequestsStatus, ChangeRequestItem, QueuedChangeRequest } from '../../../shared/types'
import { SettingsSection, SettingsCard, SettingsRow } from '@/components/settings'

export const meta: DetailsPageMeta = {
  navigator: 'settings',
  slug: 'changeRequests',
}

export default function ChangeRequestsSettingsPage() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<ChangeRequestsStatus | null>(null)
  const [mine, setMine] = useState<ChangeRequestItem[]>([])
  const [mineError, setMineError] = useState<string | null>(null)
  const [loadingMine, setLoadingMine] = useState(false)
  const [queue, setQueue] = useState<QueuedChangeRequest[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  const loadMine = useCallback(async () => {
    setLoadingMine(true)
    setMineError(null)
    try {
      setMine(await window.sapstack.changeRequests.listMine())
    } catch (err) {
      setMineError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoadingMine(false)
    }
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [s, q] = await Promise.all([window.sapstack.changeRequests.status(), window.sapstack.changeRequests.queue()])
      if (!alive) return
      setStatus(s)
      setQueue(q)
      if (s.enabled) void loadMine()
    })().catch((err) => console.error('Failed to load change-request status:', err))
    return () => { alive = false }
  }, [loadMine])

  const handleRetry = async (id: string) => {
    setBusyId(id)
    try {
      const rec = await window.sapstack.changeRequests.retry(id)
      setQueue(await window.sapstack.changeRequests.queue())
      if (rec?.status === 'submitted' && rec.result) {
        toast.success(t('changeRequest.submitted', { id: rec.result.id }))
        void loadMine()
      } else if (rec?.error) {
        toast.error(rec.error)
      }
    } finally {
      setBusyId(null)
    }
  }

  const handleDiscard = async (id: string) => {
    setQueue(await window.sapstack.changeRequests.discard(id))
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    )
  }

  const pending = queue.filter((q) => q.status !== 'submitted')

  return (
    <div className="flex flex-col h-full">
      <PanelHeader title={t('settings.changeRequests.title')} />
      <ScrollArea className="flex-1">
        <div className="px-5 py-7 max-w-3xl mx-auto space-y-5">

          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-muted border text-xs text-muted-foreground">
            <ClipboardList className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{t('settings.changeRequests.notice')}</span>
          </div>

          <SettingsSection title={t('settings.changeRequests.connection')}>
            <SettingsCard>
              {status.reason === 'not_configured' ? (
                <div className="px-1 py-2 text-sm text-muted-foreground">{t('settings.changeRequests.notConfigured')}</div>
              ) : (
                <>
                  <SettingsRow label={t('settings.changeRequests.organization')}>
                    <span className="text-xs text-muted-foreground">{status.orgUrl}</span>
                  </SettingsRow>
                  <SettingsRow label={t('settings.changeRequests.project')}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{status.project}</span>
                      {status.boardUrl && (
                        <Button variant="outline" size="sm" onClick={() => window.electronAPI?.openUrl(status.boardUrl!)}>
                          <ExternalLink className="mr-1.5 size-3.5" />
                          {t('settings.changeRequests.openBoard')}
                        </Button>
                      )}
                    </div>
                  </SettingsRow>
                  {!status.enabled && status.reason && (
                    <div className="flex items-center gap-2 px-1 py-2 text-xs text-warning">
                      <AlertTriangle className="size-3.5" />
                      {t(`settings.changeRequests.disabled.${status.reason}`, { detail: status.detail ?? '' })}
                    </div>
                  )}
                </>
              )}
            </SettingsCard>
          </SettingsSection>

          {status.enabled && (
            <SettingsSection title={t('settings.changeRequests.mine')}>
              <SettingsCard>
                <div className="flex justify-end px-1 pt-1">
                  <Button variant="ghost" size="sm" onClick={() => void loadMine()} disabled={loadingMine}>
                    <RefreshCw className={`mr-1.5 size-3.5 ${loadingMine ? 'animate-spin' : ''}`} />
                    {t('settings.changeRequests.refresh')}
                  </Button>
                </div>
                {mineError ? (
                  <div className="px-1 py-2 text-sm text-destructive">{t('settings.changeRequests.loadFailed', { message: mineError })}</div>
                ) : mine.length === 0 && !loadingMine ? (
                  <div className="px-1 py-2 text-sm text-muted-foreground">{t('settings.changeRequests.none')}</div>
                ) : (
                  mine.map((item) => (
                    <SettingsRow key={item.id} label={`#${item.id} · ${item.title}`}>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border px-2 py-0.5">{item.state}</span>
                        {item.assignedTo && <span>{item.assignedTo}</span>}
                        <span>{item.changedAt.slice(0, 10)}</span>
                        <Button variant="ghost" size="sm" onClick={() => window.electronAPI?.openUrl(item.url)}>
                          <ExternalLink className="size-3.5" />
                        </Button>
                      </div>
                    </SettingsRow>
                  ))
                )}
              </SettingsCard>
            </SettingsSection>
          )}

          {pending.length > 0 && (
            <SettingsSection title={t('settings.changeRequests.local')}>
              <SettingsCard>
                <p className="px-1 pt-2 text-xs text-muted-foreground">{t('settings.changeRequests.localHint')}</p>
                {pending.map((rec) => (
                  <SettingsRow key={rec.id} label={rec.draft.title}>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full border px-2 py-0.5 text-muted-foreground" title={rec.error}>
                        {t(`settings.changeRequests.status.${rec.status}`)}
                      </span>
                      <Button variant="outline" size="sm" disabled={busyId === rec.id} onClick={() => void handleRetry(rec.id)}>
                        {busyId === rec.id ? <Spinner className="size-3.5" /> : t('settings.changeRequests.retry')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => void handleDiscard(rec.id)}>
                        {t('settings.changeRequests.discard')}
                      </Button>
                    </div>
                  </SettingsRow>
                ))}
              </SettingsCard>
            </SettingsSection>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
