// Runs with bun.
import { expect, test } from 'vitest'

import { sanitizeConfig } from '../../settings/config'
import {
  THICK_OUTLINE_PX,
  selectBodyStyle,
  selectItemStyle,
  selectShadow,
  selectStroke,
} from './style'

const shadowOf = (overrides: Record<string, unknown>): string =>
  selectShadow(sanitizeConfig({ ...overrides, showShadow: true }))

test('builds the outline from width and colour', () => {
  expect.hasAssertions()
  expect(selectStroke(sanitizeConfig({ outlineColor: '#000000', outlineWidthPx: 3 }))).toBe(
    '3px #000000',
  )
})

test('omits the outline at zero width', () => {
  expect.hasAssertions()
  expect(selectStroke(sanitizeConfig({ outlineWidthPx: 0 }))).toBe('')
})

test('drops the shadow when it is disabled', () => {
  expect.hasAssertions()
  expect(selectShadow(sanitizeConfig({ shadowBlurPx: 6, showShadow: false }))).toBe('none')
})

test('drops the shadow when it would not be visible', () => {
  expect.hasAssertions()
  expect(shadowOf({ shadowBlurPx: 0, shadowOffsetXPx: 0, shadowOffsetYPx: 0 })).toBe('none')
})

test('builds the shadow from the four values', () => {
  expect.hasAssertions()
  expect(
    shadowOf({
      shadowBlurPx: 6,
      shadowColor: '#111111',
      shadowOffsetXPx: 2,
      shadowOffsetYPx: 3,
    }),
  ).toBe('2px 3px 6px #111111')
})

test('drops the shadow on a thick outline to save a paint pass', () => {
  expect.hasAssertions()
  expect(
    shadowOf({
      outlineWidthPx: THICK_OUTLINE_PX,
      shadowBlurPx: 6,
      shadowOffsetXPx: 2,
      shadowOffsetYPx: 2,
    }),
  ).toBe('none')
})

test('keeps the shadow just below the thick threshold', () => {
  expect.hasAssertions()
  expect(
    shadowOf({
      outlineWidthPx: THICK_OUTLINE_PX - 1,
      shadowBlurPx: 6,
      shadowOffsetXPx: 2,
      shadowOffsetYPx: 2,
    }),
  ).toBe('2px 2px 6px #000000')
})

test('puts the shadow on the box for a card', () => {
  expect.hasAssertions()
  const style = selectItemStyle(
    sanitizeConfig({ shadowBlurPx: 4, shadowOffsetXPx: 1, shadowOffsetYPx: 1, showShadow: true }),
    true,
  )
  expect([style.boxShadow, style.textShadow]).toStrictEqual(['1px 1px 4px #000000', ''])
})

test('puts the shadow on the text for a plain comment', () => {
  expect.hasAssertions()
  const style = selectItemStyle(
    sanitizeConfig({ shadowBlurPx: 4, shadowOffsetXPx: 1, shadowOffsetYPx: 1, showShadow: true }),
    false,
  )
  expect([style.boxShadow, style.textShadow]).toStrictEqual(['', '1px 1px 4px #000000'])
})

test('carries the layout and font settings', () => {
  expect.hasAssertions()
  const style = selectItemStyle(
    sanitizeConfig({
      fontFamily: 'Test',
      fontSizePx: 30,
      paddingBottomPx: 1,
      paddingLeftPx: 2,
      paddingRightPx: 3,
      paddingTopPx: 4,
    }),
    false,
  )
  expect([style.padding, style.fontFamily, style.fontSize]).toStrictEqual([
    '4px 3px 1px 2px',
    'Test',
    '30px',
  ])
})

test('applies the service colours to the body', () => {
  expect.hasAssertions()
  expect(
    selectBodyStyle({ bodyBackgroundColor: 'rgb(1, 2, 3)', bodyTextColor: 'rgb(4, 5, 6)' }),
  ).toStrictEqual({ background: 'rgb(1, 2, 3)', color: 'rgb(4, 5, 6)' })
})

test('leaves the body unset without service colours', () => {
  expect.hasAssertions()
  const empty = selectBodyStyle({})
  expect([empty.background, empty.color]).toStrictEqual([undefined, undefined])
})
