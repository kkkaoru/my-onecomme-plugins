import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import { expect, test } from 'vitest'

import { publishSettings, subscribeSettings } from './settings-sync'

const noop = (): boolean => false

test('does not throw when publishing settings', () => {
  expect.hasAssertions()
  expect(() => {
    publishSettings(sanitizeConfig({ lanes: 4 }))
  }).not.toThrow()
})

test('returns an unsubscribe function', () => {
  expect.hasAssertions()
  const stop = subscribeSettings(noop)
  expect(stop).toBeTypeOf('function')
  stop()
})
