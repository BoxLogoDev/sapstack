/**
 * UI 모드 — 'simple'(현업: 개발자 표면 숨김) | 'standard'(기본).
 *
 * 값의 원천은 ~/.sapstack/config.yaml 의 ui_mode (관리자 프로비저닝 또는 설정이
 * 기록). App.tsx 가 environment.get() 결과에서 읽어 Provider 로 내려준다.
 */
import { createContext, useContext } from 'react'

export type UiMode = 'simple' | 'standard'

export const UiModeContext = createContext<UiMode>('standard')

export function useUiMode(): UiMode {
  return useContext(UiModeContext)
}
