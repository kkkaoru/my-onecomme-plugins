import { FIELD_SPECS } from '@my-onecomme-plugins/flow-comment-core/fields'
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FieldValue } from '@my-onecomme-plugins/flow-comment-core/settings'
// @vitest-environment happy-dom
// Runs with bun.
import { click, exercise, mount, required, translate } from '@testing/react'
import { act } from 'react'
import { expect, test, vi } from 'vitest'

import type { FieldValues } from './hooks/use-settings'
import { valuesOf } from './hooks/use-settings'
import { SettingsForm } from './settings-form'

const values = (overrides: Record<string, FieldValue> = {}): FieldValues => ({
  ...valuesOf(sanitizeConfig({})),
  ...overrides,
})

const form = (
  overrides: Record<string, FieldValue> = {},
): {
  readonly container: HTMLElement
  readonly onReset: ReturnType<typeof vi.fn>
  readonly onSubmit: ReturnType<typeof vi.fn>
  readonly onUpdate: ReturnType<typeof vi.fn>
} => {
  const onReset = vi.fn<() => void>()
  const onSubmit = vi.fn<() => void>()
  const onUpdate = vi.fn<() => void>()
  const container = mount(
    <SettingsForm
      t={translate}
      onReset={onReset}
      onSubmit={onSubmit}
      onUpdate={onUpdate}
      values={values(overrides)}
    />,
  )
  return { container, onReset, onSubmit, onUpdate }
}

test('renders one row per setting', () => {
  expect.hasAssertions()
  const { container } = form()
  expect(container.querySelectorAll('.field').length).toBe(FIELD_SPECS.length)
})

test('keeps the padding group folded until it is opened', () => {
  expect.hasAssertions()
  const { container } = form()
  const details = required(
    container.querySelector<HTMLDetailsElement>('details.fc-collapsible'),
    'padding',
  )
  expect(details.open).toBe(false)
  expect(details.querySelector('summary')?.textContent).toBe('groupPadding')
  click(required(details.querySelector('summary'), 'summary'))
  expect(details.open).toBe(true)
  expect(details.querySelectorAll('[data-group="padding"]').length).toBe(4)
})

test('reports an edit with the key of the row', () => {
  expect.hasAssertions()
  const { container, onUpdate } = form()
  const row = [...container.querySelectorAll('label.field')].find(
    (element) => element.textContent === 'fieldShowShadow',
  )
  const box = required(row?.querySelector('.fc-checkbox'), 'box')
  click(box)
  expect(onUpdate).toHaveBeenCalledWith('showShadow', true)
})

test('locks the shadow rows while the shadow is off', () => {
  expect.hasAssertions()
  const { container } = form({ showShadow: false })
  const locked = container.querySelectorAll('[data-group="shadow"][data-disabled]')
  expect(locked.length).toBe(4)
})

test('frees the shadow rows once the shadow is on', () => {
  expect.hasAssertions()
  const { container } = form({ showShadow: true })
  expect(container.querySelectorAll('[data-group="shadow"][data-disabled]').length).toBe(0)
})

test('asks for a save when the form is submitted', () => {
  expect.hasAssertions()
  const { container, onSubmit } = form()
  const element = required(container.querySelector('form'), 'element')
  act(() => {
    element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
  expect(onSubmit.mock.calls.length).toBe(1)
})

test('asks for a reset when the reset button is pressed', () => {
  expect.hasAssertions()
  const { container, onReset } = form()
  const buttons = [...container.querySelectorAll('button')]
  const reset = required(buttons.at(-1), 'reset')
  click(reset)
  expect(onReset.mock.calls.length).toBe(1)
})

test('keeps the form through unchanged and changed values', () => {
  expect.hasAssertions()
  const onUpdate = vi.fn<() => void>()
  const element = (
    <SettingsForm
      t={translate}
      onReset={vi.fn<() => void>()}
      onSubmit={vi.fn<() => void>()}
      onUpdate={onUpdate}
      values={values({ showShadow: true })}
    />
  )
  const container = exercise(
    element,
    <SettingsForm
      t={translate}
      onReset={vi.fn<() => void>()}
      onSubmit={vi.fn<() => void>()}
      onUpdate={vi.fn<() => void>()}
      values={values({ showShadow: false })}
    />,
  )
  expect(container.querySelectorAll('.field').length).toBe(FIELD_SPECS.length)
})

test('falls back to an empty value for a key that is missing', () => {
  expect.hasAssertions()
  const container = mount(
    <SettingsForm
      t={translate}
      onReset={vi.fn<() => void>()}
      onSubmit={vi.fn<() => void>()}
      onUpdate={vi.fn<() => void>()}
      values={{ showShadow: true }}
    />,
  )
  expect(container.querySelectorAll('.field').length).toBe(FIELD_SPECS.length)
})
