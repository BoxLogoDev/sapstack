/**
 * 앱 사용자 로그인 상태(Entra ID) — main/identity.ts 의 IPC 결과를 트리에 내려준다.
 *
 * App.tsx 가 부팅 시 window.sapstack.auth.status() 로 채우고, 게이트(SignInGate)와
 * 설정 > 계정 섹션이 읽는다. status.kind === 'disabled' 면 로그인 기능 자체가 꺼진 배포다.
 */
import { createContext, useContext } from 'react'
import type { SignInState } from '../../shared/types'

export interface IdentityContextValue {
  state: SignInState
  signIn: () => Promise<SignInState>
  signOut: () => Promise<SignInState>
  refresh: () => Promise<SignInState>
}

const DISABLED: SignInState = { status: { kind: 'disabled' }, required: false }

export const IdentityContext = createContext<IdentityContextValue>({
  state: DISABLED,
  signIn: async () => DISABLED,
  signOut: async () => DISABLED,
  refresh: async () => DISABLED,
})

export function useIdentity(): IdentityContextValue {
  return useContext(IdentityContext)
}
