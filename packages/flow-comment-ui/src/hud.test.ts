import { expect, test } from 'vitest'

import { HUD_PARAM, metricsWanted } from './hud'

test('keeps the HUD off without the query', () => {
  expect.hasAssertions()
  expect(metricsWanted('')).toBe(false)
  expect(metricsWanted('?v=1')).toBe(false)
})

test('turns the HUD on with the query', () => {
  expect.hasAssertions()
  expect(metricsWanted(`?${HUD_PARAM}=1`)).toBe(true)
})
