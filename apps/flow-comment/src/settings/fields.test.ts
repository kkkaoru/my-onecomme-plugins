// Runs with bun.
import { expect, test } from 'vitest'

import { FIELD_SPECS } from './fields'

test('exposes a unique control for every config field', () => {
  expect.hasAssertions()
  const keys = FIELD_SPECS.map((spec) => spec.key)
  expect(FIELD_SPECS).toHaveLength(new Set(keys).size)
  expect(keys).toContain('direction')
  expect(keys).toContain('nameColor')
})
