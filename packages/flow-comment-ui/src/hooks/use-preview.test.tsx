import type { FormatLabel } from '@my-onecomme-plugins/flow-comment-core/comment'
import { PREVIEW_SAMPLES } from '@my-onecomme-plugins/flow-comment-core/samples'
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import { click, mount, mountWithUpdate, required } from '@testing/react'
// @vitest-environment happy-dom
// Runs with bun.
import type { ReactElement } from 'react'
import { afterEach, expect, test, vi } from 'vitest'

import { usePreview } from './use-preview'

const formatLabel: FormatLabel = (label) => label.text ?? label.kind
const settings = (overrides: Record<string, unknown> = {}): FlowConfig =>
  sanitizeConfig({ durationMs: 1000, lanes: 3, ...overrides })

const ALL_KEYS = new Set(PREVIEW_SAMPLES.map((sample) => sample.labelKey))

const Probe = ({ config }: { readonly config: FlowConfig }): ReactElement => {
  const { host, push, samples } = usePreview({
    enabled: ALL_KEYS,
    formatLabel,
    settings: config,
  })
  const [first] = samples
  return (
    <div>
      <div className="host" ref={host} />
      <button
        onClick={() => {
          push(required(first, 'sample'))
        }}
        type="button"
      >
        push
      </button>
    </div>
  )
}

const pushOnce = (container: HTMLElement): void => {
  const button = required(container.querySelector('button'), 'button')
  click(button)
}

afterEach(() => {
  vi.useRealTimers()
})

test('pushes a sample into the flow it created on the host', () => {
  expect.hasAssertions()
  const container = mount(<Probe config={settings()} />)
  pushOnce(container)
  expect(container.querySelectorAll('.fc-item').length).toBe(1)
})

test('applies the settings that are passed in', () => {
  expect.hasAssertions()
  const { container, update } = mountWithUpdate(<Probe config={settings({ fontSizePx: 40 })} />)
  update(<Probe config={settings({ fontSizePx: 40 })} />)
  pushOnce(container)
  const item = container.querySelector<HTMLElement>('.fc-item')
  expect(item?.style.fontSize).toBe('40px')
})

test('streams the samples on its own', () => {
  expect.hasAssertions()
  vi.useFakeTimers()
  const container = mount(<Probe config={settings()} />)
  vi.advanceTimersByTime(900 * 3)
  expect(container.querySelectorAll('.fc-item').length).toBe(3)
})

test('stops the stream when the host goes away', () => {
  expect.hasAssertions()
  vi.useFakeTimers()
  const { container, update } = mountWithUpdate(<Probe config={settings()} />)
  pushOnce(container)
  expect(container.querySelectorAll('.fc-item').length).toBe(1)
  update(<div />)
  vi.advanceTimersByTime(900 * 3)
  expect(container.querySelectorAll('.fc-item').length).toBe(0)
})

test('holds the samples while the tab is not visible', () => {
  expect.hasAssertions()
  vi.useFakeTimers()
  Object.defineProperty(document, 'hidden', { configurable: true, value: true })
  const container = mount(<Probe config={settings()} />)
  vi.advanceTimersByTime(900 * 3)
  expect(container.querySelectorAll('.fc-item').length).toBe(0)
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  vi.useRealTimers()
})
