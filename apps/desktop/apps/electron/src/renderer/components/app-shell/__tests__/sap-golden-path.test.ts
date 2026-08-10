import { describe, expect, test } from 'bun:test'
import { buildGuidedChat, selectAdvisoryMode, type SymptomMatch } from '../sap-golden-path'

const match: SymptomMatch = {
  id: 'sym-f110-no-payment-method',
  symptom: 'F110 지급방법 오류',
  confidence: 1,
  likely_modules: ['FI'],
  first_check_tcodes: ['F110'],
}

describe('SAP Golden Path routing', () => {
  test('routes facts to Quick Advisory and incidents to a persisted Evidence Loop', () => {
    expect(selectAdvisoryMode('BSEG와 ACDOCA 차이가 뭐야?', [match])).toBe('quick')
    expect(selectAdvisoryMode('F110 돌렸는데 오류가 뜨네요', [match])).toBe('evidence')

    const chat = buildGuidedChat({
      query: 'F110 돌렸는데 오류가 뜨네요',
      mode: 'evidence',
      environment: {
        profile_version: 1,
        release: 'S4_2022',
        deployment: 'on_premise',
        industry: 'manufacturing',
        language: 'ko',
      },
      matches: [match],
      sessionId: 'sess-20260810-abc123',
    })
    expect(chat.name).toBe('SAP Evidence Loop')
    expect(chat.input).toContain('sess-20260810-abc123')
    expect(chat.input).toContain('Release=S4_2022')
    expect(chat.input).toContain('반증 조건 2개 이상')
  })
})
