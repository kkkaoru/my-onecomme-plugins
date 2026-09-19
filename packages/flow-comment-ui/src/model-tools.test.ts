import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import { required, translate } from '@testing/react'
// @vitest-environment happy-dom
// Runs with bun.
import { afterEach, expect, test, vi } from 'vitest'

import { createSettingsApi } from './api'
import { buildModelTools, resolveModelContext } from './model-tools'
import type { ModelTool, ModelToolWiring } from './model-tools'

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

const api = createSettingsApi('/api/plugins/test')

const wiring = (overrides: Partial<ModelToolWiring> = {}): ModelToolWiring => ({
  api,
  apply: vi.fn<() => void>(),
  current: () => sanitizeConfig({ lanes: 2 }),
  setStatus: vi.fn<() => void>(),
  t: translate,
  ...overrides,
})

const toolNamed = (wiringValue: ModelToolWiring, name: string): ModelTool => {
  const tool = required(
    buildModelTools(wiringValue).find((entry) => entry.name === name),
    'tool',
  )
  return tool
}

afterEach(() => {
  calls.length = 0
  vi.unstubAllGlobals()
  globalThis.fetch = originalFetch
  Reflect.deleteProperty(document, 'modelContext')
  Reflect.deleteProperty(navigator, 'modelContext')
})

test('publishes one tool per operation', () => {
  expect.hasAssertions()
  const names = buildModelTools(wiring()).map((tool) => tool.name)
  expect(names).toStrictEqual([
    'get_flow_comment_settings',
    'update_flow_comment_settings',
    'list_flow_comment_presets',
    'save_flow_comment_preset',
  ])
})

test('reads back the current settings as JSON', async () => {
  expect.hasAssertions()
  const tool = toolNamed(wiring(), 'get_flow_comment_settings')
  const result = String(await tool.execute({}))
  expect(JSON.parse(result).lanes).toBe(2)
})

test('applies and stores a partial update', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: { lanes: 9 } })
  const apply = vi.fn<(next: FlowConfig, message: string) => void>()
  const setStatus = vi.fn<(message: string) => void>()
  const tool = toolNamed(wiring({ apply, setStatus }), 'update_flow_comment_settings')
  const result = String(await tool.execute({ settings: { lanes: 9 } }))
  expect(apply.mock.calls.length).toBe(1)
  expect(JSON.parse(result).lanes).toBe(9)
  expect(setStatus).toHaveBeenCalledWith('設定を更新しました。')
})

test('keeps the current values for keys the update leaves out', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: {} })
  const apply = vi.fn<(next: FlowConfig, message: string) => void>()
  const tool = toolNamed(wiring({ apply }), 'update_flow_comment_settings')
  await tool.execute({ settings: { lanes: 9 } })
  const next = apply.mock.calls[0]?.[0]
  expect(next?.maxItems).toBe(sanitizeConfig({}).maxItems)
})

test('reports a failed update', async () => {
  expect.hasAssertions()
  stubFetch(404, { error: 'not found' })
  const setStatus = vi.fn<(message: string) => void>()
  const tool = toolNamed(wiring({ setStatus }), 'update_flow_comment_settings')
  expect(await tool.execute({ settings: { lanes: 9 } })).toBe('failed')
  expect(setStatus).toHaveBeenCalledWith('saveFailed')
})

test('lists the stored preset names', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: { 夜の配信: {}, 朝の配信: {} } })
  const tool = toolNamed(wiring(), 'list_flow_comment_presets')
  expect(JSON.parse(String(await tool.execute({})))).toStrictEqual(['夜の配信', '朝の配信'])
})

test('stores the current settings under a preset name', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: {} })
  const tool = toolNamed(wiring(), 'save_flow_comment_preset')
  expect(await tool.execute({ name: ' 夜の配信 ' })).toBe('saved 夜の配信')
  expect(calls[0]?.url).toContain(encodeURIComponent('夜の配信'))
})

test('refuses a preset without a name', async () => {
  expect.hasAssertions()
  const tool = toolNamed(wiring(), 'save_flow_comment_preset')
  expect(await tool.execute({ name: '   ' })).toBe('name is required')
})

test('reports a preset that could not be stored', async () => {
  expect.hasAssertions()
  stubFetch(404, { error: 'not found' })
  const tool = toolNamed(wiring(), 'save_flow_comment_preset')
  expect(await tool.execute({ name: '夜の配信' })).toBe('failed')
})

test('finds no model context when the browser has none', () => {
  expect.hasAssertions()
  expect(resolveModelContext()).toBeNull()
})

test('accepts the document model context', () => {
  expect.hasAssertions()
  const context = { registerTool: vi.fn<() => void>() }
  Object.defineProperty(document, 'modelContext', { configurable: true, value: context })
  expect(resolveModelContext()).toBe(context)
})

test('accepts the navigator model context during the migration', () => {
  expect.hasAssertions()
  const context = { registerTool: vi.fn<() => void>() }
  Reflect.deleteProperty(document, 'modelContext')
  Object.defineProperty(navigator, 'modelContext', { configurable: true, value: context })
  expect(resolveModelContext()).toBe(context)
})
