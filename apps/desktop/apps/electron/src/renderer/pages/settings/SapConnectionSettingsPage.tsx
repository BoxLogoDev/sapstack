/**
 * SapConnectionSettingsPage
 *
 * SAP ADT 접속(로그인) 설정 — 현업/운영자가 SAP 계정으로 로그인하면
 * ~/.sapstack/.env 에 저장되어 vsp ADT-MCP 브리지가 그대로 읽는다.
 * 읽기 전용(SAP_READ_ONLY=true)이 항상 강제되며, 이 화면은 그 값을 노출만 한다.
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PanelHeader } from '@/components/app-shell/PanelHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Spinner } from '@sapstack-desktop/ui'
import type { DetailsPageMeta } from '@/lib/navigation-registry'

import {
  SettingsSection,
  SettingsCard,
  SettingsCardFooter,
  SettingsRow,
  SettingsToggle,
  SettingsInputRow,
} from '@/components/settings'

export const meta: DetailsPageMeta = {
  navigator: 'settings',
  slug: 'sapConnection',
}

interface SapConnectionFormState {
  url: string
  client: string
  user: string
  /** 항상 빈 값으로 시작 — 빈 채로 저장하면 기존 비밀번호 유지 */
  password: string
  language: string
  insecure: boolean
}

type ProbeMessage = 'connected' | 'unauthorized' | 'forbidden' | 'not_found' | 'unreachable' | 'invalid_url' | 'unexpected'

const EMPTY_FORM: SapConnectionFormState = {
  url: '',
  client: '100',
  user: '',
  password: '',
  language: 'KO',
  insecure: true,
}

export default function SapConnectionSettingsPage() {
  const { t } = useTranslation()

  const [form, setForm] = useState<SapConnectionFormState>(EMPTY_FORM)
  const [savedForm, setSavedForm] = useState<SapConnectionFormState>(EMPTY_FORM)
  const [hasPassword, setHasPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isProbing, setIsProbing] = useState(false)
  const [probeResult, setProbeResult] = useState<{ ok: boolean; message: ProbeMessage; status: number } | null>(null)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [error, setError] = useState<string>()

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm)

  const loadSettings = useCallback(async () => {
    try {
      const saved = await window.sapstack.connection.get()
      if (saved) {
        const formState: SapConnectionFormState = {
          url: saved.url,
          client: saved.client,
          user: saved.user,
          password: '',
          language: saved.language,
          insecure: saved.insecure,
        }
        setForm(formState)
        setSavedForm(formState)
        setHasPassword(saved.hasPassword)
      }
    } catch (err) {
      console.error('Failed to load SAP connection settings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const validate = (): string | undefined => {
    if (!form.url.trim()) return t('settings.sapConnection.urlRequired')
    try {
      const u = new URL(form.url.trim())
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return t('settings.sapConnection.urlRequired')
    } catch {
      return t('settings.sapConnection.urlRequired')
    }
    if (!/^\d{3}$/.test(form.client.trim())) return t('settings.sapConnection.clientValidation')
    if (!form.user.trim()) return t('settings.sapConnection.userRequired')
    if (!form.password && !hasPassword) return t('settings.sapConnection.passwordRequired')
    return undefined
  }

  const handleProbe = async () => {
    const validation = validate()
    if (validation) { setError(validation); return }
    setError(undefined)
    setIsProbing(true)
    setProbeResult(null)
    try {
      const result = await window.sapstack.connection.probe({
        url: form.url.trim(),
        client: form.client.trim(),
        user: form.user.trim(),
        password: form.password,
        insecure: form.insecure,
      })
      setProbeResult(result)
    } catch (err) {
      console.error('SAP connection probe failed:', err)
      setProbeResult({ ok: false, message: 'unexpected', status: 0 })
    } finally {
      setIsProbing(false)
    }
  }

  const handleSave = async () => {
    const validation = validate()
    if (validation) { setError(validation); return }
    setError(undefined)
    setIsSaving(true)
    try {
      const saved = await window.sapstack.connection.save({
        url: form.url.trim(),
        client: form.client.trim(),
        user: form.user.trim(),
        password: form.password,
        language: form.language.trim() || 'KO',
        insecure: form.insecure,
      })
      const formState: SapConnectionFormState = { ...form, password: '' }
      setForm(formState)
      setSavedForm(formState)
      setHasPassword(saved.hasPassword)
      toast.success(t('settings.sapConnection.saved'))
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      toast.error(t('settings.sapConnection.failedToSave', { message: msg }))
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setForm(savedForm)
    setError(undefined)
    setProbeResult(null)
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
      <PanelHeader title={t('settings.sapConnection.title')} />
      <ScrollArea className="flex-1">
        <div className="px-5 py-7 max-w-3xl mx-auto space-y-5">

          {/* 읽기 전용 안내 배너 */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-muted border text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{t('settings.sapConnection.readOnlyNotice')}</span>
          </div>

          <SettingsSection title={t('settings.sapConnection.connectionSection')}>
            <SettingsCard>
              <SettingsInputRow
                label={t('settings.sapConnection.url')}
                value={form.url}
                onChange={(url) => setForm(f => ({ ...f, url }))}
                placeholder="https://sap-host:44300"
              />
              <SettingsRow
                label={t('settings.sapConnection.urlHint')}
                description={t('settings.sapConnection.urlHintDetail')}
              >
                <span />
              </SettingsRow>
              <SettingsInputRow
                label={t('settings.sapConnection.client')}
                value={form.client}
                onChange={(client) => setForm(f => ({ ...f, client }))}
                placeholder="100"
              />
              <SettingsInputRow
                label={t('settings.sapConnection.user')}
                value={form.user}
                onChange={(user) => setForm(f => ({ ...f, user }))}
                placeholder="OPERATOR01"
              />
              <SettingsRow label={t('settings.sapConnection.password')}>
                <div className="flex items-center gap-1.5">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    className="h-7 w-[200px] rounded-md border bg-transparent px-2 text-xs"
                    value={form.password}
                    placeholder={hasPassword ? t('settings.sapConnection.passwordStored') : ''}
                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                    autoComplete="off"
                  />
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setPasswordVisible(v => !v)}>
                    {passwordVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </SettingsRow>
              <SettingsInputRow
                label={t('settings.sapConnection.language')}
                value={form.language}
                onChange={(language) => setForm(f => ({ ...f, language }))}
                placeholder="KO"
              />
              <SettingsToggle
                label={t('settings.sapConnection.insecure')}
                description={t('settings.sapConnection.insecureDescription')}
                checked={form.insecure}
                onCheckedChange={(insecure) => setForm(f => ({ ...f, insecure }))}
              />
            </SettingsCard>

            {/* 접속 테스트 */}
            <div className="flex items-center gap-2 px-1">
              <Button variant="outline" size="sm" onClick={handleProbe} disabled={isProbing}>
                {isProbing ? <Spinner className="mr-1.5" /> : null}
                {t('settings.sapConnection.testConnection')}
              </Button>
              {probeResult && (
                <span className={`flex items-center gap-1 text-xs ${probeResult.ok ? 'text-success' : 'text-destructive'}`}>
                  {probeResult.ok
                    ? <CheckCircle2 className="h-3.5 w-3.5" />
                    : <XCircle className="h-3.5 w-3.5" />}
                  {t(`settings.sapConnection.probe.${probeResult.message}`)}
                </span>
              )}
            </div>
          </SettingsSection>

          {/* Save/Reset */}
          {error && (
            <p className="text-xs text-destructive px-1">{error}</p>
          )}
          {(isDirty || error) && (
            <SettingsCardFooter>
              <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Spinner className="mr-1.5" /> : null}
                Save
              </Button>
            </SettingsCardFooter>
          )}

        </div>
      </ScrollArea>
    </div>
  )
}
