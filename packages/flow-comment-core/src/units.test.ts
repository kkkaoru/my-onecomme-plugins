// Runs with bun.
import { expect, test } from 'vitest'

import { PX, px } from './units'

test('appends the pixel unit', () => {
  expect.hasAssertions()
  expect(px(0)).toBe('0px')
  expect(px(12)).toBe('12px')
})

test('keeps fractions and negatives', () => {
  expect.hasAssertions()
  expect(px(1.5)).toBe('1.5px')
  expect(px(-200)).toBe('-200px')
})

test('exports the unit itself for callers that build their own strings', () => {
  expect.hasAssertions()
  expect(PX).toBe('px')
})
