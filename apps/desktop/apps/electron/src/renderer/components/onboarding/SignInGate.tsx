import { useState } from "react"
import { useTranslation } from "react-i18next"
import { LogIn, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@sapstack-desktop/ui"
import { StepFormLayout } from "./primitives"
import type { SignInState } from "../../../shared/types"

interface SignInGateProps {
  state: SignInState
  onSignIn: () => Promise<SignInState>
}

/**
 * SignInGate — 접근 통제 화면. 스플래시 직후·온보딩 이전에 뜬다.
 *
 * 접근 허용 여부는 Entra(앱 할당·그룹)가 결정하고, 여기서는 그 결과(사유)를 사람이 읽을
 * 문장으로 보여준다. misconfigured 는 fail closed — 버튼 없이 관리자 문의만 안내한다.
 */
export function SignInGate({ state, onSignIn }: SignInGateProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const status = state.status
  const reason = status.kind === 'signed_out' ? status.reason : undefined
  const detail = status.kind === 'signed_out' ? status.detail : undefined
  const misconfigured = reason === 'misconfigured'

  const handleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const next = await onSignIn()
      if (next.status.kind === 'signed_out' && next.status.reason === 'never_signed_in' && next.status.detail) {
        setError(t('signIn.failed', { error: next.status.detail }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  // never_signed_in 은 첫 방문 — 사유 문구 없이 안내만
  const reasonText = reason && reason !== 'never_signed_in'
    ? t(`signIn.reason.${reason}`, { detail: detail ?? '' })
    : null

  return (
    <div className="flex min-h-screen flex-col bg-foreground-2">
      <div className="titlebar-drag-region fixed top-0 left-0 right-0 h-[50px] z-titlebar" />
      <main className="flex flex-1 items-center justify-center p-8">
        <StepFormLayout
          iconElement={
            <div className="flex size-16 items-center justify-center rounded-full bg-info/10">
              {misconfigured ? <ShieldAlert className="size-8 text-destructive" /> : <LogIn className="size-8 text-info" />}
            </div>
          }
          title={t('signIn.title')}
          description={
            <>
              {t('signIn.description')}
              {reasonText && (
                <span className="text-muted-foreground/80 text-sm mt-3 block">{reasonText}</span>
              )}
            </>
          }
          actions={
            misconfigured ? null : (
              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full max-w-[320px] bg-background shadow-minimal text-foreground hover:bg-foreground/5 rounded-lg"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    {t('signIn.signingIn')}
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 size-4" />
                    {reason && reason !== 'never_signed_in' ? t('signIn.retry') : t('signIn.button')}
                  </>
                )}
              </Button>
            )
          }
        >
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </StepFormLayout>
      </main>
    </div>
  )
}
