// Runs with bun.
import { expect, test } from 'vitest'

import plugin, { isNgComment } from './plugin'

test('drops comments that start with the ng prefix', () => {
  expect.hasAssertions()
  expect(plugin.filterComment({ data: { comment: '!ng spam' } })).toBe(false)
})

test('keeps comments that do not start with the ng prefix', () => {
  expect.hasAssertions()
  expect(plugin.filterComment({ data: { comment: 'hello' } })).toStrictEqual({
    data: { comment: 'hello' },
  })
})

test('detects the ng prefix', () => {
  expect.hasAssertions()
  expect(isNgComment({ data: { comment: '!ng' } })).toBe(true)
  expect(isNgComment({ data: { comment: '!ngx' } })).toBe(true)
  expect(isNgComment({ data: { comment: 'good' } })).toBe(false)
})
