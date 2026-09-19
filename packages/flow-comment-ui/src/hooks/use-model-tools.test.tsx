import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
// @vitest-environment happy-dom
// Runs with bun.
import { mountWithUpdate, required, translate } from '@testing/react'
import { afterEach, expect, test, vi } from 'vitest'

import { createSettingsApi } from '../api'
import type { ModelTool, ModelToolWiring } from '../model-tools'
import { useModelTools } from './use-model-tools'

type Spy = ReturnType<typeof vi.fn<() => void>>

const Probe = ({ wiring }: { readonly wiring: ModelToolWiring }): null => {
  useModelTools(wiring)
  return null
}

// 画面と同じく、3つの口は使い回したまま中身だけが最新になる。
const api = createSettingsApi('/api/plugins/test')

const wire = (current: () => FlowConfig, applied: Spy, status: Spy): ModelToolWiring => ({
  api,
  apply: applied,
  current,
  setStatus: status,
  t: translate,
})

const emptyCurrent = (): FlowConfig => sanitizeConfig({})

const registered: ModelTool[] = []
const registerTool = (tool: ModelTool): void => {
  registered.push(tool)
}

const withModelContext = (): void => {
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    value: { registerTool },
  })
}

afterEach(() => {
  Reflect.deleteProperty(document, 'modelContext')
  registered.length = 0
  vi.restoreAllMocks()
})

test('registers the tools once, even when the settings change', () => {
  expect.hasAssertions()
  withModelContext()
  let lanes = 2
  const current = (): FlowConfig => sanitizeConfig({ lanes })
  const applied = vi.fn<() => void>()
  const status = vi.fn<() => void>()
  const { update } = mountWithUpdate(<Probe wiring={wire(current, applied, status)} />)
  lanes = 5
  update(<Probe wiring={wire(current, applied, status)} />)
  expect(registered.length).toBe(4)
})

test('handed tools read the settings as they are now', async () => {
  expect.hasAssertions()
  withModelContext()
  let lanes = 2
  const current = (): FlowConfig => sanitizeConfig({ lanes })
  const applied = vi.fn<() => void>()
  const status = vi.fn<() => void>()
  const { update } = mountWithUpdate(<Probe wiring={wire(current, applied, status)} />)
  lanes = 7
  update(<Probe wiring={wire(current, applied, status)} />)
  const [reader] = registered
  expect(JSON.parse(String(await required(reader, 'reader').execute({}))).lanes).toBe(7)
})

test('says so when the browser has no model context', () => {
  expect.hasAssertions()
  const info = vi.spyOn(console, 'info').mockReturnValue()
  mountWithUpdate(<Probe wiring={wire(emptyCurrent, vi.fn<() => void>(), vi.fn<() => void>())} />)
  expect(info).toHaveBeenCalledWith('[flow-comment] WebMCP 未対応のため設定ツールは登録しません')
})

test('tells the registry when the tools are ready', () => {
  expect.hasAssertions()
  const info = vi.spyOn(console, 'info').mockReturnValue()
  withModelContext()
  mountWithUpdate(<Probe wiring={wire(emptyCurrent, vi.fn<() => void>(), vi.fn<() => void>())} />)
  expect(info).toHaveBeenCalledWith('[flow-comment] WebMCP に設定ツールを登録しました')
})
