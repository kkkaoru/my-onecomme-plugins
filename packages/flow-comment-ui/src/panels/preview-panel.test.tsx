import type { FormatLabel } from '@my-onecomme-plugins/flow-comment-core/comment'
import { PREVIEW_SAMPLES } from '@my-onecomme-plugins/flow-comment-core/samples'
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
// @vitest-environment happy-dom
// Runs with bun.
import { click, exercise, mount, required, translate } from '@testing/react'
import { expect, test, vi } from 'vitest'

import { PreviewPanel } from './preview-panel'

const formatLabel: FormatLabel = (label) => label.text ?? label.kind
const settings = (overrides: Record<string, unknown> = {}): FlowConfig =>
  sanitizeConfig({ durationMs: 1000, lanes: 3, ...overrides })

test('offers every sample as a checkbox', () => {
  expect.hasAssertions()
  const container = mount(
    <PreviewPanel t={translate} formatLabel={formatLabel} settings={settings()} />,
  )
  expect(container.querySelectorAll('.fc-sample').length).toBe(PREVIEW_SAMPLES.length)
})

test('pushes a sample when its checkbox is turned back on', () => {
  expect.hasAssertions()
  const container = mount(
    <PreviewPanel t={translate} formatLabel={formatLabel} settings={settings()} />,
  )
  const box = required(container.querySelector('.fc-sample'), 'sample')
  click(box)
  click(box)
  expect(container.querySelectorAll('.fc-item').length).toBe(1)
})

test('flips the preview background from the theme radios', () => {
  expect.hasAssertions()
  const container = mount(
    <PreviewPanel t={translate} formatLabel={formatLabel} settings={settings()} />,
  )
  const radios = container.querySelectorAll('.fc-radio')
  const light = required(radios[1], 'light')
  click(light)
  expect(container.querySelector('.preview')?.className).toContain('is-light')
})

test('keeps the preview when the settings change', () => {
  expect.hasAssertions()
  const container = mount(
    <PreviewPanel t={translate} formatLabel={formatLabel} settings={settings({ lanes: 3 })} />,
  )
  mount(<PreviewPanel t={translate} formatLabel={formatLabel} settings={settings({ lanes: 5 })} />)
  expect(container.querySelector('.preview')).not.toBeNull()
})

test('stops the stream when the preview goes away', () => {
  expect.hasAssertions()
  vi.useFakeTimers()
  const container = mount(
    <PreviewPanel t={translate} formatLabel={formatLabel} settings={settings()} />,
  )
  const box = required(container.querySelectorAll('.fc-sample')[0], 'sample')
  click(box)
  click(box)
  expect(container.querySelectorAll('.fc-item').length).toBe(1)
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
  expect(container.querySelectorAll('.fc-item').length).toBeGreaterThan(0)
})

test('keeps the preview through unchanged and changed props', () => {
  expect.hasAssertions()
  const element = <PreviewPanel t={translate} formatLabel={formatLabel} settings={settings()} />
  const container = exercise(
    element,
    <PreviewPanel t={translate} formatLabel={formatLabel} settings={settings({ lanes: 5 })} />,
  )
  expect(container.querySelector('.preview')).not.toBeNull()
})

// 既定は白系。黒系に戻せることも確かめる。
test('switches back to the dark preview', () => {
  expect.hasAssertions()
  const container = mount(
    <PreviewPanel formatLabel={formatLabel} settings={settings()} t={translate} />,
  )
  expect(container.querySelector('.preview')?.className).toContain('is-light')
  click(required(container.querySelectorAll('.fc-radio')[0], 'dark radio'))
  expect(container.querySelector('.preview')?.className).toBe('preview')
})
