/**
 * CboSnapshotSettingsPage
 *
 * CBO 스냅샷(커스텀 ABAP 소스 오프라인 사본) 상태 카드 — 시스템별 기준일·객체 수·
 * 등록 상태를 보여주고, 재검색(포터블 인접본 임포트 포함)을 제공한다.
 * 스냅샷 생성은 관리자 몫(docs/cbo-snapshot.md) — 이 페이지는 소비 측 상태 창구다.
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Archive, RefreshCw, AlertTriangle, CheckCircle2, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import { PanelHeader } from '@/components/app-shell/PanelHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Spinner } from '@sapstack-desktop/ui'
import type { DetailsPageMeta } from '@/lib/navigation-registry'
import type { CboSnapshotStatus } from '../../../shared/types'

import { SettingsSection, SettingsCard, SettingsRow } from '@/components/settings'

export const meta: DetailsPageMeta = {
  navigator: 'settings',
  slug: 'cboSnapshot',
}

export default function CboSnapshotSettingsPage() {
  const { t } = useTranslation()
  const [snapshots, setSnapshots] = useState<CboSnapshotStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setSnapshots(await window.sapstack.cbo.status())
    } catch (err) {
      console.error('Failed to load CBO snapshot status:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      setSnapshots(await window.sapstack.cbo.register())
      toast.success(t('settings.cboSnapshot.refreshed'))
    } catch (err) {
      toast.error(t('settings.cboSnapshot.refreshFailed', { message: err instanceof Error ? err.message : String(err) }))
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleShowInFolder = (path: string) => {
    window.electronAPI.showInFolder?.(path)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PanelHeader title={t('settings.cboSnapshot.title')} />
      <ScrollArea className="flex-1">
        <div className="px-5 py-7 max-w-3xl mx-auto space-y-5">

          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-muted border text-xs text-muted-foreground">
            <Archive className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{t('settings.cboSnapshot.notice')}</span>
          </div>

          {snapshots.length === 0 && (
            <SettingsSection title={t('settings.cboSnapshot.noneSection')}>
              <SettingsCard>
                <div className="px-1 py-2 text-sm text-muted-foreground space-y-1">
                  <p>{t('settings.cboSnapshot.noneFound')}</p>
                  <p className="text-xs">{t('settings.cboSnapshot.noneHint')}</p>
                </div>
              </SettingsCard>
            </SettingsSection>
          )}

          {snapshots.map((s) => {
            const stale = s.staleDays >= 0 && s.staleDays > s.stalenessWarnDays
            return (
              <SettingsSection key={s.sid} title={`${s.sid} · ${t('settings.cboSnapshot.clientLabel')} ${s.client}`}>
                <SettingsCard>
                  <SettingsRow label={t('settings.cboSnapshot.exportedAt')}>
                    <span className={`flex items-center gap-1.5 text-xs ${stale ? 'text-warning' : 'text-muted-foreground'}`}>
                      {stale ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                      {s.exportedAt.slice(0, 10)}
                      {s.staleDays >= 0 && ` (${t('settings.cboSnapshot.daysAgo', { count: s.staleDays })})`}
                      {stale && ` — ${t('settings.cboSnapshot.staleWarning')}`}
                    </span>
                  </SettingsRow>
                  <SettingsRow label={t('settings.cboSnapshot.objects')}>
                    <span className="text-xs text-muted-foreground">
                      {t('settings.cboSnapshot.objectSummary', { objects: s.objectCount, packages: s.packageCount })}
                      {s.status !== 'complete' && ` · ${t('settings.cboSnapshot.statusPartial')}`}
                    </span>
                  </SettingsRow>
                  <SettingsRow label={t('settings.cboSnapshot.registered')}>
                    <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                      {s.registeredWorkspaces.length > 0 ? s.registeredWorkspaces.join(', ') : t('settings.cboSnapshot.notRegistered')}
                    </span>
                  </SettingsRow>
                  <SettingsRow label={t('settings.cboSnapshot.folder')}>
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded max-w-[240px] truncate">{s.path}</code>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleShowInFolder(s.path)}>
                        <FolderOpen className="h-3 w-3" />
                      </Button>
                    </div>
                  </SettingsRow>
                </SettingsCard>
              </SettingsSection>
            )
          })}

          <div className="flex items-center gap-2 px-1">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? <Spinner className="mr-1.5" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
              {t('settings.cboSnapshot.refresh')}
            </Button>
          </div>

        </div>
      </ScrollArea>
    </div>
  )
}
