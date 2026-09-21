import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
// @vitest-environment happy-dom
// Runs with bun.
import { afterEach, expect, test, vi } from 'vitest'

import type { SettingsApi } from './api'
import { createSettingsApi } from './api'

interface Call {
  readonly init: RequestInit | undefined
  readonly url: string
}

const calls: Call[] = []
const originalFetch = globalThis.fetch

const stubFetch = (status: number, payload: unknown): void => {
  vi.stubGlobal('fetch', (url: string, init?: RequestInit) => {
    calls.push({ init, url })
    return Promise.resolve(Response.json(payload, { status }))
  })
}

const api = (): SettingsApi => createSettingsApi('/api/plugins/test')

afterEach(() => {
  calls.length = 0
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  globalThis.fetch = originalFetch
})

test('reads the settings out of the response envelope', async () => {
  expect.hasAssertions()
  stubFetch(200, { code: 200, response: { lanes: 7 } })
  const settings = await api().fetchSettings()
  expect(settings?.lanes).toBe(7)
})

test('asks the given endpoint without caching', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: {} })
  await api().fetchSettings()
  expect(calls[0]?.url).toContain('/api/plugins/test')
  expect(calls[0]?.init?.cache).toBe('no-store')
})

test('returns null when the plugin answers with an error', async () => {
  expect.hasAssertions()
  stubFetch(404, { error: 'not found' })
  expect(await api().fetchSettings()).toBeNull()
})

test('reads a bare settings body', async () => {
  expect.hasAssertions()
  stubFetch(200, { lanes: 6 })
  const settings = await api().fetchSettings()
  expect(settings?.lanes).toBe(6)
})

test('returns null when the envelope carries no response', async () => {
  expect.hasAssertions()
  stubFetch(200, { code: 200 })
  expect(await api().fetchSettings()).toBeNull()
})

test('returns null when the request never arrives', async () => {
  expect.hasAssertions()
  vi.spyOn(console, 'info').mockReturnValue()
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')))
  expect(await api().fetchSettings()).toBeNull()
})

test('saves the settings and reads them back', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: { lanes: 3 } })
  const saved = await api().saveSettings(sanitizeConfig({ lanes: 3 }))
  expect(calls[0]?.init?.method).toBe('PUT')
  expect(calls[0]?.init?.headers).toStrictEqual({ 'content-type': 'application/json' })
  expect(JSON.parse(String(calls[0]?.init?.body)).lanes).toBe(3)
  expect(saved?.lanes).toBe(3)
})

test('asks the plugin to reset', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: {} })
  await api().resetSettings()
  expect(calls[0]?.init?.method).toBe('DELETE')
})

test('lists the stored presets as entries', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: { 夜の配信: {}, 朝の配信: {} } })
  const entries = await api().fetchPresets()
  expect(entries.map(([name]) => name)).toStrictEqual(['夜の配信', '朝の配信'])
})

test('saves a preset under an encoded name', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: {} })
  const saved = await api().savePreset('夜の配信', sanitizeConfig({}))
  expect(saved).toBe(true)
  expect(calls[0]?.url).toContain(`name=${encodeURIComponent('夜の配信')}`)
})

test('reports a preset that could not be stored', async () => {
  expect.hasAssertions()
  stubFetch(404, { error: 'not found' })
  expect(await api().savePreset('夜の配信', sanitizeConfig({}))).toBe(false)
})

test('deletes a preset by name', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: {} })
  expect(await api().deletePreset('夜の配信')).toBe(true)
  expect(calls[0]?.url).toContain(`name=${encodeURIComponent('夜の配信')}`)
  expect(calls[0]?.init?.method).toBe('DELETE')
})

test('returns null when the plugin answers with something that is not an object', async () => {
  expect.hasAssertions()
  stubFetch(200, [1, 2, 3])
  expect(await api().fetchSettings()).toBeNull()
})
