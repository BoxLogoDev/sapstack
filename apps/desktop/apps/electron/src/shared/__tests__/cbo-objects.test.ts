import { describe, expect, test } from 'bun:test'
import { extractCboObjects, hasCboObject } from '../cbo-objects'

describe('extractCboObjects', () => {
  test('Z/Y 오브젝트 — 조사·소문자·모듈풀·함수그룹·클래스', () => {
    expect(extractCboObjects('ZFI0171이 뭐 하는 프로그램이에요?')).toEqual(['ZFI0171'])
    expect(extractCboObjects('zfi0171 저장 시 sapmzfi0010 화면 오류')).toEqual(['ZFI0171', 'SAPMZFI0010'])
    expect(extractCboObjects('SAPLZFI01 안의 ZCL_FI_UTIL 호출')).toEqual(['SAPLZFI01', 'ZCL_FI_UTIL'])
  })

  test('등장 순서 유지 + 중복 제거', () => {
    expect(extractCboObjects('ZFI0172, ZFI0171, zfi0172 다시')).toEqual(['ZFI0172', 'ZFI0171'])
  })

  test('영어 일반 단어(your/zero/yesterday)는 오브젝트가 아님', () => {
    expect(extractCboObjects('Your F110 run failed yesterday with zero output in zone 2')).toEqual([])
    expect(hasCboObject('Yes, the young analyst yields nothing')).toBe(false)
  })

  test('전부 대문자면 숫자·밑줄 없어도 오브젝트로 인정', () => {
    expect(extractCboObjects('ZFIREPORT is slow')).toEqual(['ZFIREPORT'])
  })
})
