// Runs with bun.
import { expect, test } from 'vitest'

import { DEFAULT_CONFIG } from './defaults'
import { BASE_FONT_FAMILIES, cssFontFamily, familyOf, matchingFonts } from './fonts'

test('ships a candidate list that covers the common Japanese fonts', () => {
  expect.hasAssertions()
  expect(BASE_FONT_FAMILIES).not.toContain(DEFAULT_CONFIG.fontFamily)
  expect(BASE_FONT_FAMILIES).toContain('Hiragino Kaku Gothic ProN')
  expect(BASE_FONT_FAMILIES).toContain('sans-serif')
})

test('keeps a family name for the CSSOM', () => {
  expect.hasAssertions()
  expect(cssFontFamily('Hiragino Sans')).toBe('Hiragino Sans')
  expect(cssFontFamily('sans-serif')).toBe('sans-serif')
  expect(cssFontFamily('')).toBe('sans-serif')
})

test('strips the quotes document.fonts adds around family names', () => {
  expect.hasAssertions()
  expect(familyOf('"Hiragino Sans"')).toBe('Hiragino Sans')
  expect(familyOf("'Noto Sans JP'")).toBe('Noto Sans JP')
})

test('returns every candidate when the filter is empty', () => {
  expect.hasAssertions()
  const names = matchingFonts(['b', 'a'], '')
  expect(names).toStrictEqual(['a', 'b'])
})

test('filters case-insensitively and ignores surrounding spaces', () => {
  expect.hasAssertions()
  const names = matchingFonts(['Noto Sans JP', 'Roboto', 'Hiragino Sans'], '  noto ')
  expect(names).toStrictEqual(['Noto Sans JP'])
})

test('sorts with the Japanese collation so the list is stable', () => {
  expect.hasAssertions()
  expect(matchingFonts(['Yu Gothic', 'Arial', 'BIZ UDGothic'], '')).toStrictEqual([
    'Arial',
    'BIZ UDGothic',
    'Yu Gothic',
  ])
})
