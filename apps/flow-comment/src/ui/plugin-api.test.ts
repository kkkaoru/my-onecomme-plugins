import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
// @vitest-environment happy-dom
// Runs with bun.
import { afterEach, expect, test, vi } from 'vitest'

import {
  fetchPresets,
  fetchSettings,
  deletePreset,
  resetSettings,
  savePreset,
  saveSettings,
} from './plugin-api'

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

const stubFailure = (): void => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')))
}

afterEach(() => {
  calls.length = 0
  vi.unstubAllGlobals()
  globalThis.fetch = originalFetch
})

test('reads the settings out of the response envelope', async () => {
  expect.hasAssertions()
  stubFetch(200, { code: 200, response: { lanes: 7 } })
  const settings = await fetchSettings()
  expect(settings?.lanes).toBe(7)
})

test('asks for the plugin endpoint without caching', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: {} })
  await fetchSettings()
  expect(calls[0]?.url).toContain('/api/plugins/')
  expect(calls[0]?.init?.cache).toBe('no-store')
})

test('returns null when the plugin answers with an error', async () => {
  expect.hasAssertions()
  stubFetch(404, { error: 'not found' })
  expect(await fetchSettings()).toBeNull()
})

test('returns null when the envelope carries no response', async () => {
  expect.hasAssertions()
  stubFetch(200, { code: 200 })
  expect(await fetchSettings()).toBeNull()
})

test('returns null when the request throws', async () => {
  expect.hasAssertions()
  stubFailure()
  expect(await fetchSettings()).toBeNull()
})

test('returns null when the body is not an envelope', async () => {
  expect.hasAssertions()
  stubFetch(200, 'not json')
  expect(await fetchSettings()).toBeNull()
})

test('returns null when the envelope has no response field', async () => {
  expect.hasAssertions()
  stubFetch(200, { code: 200 })
  expect(await fetchSettings()).toBeNull()
})

test('saves the settings with PUT', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: { lanes: 3 } })
  const saved = await saveSettings(sanitizeConfig({ lanes: 3 }))
  expect([calls[0]?.init?.method, saved?.lanes]).toStrictEqual(['PUT', 3])
})

test('resets with DELETE', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: { lanes: 5 } })
  await resetSettings()
  expect(calls[0]?.init?.method).toBe('DELETE')
})

test('lists presets from the response object', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: { 夜: { lanes: 2 } } })
  expect(await fetchPresets()).toStrictEqual([['夜', { lanes: 2 }]])
})

test('returns no presets when the payload is not an object', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: 'nope' })
  expect(await fetchPresets()).toStrictEqual([])
})

test('sends the preset name as a query parameter', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: {} })
  expect(await savePreset('夜の配信', sanitizeConfig({}))).toBe(true)
  expect(calls[0]?.url).toContain(`name=${encodeURIComponent('夜の配信')}`)
  expect(calls[0]?.init?.method).toBe('PUT')
})

test('reports a failed preset save', async () => {
  expect.hasAssertions()
  stubFetch(500, {})
  expect(await savePreset('x', sanitizeConfig({}))).toBe(false)
})

test('deletes a preset by name', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: {} })
  expect(await deletePreset('夜')).toBe(true)
  expect(calls[0]?.init?.method).toBe('DELETE')
})

test('reports a failed preset delete', async () => {
  expect.hasAssertions()
  stubFetch(404, {})
  expect(await deletePreset('夜')).toBe(false)
})
