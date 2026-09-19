import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
// @vitest-environment happy-dom
// Runs with bun.
import {
  click,
  clickAsync,
  exercise,
  mount,
  typeIntoTextArea,
  required,
  translate,
} from '@testing/react'
import { afterEach, expect, test, vi } from 'vitest'

import { JsonPanel } from './json-panel'

const read = (): FlowConfig => sanitizeConfig({ durationMs: 4000, lanes: 2 })

const panel = (): {
  readonly container: HTMLElement
  readonly onApply: ReturnType<typeof vi.fn>
  readonly setStatus: ReturnType<typeof vi.fn>
  readonly textarea: HTMLTextAreaElement
} => {
  const onApply = vi.fn<() => void>()
  const setStatus = vi.fn<() => void>()
  const container = mount(
    <JsonPanel open t={translate} current={read} onApply={onApply} setStatus={setStatus} />,
  )
  const textarea = required(container.querySelector('textarea'), 'textarea')
  return { container, onApply, setStatus, textarea }
}

const buttons = (container: HTMLElement): Element[] => [...container.querySelectorAll('button')]
const clipboard = (writeText: () => Promise<void>): void => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
}

afterEach(() => {
  vi.restoreAllMocks()
})

test('writes the current settings into the textarea', () => {
  expect.hasAssertions()
  const { container, setStatus, textarea } = panel()
  click(required(buttons(container)[0], 'button'))
  expect(textarea.value).toContain('"durationMs": 4000')
  expect(setStatus).toHaveBeenCalledWith('exportSuccess')
})

test('refuses text that is not JSON', () => {
  expect.hasAssertions()
  const { container, onApply, setStatus, textarea } = panel()
  typeIntoTextArea(textarea, 'これは JSON ではない')
  click(required(buttons(container)[2], 'button'))
  expect(setStatus).toHaveBeenCalledWith('importFailed')
  expect(onApply).not.toHaveBeenCalled()
})

test('applies pasted settings through sanitizeConfig', () => {
  expect.hasAssertions()
  const { container, onApply, textarea } = panel()
  typeIntoTextArea(textarea, '{"lanes": 5}')
  click(required(buttons(container)[2], 'button'))
  const applied = onApply.mock.calls[0]?.[0]
  expect(applied?.lanes).toBe(5)
  expect(onApply).toHaveBeenCalledWith(expect.anything(), 'importSuccess')
})

test('copies the textarea into the clipboard', async () => {
  expect.hasAssertions()
  const writeText = vi.fn<() => Promise<void>>(() => Promise.resolve())
  clipboard(writeText)
  const { container, setStatus, textarea } = panel()
  typeIntoTextArea(textarea, '{"lanes": 1}')
  await clickAsync(required(buttons(container)[1], 'button'))
  expect(writeText).toHaveBeenCalledWith('{"lanes": 1}')
  expect(setStatus).toHaveBeenCalledWith('copySuccess')
})

test('tells the user how to copy when the clipboard refuses', async () => {
  expect.hasAssertions()
  vi.spyOn(console, 'info').mockReturnValue()
  clipboard(() => Promise.reject(new Error('denied')))
  const { container, setStatus } = panel()
  await clickAsync(required(buttons(container)[1], 'button'))
  expect(setStatus).toHaveBeenCalledWith('copyFailed')
})

test('keeps the panel through unchanged and changed handlers', () => {
  expect.hasAssertions()
  const element = (
    <JsonPanel
      t={translate}
      current={read}
      onApply={vi.fn<() => void>()}
      setStatus={vi.fn<() => void>()}
    />
  )
  const container = exercise(
    element,
    <JsonPanel
      t={translate}
      current={read}
      onApply={vi.fn<() => void>()}
      setStatus={vi.fn<() => void>()}
    />,
  )
  expect(container.querySelector('#io-json')).not.toBeNull()
})

test('starts closed, with its content already in the document', () => {
  expect.hasAssertions()
  const container = mount(
    <JsonPanel
      t={translate}
      current={() => sanitizeConfig({})}
      onApply={vi.fn<() => void>()}
      setStatus={vi.fn<() => void>()}
    />,
  )
  const details = required(
    container.querySelector<HTMLDetailsElement>('details.fc-collapsible'),
    'collapsible',
  )
  expect(details.open).toBe(false)
  expect(container.querySelector('textarea')).not.toBeNull()
})
