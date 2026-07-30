import { useState } from 'react'
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
  const [release, setRelease] = useState<SapEnvironmentProfile['release'] | ''>('')
  const [deployment, setDeployment] = useState<SapEnvironmentProfile['deployment'] | ''>('')
  const [industry, setIndustry] = useState('')
  const [language, setLanguage] = useState<SapEnvironmentProfile['language']>('ko')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(initialError)

  const isValid = Boolean(release && deployment && industry.trim() && language)

  const save = async () => {
    if (!release || !deployment || !industry.trim() || !language || saving) return
    setSaving(true)
    setError(undefined)
    try {
      const profile = await window.sapstack.environment.save({
        release,
        deployment,
        industry: industry.trim(),
        language,
      })
      onComplete(profile)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'SAP 환경 프로필을 저장하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <StepFormLayout
      icon={<ServerCog />}
      title="SAP 환경을 먼저 설정해 주세요"
      description="sapstack은 Release와 배포 모델에 따라 다른 절차를 안내합니다. 회사코드·계정·조직값은 자동으로 만들지 않습니다."
      actions={
        <ContinueButton disabled={!isValid} loading={saving} loadingText="저장 중…" onClick={save} className="w-full">
          환경 저장 후 계속
        </ContinueButton>
      }
    >
      <div className="space-y-4">
        <div className={fieldClassName}>
          <label className={labelClassName} htmlFor="sap-release">SAP Release</label>
          <select id="sap-release" className={selectClassName} value={release} onChange={(event) => setRelease(event.target.value as SapEnvironmentProfile['release'] | '')}>
            <option value="">Release 선택</option>
            <option value="ECC6_EhP7">ECC 6.0 EhP7</option>
            <option value="ECC6_EhP8">ECC 6.0 EhP8</option>
            <option value="S4_2020">S/4HANA 2020</option>
            <option value="S4_2021">S/4HANA 2021</option>
            <option value="S4_2022">S/4HANA 2022</option>
            <option value="S4_2023">S/4HANA 2023</option>
            <option value="S4_2024">S/4HANA 2024</option>
            <option value="RISE">RISE with SAP</option>
            <option value="PublicCloud">S/4HANA Public Cloud</option>
          </select>
        </div>

        <div className={fieldClassName}>
          <label className={labelClassName} htmlFor="sap-deployment">배포 모델</label>
          <select id="sap-deployment" className={selectClassName} value={deployment} onChange={(event) => setDeployment(event.target.value as SapEnvironmentProfile['deployment'] | '')}>
            <option value="">배포 모델 선택</option>
            <option value="on_premise">On-Premise</option>
            <option value="private_cloud">RISE / Private Cloud</option>
            <option value="public_cloud">Public Cloud</option>
          </select>
        </div>

        <div className={fieldClassName}>
          <label className={labelClassName} htmlFor="sap-industry">업종</label>
          <Input
            id="sap-industry"
            value={industry}
            onChange={(event) => setIndustry(event.target.value)}
            placeholder="예: 제조, 유통, 금융"
            autoComplete="organization-title"
          />
        </div>

        <div className={fieldClassName}>
          <label className={labelClassName} htmlFor="sap-language">응답 언어</label>
          <select id="sap-language" className={selectClassName} value={language} onChange={(event) => setLanguage(event.target.value as SapEnvironmentProfile['language'])}>
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </select>
        </div>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </div>
    </StepFormLayout>
  )
}
