import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ServerCog } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { StepFormLayout, ContinueButton } from './primitives'
import type { SapEnvironmentProfile } from '../../../shared/types'

interface SapEnvironmentStepProps {
  initialError?: string
  onComplete: (profile: SapEnvironmentProfile) => void
}

const fieldClassName = 'space-y-1.5'
const labelClassName = 'text-xs font-medium text-foreground'
const selectClassName = 'flex h-9 w-full rounded-md border border-foreground/15 bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30'

/**
 * Required SAP context captured before any advice or diagnosis can be created.
 * Deliberately excludes company code, account and organisation defaults.
 */
export function SapEnvironmentStep({ initialError, onComplete }: SapEnvironmentStepProps) {
  const { t, i18n } = useTranslation()
  const [release, setRelease] = useState<SapEnvironmentProfile['release'] | ''>('')
  const [deployment, setDeployment] = useState<SapEnvironmentProfile['deployment'] | ''>('')
  const [industry, setIndustry] = useState('')
  // 응답 언어는 UI 언어에서 프리필 — 같은 질문을 두 번 하지 않는다 (zh-Hans → zh)
  const uiLanguageBase = (i18n.resolvedLanguage ?? 'ko').split('-')[0]
  const prefillLanguage = (['ko', 'en', 'de', 'ja', 'zh'].includes(uiLanguageBase)
    ? uiLanguageBase
    : 'ko') as SapEnvironmentProfile['language']
  const [language, setLanguage] = useState<SapEnvironmentProfile['language']>(prefillLanguage)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(initialError)

  // 업종은 선택 — 현업이 답하기 어려운 필드로 첫 화면을 막지 않는다
  const isValid = Boolean(release && deployment && language)

  const save = async () => {
    if (!release || !deployment || !language || saving) return
    setSaving(true)
    setError(undefined)
    try {
      const profile = await window.sapstack.environment.save({
        release,
        deployment,
        industry: industry.trim() || t('onboarding.sapEnvironment.industryUnspecified'),
        language,
      })
      onComplete(profile)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('onboarding.sapEnvironment.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <StepFormLayout
      icon={<ServerCog />}
      title={t('onboarding.sapEnvironment.title')}
      description={t('onboarding.sapEnvironment.description')}
      actions={
        <ContinueButton disabled={!isValid} loading={saving} loadingText={t('onboarding.sapEnvironment.saving')} onClick={save} className="w-full">
          {t('onboarding.sapEnvironment.continue')}
        </ContinueButton>
      }
    >
      <div className="space-y-4">
        <div className={fieldClassName}>
          <label className={labelClassName} htmlFor="sap-release">{t('onboarding.sapEnvironment.release')}</label>
          <select id="sap-release" className={selectClassName} value={release} onChange={(event) => setRelease(event.target.value as SapEnvironmentProfile['release'] | '')}>
            <option value="">{t('onboarding.sapEnvironment.releasePlaceholder')}</option>
            <option value="ECC6_EhP7">{t('onboarding.sapEnvironment.releaseEccEhp7')}</option>
            <option value="ECC6_EhP8">{t('onboarding.sapEnvironment.releaseEccEhp8')}</option>
            <option value="S4_2020">{t('onboarding.sapEnvironment.releaseS4_2020')}</option>
            <option value="S4_2021">{t('onboarding.sapEnvironment.releaseS4_2021')}</option>
            <option value="S4_2022">{t('onboarding.sapEnvironment.releaseS4_2022')}</option>
            <option value="S4_2023">{t('onboarding.sapEnvironment.releaseS4_2023')}</option>
            <option value="S4_2024">{t('onboarding.sapEnvironment.releaseS4_2024')}</option>
            <option value="RISE">{t('onboarding.sapEnvironment.releaseRise')}</option>
            <option value="PublicCloud">{t('onboarding.sapEnvironment.releasePublicCloud')}</option>
          </select>
        </div>

        <div className={fieldClassName}>
          <label className={labelClassName} htmlFor="sap-deployment">{t('onboarding.sapEnvironment.deployment')}</label>
          <select id="sap-deployment" className={selectClassName} value={deployment} onChange={(event) => setDeployment(event.target.value as SapEnvironmentProfile['deployment'] | '')}>
            <option value="">{t('onboarding.sapEnvironment.deploymentPlaceholder')}</option>
            <option value="on_premise">{t('onboarding.sapEnvironment.deploymentOnPremise')}</option>
            <option value="private_cloud">{t('onboarding.sapEnvironment.deploymentPrivateCloud')}</option>
            <option value="public_cloud">{t('onboarding.sapEnvironment.deploymentPublicCloud')}</option>
          </select>
        </div>

        <div className={fieldClassName}>
          <label className={labelClassName} htmlFor="sap-industry">
            {t('onboarding.sapEnvironment.industry')}
            <span className="ml-1 font-normal text-muted-foreground">{t('onboarding.sapEnvironment.optionalTag')}</span>
          </label>
          <Input
            id="sap-industry"
            value={industry}
            onChange={(event) => setIndustry(event.target.value)}
            placeholder={t('onboarding.sapEnvironment.industryPlaceholder')}
            autoComplete="organization-title"
          />
        </div>

        <div className={fieldClassName}>
          <label className={labelClassName} htmlFor="sap-language">{t('onboarding.sapEnvironment.responseLanguage')}</label>
          <select id="sap-language" className={selectClassName} value={language} onChange={(event) => setLanguage(event.target.value as SapEnvironmentProfile['language'])}>
            <option value="ko">{t('onboarding.sapEnvironment.languageKo')}</option>
            <option value="en">{t('onboarding.sapEnvironment.languageEn')}</option>
            <option value="de">{t('onboarding.sapEnvironment.languageDe')}</option>
            <option value="ja">{t('onboarding.sapEnvironment.languageJa')}</option>
            <option value="zh">{t('onboarding.sapEnvironment.languageZh')}</option>
          </select>
        </div>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </div>
    </StepFormLayout>
  )
}
