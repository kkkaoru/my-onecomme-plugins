// Runs with bun.
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import { expect, test } from 'vitest'

import {
  deletePreset,
  readPresets,
  readSettings,
  resetSettings,
  savePreset,
  saveSettings,
} from './store'
import type { OneCommeStore } from './types'

const createStore = (settings?: unknown): OneCommeStore => {
  const values = new Map<string, unknown>()
  if (settings !== undefined) {
    values.set('settings', settings)
  }
  return {
    get: (key) => values.get(key),
    set: (key, value) => {
      values.set(key, value)
    },
  }
}

test('reads defaults from an empty store', () => {
  expect.hasAssertions()
  expect(readSettings(createStore()).lanes).toBe(5)
})

test('clamps settings read from the store', () => {
  expect.hasAssertions()
  const store = createStore({ lanes: 9000, opacity: -4 })
  expect([readSettings(store).lanes, readSettings(store).opacity]).toStrictEqual([50, 0])
})

test('persists sanitised settings', () => {
  expect.hasAssertions()
  const store = createStore()
  saveSettings(store, { lanes: 3, textColor: '#ff0000' })
  expect([readSettings(store).lanes, readSettings(store).textColor]).toStrictEqual([3, '#ff0000'])
})

test('clamps before persisting an out of range body', () => {
  expect.hasAssertions()
  const store = createStore()
  saveSettings(store, { lanes: 999 })
  expect(readSettings(store).lanes).toBe(50)
})

test('restores defaults', () => {
  expect.hasAssertions()
  const store = createStore({ lanes: 12 })
  resetSettings(store)
  expect(readSettings(store).lanes).toBe(5)
})

test('clamps a preset when it is saved', () => {
  expect.hasAssertions()
  const store = createStore()
  savePreset(store, 'A', { lanes: 9999 })
  expect(readPresets(store).get('A')).toStrictEqual(sanitizeConfig({ lanes: 9999 }))
})

test('keeps the current settings when a preset is saved', () => {
  expect.hasAssertions()
  const store = createStore({ lanes: 2 })
  savePreset(store, 'A', { lanes: 8 })
  expect(readSettings(store).lanes).toBe(2)
})

test('deletes a preset', () => {
  expect.hasAssertions()
  const store = createStore()
  savePreset(store, 'A', { lanes: 7 })
  expect(deletePreset(store, 'A')).toBe(true)
  expect([...readPresets(store).keys()]).toStrictEqual([])
})

test('ignores a malformed presets value', () => {
  expect.hasAssertions()
  const store = createStore()
  store.set('presets', 'not a record')
  expect(readPresets(store).size).toBe(0)
})
