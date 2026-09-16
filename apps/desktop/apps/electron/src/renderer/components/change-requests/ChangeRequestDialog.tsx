/**
 * ChangeRequestEntry / ChangeRequestDialog — 답변 아래 "이 프로그램 수정 요청" 버튼과 요청서 대화상자.
 *
 * 초안은 대화(마지막 질문·최종 답·Z/Y 오브젝트·활성 스냅샷의 SID)에서 자동으로 채우고, 사용자는
 * 제목·오브젝트·기대 동작·우선순위·전문 첨부만 손본다. 미리보기 = 실제 전송 본문(Markdown).
 * 전송은 main(sapstack:changeRequests:submit)이 로컬 큐 → Azure DevOps 순으로 처리한다.
 */

import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardList, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@sapstack-desktop/ui'
import { useRegisterModal } from '@/context/ModalContext'
import { detectCboQuery } from '@/components/app-shell/sap-golden-path'
import type { Session, ChangeRequestsStatus } from '../../../shared/types'
import {
  buildDraft,
  renderDescription,
  renderTranscriptMarkdown,
  type ChangeRequestDraft,
  type ChangeRequestPriority,
  type DraftSnapshot,
} from '../../../shared/change-requests-core'

// ── 진입점: 버튼 + 대화상자 (설정 없음·폐쇄망·미로그인·CBO 대화 아님 → 렌더 안 함) ──

export function ChangeRequestEntry({ session }: { session: Session }) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<ChangeRequestsStatus | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let alive = true
    window.sapstack.changeRequests?.status().then((s) => { if (alive) setStatus(s) }).catch(() => {})
    return () => { alive = false }
  }, [])

  const isCboConversation = useMemo(
    () => session.messages.some((m) => m.role === 'user' && !m.hidden && detectCboQuery(m.content)),
    [session.messages],
  )

  if (!status?.enabled || !isCboConversation) return null

  return (
    <div className="flex justify-end px-2 pt-1">
      <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setOpen(true)}>
        <ClipboardList className="mr-1.5 size-3.5" />
        {t('changeRequest.button')}
      </Button>
      {open && <ChangeRequestDialog session={session} onClose={() => setOpen(false)} />}
    </div>
  )
}

// ── 대화상자 ────────────────────────────────────────────────────────────────

function ChangeRequestDialog({ session, onClose }: { session: Session; onClose: () => void }) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<ChangeRequestDraft | null>(null)
  const [objectsText, setObjectsText] = useState('')
  const [snapshotAsOf, setSnapshotAsOf] = useState<string>()
  const [attachTranscript, setAttachTranscript] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useRegisterModal(true, onClose)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [snapshots, auth] = await Promise.all([
        window.sapstack.cbo.status().catch(() => []),
        window.sapstack.auth.status().catch(() => null),
      ])
      const identity = auth?.status.kind === 'signed_in' ? auth.status.identity : null
      const drafted = buildDraft({
        messages: session.messages,
        snapshots: snapshots.map((s): DraftSnapshot => ({ sid: s.sid, client: s.client, sourceSlug: s.sourceSlug })),
        enabledSourceSlugs: session.enabledSourceSlugs,
        requester: identity ? { email: identity.email, name: identity.name } : null,
      })
      if (!alive) return
      setDraft(drafted)
      setObjectsText(drafted.objects.join(', '))
      setSnapshotAsOf(snapshots.find((s) => s.sid === drafted.sid)?.exportedAt?.slice(0, 10))
    })()
    return () => { alive = false }
  }, [session])

  const effective = useMemo<ChangeRequestDraft | null>(() => {
    if (!draft) return null
    const objects = objectsText.split(',').map((o) => o.trim().toUpperCase()).filter(Boolean)
    return { ...draft, objects }
  }, [draft, objectsText])

  const description = useMemo(() => (effective ? renderDescription(effective, { snapshotAsOf }) : ''), [effective, snapshotAsOf])

  const handleSubmit = async () => {
    if (!effective || submitting) return
    setSubmitting(true)
    try {
      const result = await window.sapstack.changeRequests.submit({
        draft: effective,
        description,
        ...(attachTranscript ? { transcript: renderTranscriptMarkdown(session.messages) } : {}),
      })
      if (result.status === 'submitted' && result.result) {
        const url = result.result.url
        toast.success(t('changeRequest.submitted', { id: result.result.id }), {
          action: { label: t('changeRequest.openInBoards'), onClick: () => window.electronAPI?.openUrl(url) },
        })
      } else {
        toast.error(t('changeRequest.failedQueued', { error: result.error ?? 'unknown' }))
      }
      onClose()
    } catch (err) {
      toast.error(t('changeRequest.failedQueued', { error: err instanceof Error ? err.message : String(err) }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="size-5" />
            {t('changeRequest.dialog.title')}
          </DialogTitle>
          <DialogDescription className="text-left pt-1">{t('changeRequest.dialog.description')}</DialogDescription>
        </DialogHeader>

        {!effective ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">{t('changeRequest.requester')}:</span>{' '}
                {effective.requester ? `${effective.requester.name} <${effective.requester.email}>` : '—'}
              </div>
              <div>
                <span className="font-medium text-foreground">{t('changeRequest.system')}:</span>{' '}
                {effective.sid ? `${effective.sid}${effective.client ? ` / ${effective.client}` : ''}` : '—'}
                {snapshotAsOf ? ` · ${snapshotAsOf}` : ''}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cr-title">{t('changeRequest.field.title')}</Label>
              <Input id="cr-title" value={effective.title} maxLength={120} onChange={(e) => setDraft({ ...effective, title: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cr-objects">{t('changeRequest.field.objects')}</Label>
              <Input id="cr-objects" value={objectsText} placeholder="ZFI0171, ZFIT_HDR" onChange={(e) => setObjectsText(e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('changeRequest.field.objectsHint')}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cr-expected">{t('changeRequest.field.expected')}</Label>
              <Textarea
                id="cr-expected"
                rows={4}
                value={effective.expected}
                placeholder={t('changeRequest.field.expectedPlaceholder')}
                onChange={(e) => setDraft({ ...effective, expected: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-1.5">
                <Label>{t('changeRequest.field.priority')}</Label>
                <Select value={String(effective.priority)} onValueChange={(v) => setDraft({ ...effective, priority: Number(v) as ChangeRequestPriority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {([1, 2, 3, 4] as const).map((p) => (
                      <SelectItem key={p} value={String(p)}>{t(`changeRequest.priority.${p}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-start gap-3">
                <Switch id="cr-transcript" checked={attachTranscript} onCheckedChange={setAttachTranscript} />
                <div className="space-y-0.5">
                  <Label htmlFor="cr-transcript">{t('changeRequest.field.attachTranscript')}</Label>
                  <p className="text-xs text-muted-foreground">{t('changeRequest.field.attachTranscriptHint')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t('changeRequest.preview')}</Label>
              <pre className="max-h-56 overflow-auto rounded-md border bg-muted p-3 text-xs whitespace-pre-wrap font-mono">{description}</pre>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>{t('changeRequest.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={!effective || submitting || !effective.title.trim()}>
            {submitting ? (<><Spinner className="mr-2" />{t('changeRequest.submitting')}</>) : (<><ExternalLink className="mr-1.5 size-4" />{t('changeRequest.submit')}</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
