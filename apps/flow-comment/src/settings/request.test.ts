// Runs with bun.
import { expect, test } from 'vitest'

import { handleRequest } from './request'
import { readSettings } from './store'
import type { OneCommeStore, PluginRequest, PluginResponse } from './types'

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

const request = (req: Partial<PluginRequest> & { readonly method: string }): PluginRequest => ({
  url: '/',
  ...req,
})

const responseOf = (payload: PluginResponse): unknown => payload.response

test('returns the current settings over GET', () => {
  expect.hasAssertions()
  const store = createStore({ lanes: 7 })
  const result = handleRequest(store, request({ method: 'GET' }))
  expect([result.code, responseOf(result)]).toStrictEqual([200, readSettings(store)])
})

test('accepts a lowercase method', () => {
  expect.hasAssertions()
  expect(handleRequest(createStore(), request({ method: 'get' })).code).toBe(200)
})

test('persists sanitised settings over PUT', () => {
  expect.hasAssertions()
  const store = createStore()
  const result = handleRequest(store, request({ body: { lanes: 3 }, method: 'PUT' }))
  expect([result.code, readSettings(store).lanes]).toStrictEqual([200, 3])
})

test('does not reset omitted fields over PUT', () => {
  expect.hasAssertions()
  const store = createStore({ lanes: 3, textColor: '#ff0000' })
  handleRequest(store, request({ body: { lanes: 8 }, method: 'PUT' }))
  expect([readSettings(store).lanes, readSettings(store).textColor]).toStrictEqual([8, '#ff0000'])
})

test('accepts POST as a save', () => {
  expect.hasAssertions()
  const store = createStore()
  expect(handleRequest(store, request({ body: { lanes: 2 }, method: 'POST' })).code).toBe(200)
  expect(readSettings(store).lanes).toBe(2)
})

test('restores defaults over DELETE', () => {
  expect.hasAssertions()
  const store = createStore({ lanes: 12 })
  const result = handleRequest(store, request({ method: 'DELETE' }))
  expect([result.code, readSettings(store).lanes]).toStrictEqual([200, 5])
})

test('rejects unsupported methods', () => {
  expect.hasAssertions()
  const result = handleRequest(createStore(), request({ method: 'PATCH' }))
  expect([result.code, responseOf(result)]).toStrictEqual([404, {}])
})

const presetNamesOf = (response: unknown): string[] => {
  if (typeof response !== 'object' || response === null) {
    return []
  }
  return Object.entries(response).map(([name]) => name)
}

test('saves a preset under a name and lists it', () => {
  expect.hasAssertions()
  const store = createStore()
  handleRequest(
    store,
    request({ body: { lanes: 7 }, method: 'PUT', params: { action: 'presets', name: 'よる' } }),
  )
  const listed = handleRequest(store, request({ method: 'GET', params: { action: 'presets' } }))
  expect(presetNamesOf(listed.response)).toStrictEqual(['よる'])
})

test('deletes a preset over the API', () => {
  expect.hasAssertions()
  const store = createStore()
  handleRequest(
    store,
    request({ body: { lanes: 7 }, method: 'PUT', params: { action: 'presets', name: 'A' } }),
  )
  const deleted = handleRequest(
    store,
    request({ method: 'DELETE', params: { action: 'presets', name: 'A' } }),
  )
  expect(deleted.response).toStrictEqual({ deleted: true })
  const listed = handleRequest(store, request({ method: 'GET', params: { action: 'presets' } }))
  expect(presetNamesOf(listed.response)).toStrictEqual([])
})

test('treats a preset request without a name as a settings request', () => {
  expect.hasAssertions()
  const store = createStore()
  const result = handleRequest(
    store,
    request({ body: { lanes: 4 }, method: 'PUT', params: { action: 'presets' } }),
  )
  expect([result.code, readSettings(store).lanes]).toStrictEqual([200, 4])
})
