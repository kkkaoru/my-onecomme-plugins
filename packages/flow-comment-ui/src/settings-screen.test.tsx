import type { FormatLabel } from '@my-onecomme-plugins/flow-comment-core/comment'
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
// @vitest-environment happy-dom
// Runs with bun.
import { advance, click, clickAsync, exercise, mount, required, translate } from '@testing/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { createSettingsApi } from './api'
import { SettingsScreen } from './settings-screen'

interface Call {
  readonly init: RequestInit | undefined
  readonly url: string
}

const formatLabel: FormatLabel = (label) => label.text ?? label.kind

const calls: Call[] = []
const originalFetch = globalThis.fetch

const stubApi = (payload: {
  readonly presets?: unknown
  readonly settings?: unknown
  readonly status?: number
}): void => {
  vi.stubGlobal('fetch', (url: string, init?: RequestInit) => {
    calls.push({ init, url })
    const method = init?.method ?? 'GET'
    const raw = init?.body
    const written = typeof raw === 'string' ? JSON.parse(raw) : payload.settings
    const body = (): unknown => {
      if (method === 'GET' && url.includes('action=presets')) {
        return payload.presets ?? {}
      }
      if (method === 'PUT' || method === 'POST') {
        return written
      }
      return payload.settings ?? {}
    }
    return Promise.resolve(
      Response.json({ code: 200, response: body() }, { status: payload.status ?? 200 }),
    )
  })
}

const screen = (settings: unknown, presets: Readonly<Record<string, unknown>> = {}): HTMLElement =>
  mount(
    <SettingsScreen
      t={translate}
      api={createSettingsApi('/api/plugins/test')}
      formatLabel={formatLabel}
      initialPresets={Object.keys(presets)}
      initialSettings={settings === null ? null : sanitizeConfig(settings)}
    />,
  )

const buttonNamed = (container: HTMLElement, text: string): Element => {
  const button = [...container.querySelectorAll('button')].find(
    (element) => element.textContent === text,
  )
  if (button === undefined) {
    throw new Error(`no button: ${text}`)
  }
  return button
}

const status = (container: HTMLElement): string =>
  container.querySelector('[role="status"]')?.textContent ?? ''

const writes = (): readonly Call[] => calls.filter((call) => (call.init?.method ?? 'GET') !== 'GET')

const readout = (container: HTMLElement, label: string): string | undefined => {
  const row = [...container.querySelectorAll('.field')].find(
    (element) => element.textContent?.includes(label) === true,
  )
  return row?.querySelector('.fc-readout')?.textContent ?? undefined
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(console, 'info').mockReturnValue()
})

afterEach(() => {
  calls.length = 0
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  globalThis.fetch = originalFetch
  document.body.replaceChildren()
})

test('builds the whole screen from the React tree', () => {
  expect.hasAssertions()
  const container = screen({ lanes: 3 })
  expect(container.querySelector('a[href="./help.html"]')?.textContent).toBe('linkHelp')
  expect(container.querySelectorAll('.field').length).toBe(28)
  expect(container.querySelector('.preview')).not.toBeNull()
  expect(container.querySelector('#io-json')).not.toBeNull()
})

test('links to the license page in the footer', () => {
  expect.hasAssertions()
  const container = screen({ lanes: 3 })
  const link = required(container.querySelector('footer a'), 'licenses')
  expect(link.getAttribute('href')).toBe('./licenses.html')
  expect(link.textContent).toBe('linkLicenses')
})

test('tells the user when the plugin could not be reached', () => {
  expect.hasAssertions()
  const container = screen(null)
  expect(status(container)).toBe('loadFailed')
})

test('shows the settings it was handed', () => {
  expect.hasAssertions()
  const container = screen({ fontSizePx: 48 })
  expect(readout(container, 'fieldFontSizePx')).toBe('48')
})

test('returns to the defaults on reset', async () => {
  expect.hasAssertions()
  stubApi({ settings: {} })
  const container = screen({ fontSizePx: 48 })
  await clickAsync(buttonNamed(container, 'buttonReset'))
  expect(writes()[0]?.init?.method).toBe('DELETE')
  expect(status(container)).toBe('resetSuccess')
})

test('reports a reset that fails', async () => {
  expect.hasAssertions()
  stubApi({ settings: {}, status: 500 })
  const container = screen({ fontSizePx: 48 })
  await clickAsync(buttonNamed(container, 'buttonReset'))
  expect(status(container)).toBe('resetFailed')
})

test('saves by itself once the editing stops', () => {
  expect.hasAssertions()
  stubApi({ settings: { lanes: 3 } })
  const container = screen({ lanes: 3 })
  const box = required(container.querySelector('.fc-form .fc-checkbox'), 'box')
  click(box)
  advance(600)
  expect(writes()[0]?.init?.method).toBe('PUT')
})

test('does not save when nothing was edited', () => {
  expect.hasAssertions()
  stubApi({ settings: { lanes: 3 } })
  screen({ lanes: 3 })
  advance(600)
  expect(writes()).toHaveLength(0)
})

test('keeps the screen through repeated renders', () => {
  expect.hasAssertions()
  stubApi({ settings: { lanes: 3 } })
  const container = exercise(
    <SettingsScreen
      t={translate}
      api={createSettingsApi('/api/plugins/test')}
      formatLabel={formatLabel}
      initialPresets={[]}
      initialSettings={sanitizeConfig({ lanes: 3 })}
    />,
    <SettingsScreen
      t={translate}
      api={createSettingsApi('/api/plugins/test')}
      formatLabel={formatLabel}
      initialPresets={['夜の配信']}
      initialSettings={sanitizeConfig({ lanes: 4 })}
    />,
  )
  expect(container.querySelector('a[href="./help.html"]')?.textContent).toBe('linkHelp')
})
