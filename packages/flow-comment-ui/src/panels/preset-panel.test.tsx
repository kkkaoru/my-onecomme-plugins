import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
// @vitest-environment happy-dom
// Runs with bun.
import { clickAsync, exercise, mount, required, typeInto, translate } from '@testing/react'
import { act } from 'react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { createSettingsApi } from '../api'
import { PresetPanel } from './preset-panel'

interface Call {
  readonly init: RequestInit | undefined
  readonly url: string
}

// ポップアップが開くのを待つ回数。
const ATTEMPTS = 10

const calls: Call[] = []
const originalFetch = globalThis.fetch

const stubFetch = (status: number, payload: unknown): void => {
  vi.stubGlobal('fetch', (url: string, init?: RequestInit) => {
    calls.push({ init, url })
    return Promise.resolve(Response.json(payload, { status }))
  })
}

const read = (): FlowConfig => sanitizeConfig({ lanes: 2 })

const panel = (
  names: readonly string[] = [],
): {
  readonly container: HTMLElement
  readonly onApply: ReturnType<typeof vi.fn>
  readonly setStatus: ReturnType<typeof vi.fn>
} => {
  const onApply = vi.fn<() => void>()
  const setStatus = vi.fn<() => void>()
  const container = mount(
    <PresetPanel
      t={translate}
      api={createSettingsApi('/api/plugins/test')}
      current={read}
      initialNames={names}
      onApply={onApply}
      setStatus={setStatus}
    />,
  )
  return { container, onApply, setStatus }
}

const buttonNamed = (container: HTMLElement, text: string): Element => {
  const button = [...container.querySelectorAll('button')].find(
    (element) => element.textContent === text,
  )
  if (button === undefined) {
    throw new Error(`no button: ${text}`)
  }
  return button
}

const nameField = (container: HTMLElement): HTMLInputElement =>
  required(container.querySelector<HTMLInputElement>('#preset-name'), 'name field')

// 前のテストが残したポップアップを拾わないよう、毎回まっさらにする。
beforeEach(() => {
  document.body.replaceChildren()
})

afterEach(() => {
  calls.length = 0
  vi.unstubAllGlobals()
  globalThis.fetch = originalFetch
})

test('saves the current settings under the typed name', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: {} })
  const { container, setStatus } = panel()
  typeInto(nameField(container), '  夜の配信  ')
  await clickAsync(buttonNamed(container, 'buttonPresetSave'))
  expect(calls[0]?.url).toContain(`name=${encodeURIComponent('夜の配信')}`)
  expect(calls[0]?.init?.method).toBe('PUT')
  expect(setStatus).toHaveBeenCalledWith('presetSaved')
})

test('asks for a name before saving', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: {} })
  const { container, setStatus } = panel()
  await clickAsync(buttonNamed(container, 'buttonPresetSave'))
  expect(setStatus).toHaveBeenCalledWith('presetNameRequired')
  expect(calls).toHaveLength(0)
})

test('reports a failed save', async () => {
  expect.hasAssertions()
  stubFetch(404, { error: 'not found' })
  const { container, setStatus } = panel()
  typeInto(nameField(container), '夜の配信')
  await clickAsync(buttonNamed(container, 'buttonPresetSave'))
  expect(setStatus).toHaveBeenCalledWith('presetSaveFailed')
})

test('asks which preset to load', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: {} })
  const { container, onApply, setStatus } = panel(['夜の配信'])
  await clickAsync(buttonNamed(container, 'buttonPresetLoad'))
  expect(setStatus).toHaveBeenCalledWith('presetLoadFailed')
  expect(onApply).not.toHaveBeenCalled()
})

test('does nothing when asked to delete without a selection', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: {} })
  const { container } = panel(['夜の配信'])
  await clickAsync(buttonNamed(container, 'buttonPresetDelete'))
  expect(calls).toHaveLength(0)
})

test('shows the presets it was given', () => {
  expect.hasAssertions()
  const { container } = panel(['夜の配信', '朝の配信'])
  expect(container.querySelector('.fc-select')).not.toBeNull()
  expect(container.textContent).toContain('labelPresetSaved')
})

// base-ui のポップアップは非同期に開くので、選べるまで待つ。
const settle = async (): Promise<void> => {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
  })
}

const pickOption = async (
  container: HTMLElement,
  name: string,
  attempts = ATTEMPTS,
): Promise<void> => {
  const trigger = required(container.querySelector('.fc-select'), 'select trigger')
  if (trigger.textContent?.includes(name) === true) {
    return
  }
  if (attempts <= 0) {
    throw new Error(`could not pick ${name}`)
  }
  await clickAsync(trigger)
  await settle()
  const option = [...document.body.querySelectorAll('[role="option"]')].at(-1)
  if (option !== undefined) {
    await clickAsync(option)
    await settle()
  }
  await pickOption(container, name, attempts - 1)
}

test('loads the preset that was picked', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: { 夜の配信: { lanes: 7 } } })
  const { container, onApply } = panel(['夜の配信'])
  await pickOption(container, '夜の配信')
  await clickAsync(buttonNamed(container, 'buttonPresetLoad'))
  const applied = onApply.mock.calls[0]?.[0]
  expect(applied?.lanes).toBe(7)
  expect(onApply).toHaveBeenCalledWith(expect.anything(), 'presetLoaded')
})

test('removes the preset that was picked', async () => {
  expect.hasAssertions()
  stubFetch(200, { response: { 夜の配信: { lanes: 7 } } })
  const { container, setStatus } = panel(['夜の配信'])
  await pickOption(container, '夜の配信')
  await clickAsync(buttonNamed(container, 'buttonPresetDelete'))
  expect(calls[0]?.init?.method).toBe('DELETE')
  expect(setStatus).toHaveBeenCalledWith('presetDeleted')
})

test('keeps the panel through unchanged and changed props', () => {
  expect.hasAssertions()
  const setStatus = vi.fn<() => void>()
  const element = (
    <PresetPanel
      t={translate}
      api={createSettingsApi('/api/plugins/test')}
      current={read}
      initialNames={['夜の配信']}
      onApply={vi.fn<() => void>()}
      setStatus={setStatus}
    />
  )
  const container = exercise(
    element,
    <PresetPanel
      t={translate}
      api={createSettingsApi('/api/plugins/test')}
      current={read}
      initialNames={[]}
      onApply={vi.fn<() => void>()}
      setStatus={setStatus}
    />,
  )
  expect(container.querySelector('.fc-select')).not.toBeNull()
})
