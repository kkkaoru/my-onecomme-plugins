import { FIELD_SPECS } from '@my-onecomme-plugins/flow-comment-core/fields'
import type { FieldSpec } from '@my-onecomme-plugins/flow-comment-core/fields'
import { DEFAULT_CONFIG } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FieldValue } from '@my-onecomme-plugins/flow-comment-core/settings'
import { click, clickAsync, exercise, mount, required, translate, typeInto } from '@testing/react'
// @vitest-environment happy-dom
// Runs with bun.
import { expect, test, vi } from 'vitest'

import { FieldControl } from './field-control'

const specOf = (key: string): FieldSpec => {
  const spec = required(
    FIELD_SPECS.find((entry) => entry.key === key),
    'spec',
  )
  return spec
}

const OPTIONS_SPEC: FieldSpec = {
  key: 'direction',
  labelKey: 'fieldDirection',
  options: [
    { labelKey: 'fieldDirectionRtl', value: 'rtl' },
    { labelKey: 'fieldDirectionLtr', value: 'ltr' },
  ],
  type: 'select',
}

const control = (
  spec: FieldSpec,
  value: FieldValue,
  disabled = false,
): { readonly container: HTMLElement; readonly onInput: ReturnType<typeof vi.fn> } => {
  const onInput = vi.fn<() => void>()
  const container = mount(
    <FieldControl t={translate} disabled={disabled} onInput={onInput} spec={spec} value={value} />,
  )
  return { container, onInput }
}

const label = (container: HTMLElement): string =>
  container.querySelector('.field-label')?.textContent ?? ''

test('renders a number field as a slider', () => {
  expect.hasAssertions()
  const { container } = control(specOf('fontSizePx'), 36)
  expect(label(container)).toBe('fieldFontSizePx')
  expect(container.querySelector('.fc-slider')).not.toBeNull()
})

// つまみの操作は base-ui の領分で happy-dom では動かない。実ブラウザでの
// 検証は Storybook の play 関数が担う。
test('shows the current value next to the slider', () => {
  expect.hasAssertions()
  const { container } = control(specOf('fontSizePx'), 36)
  expect(container.querySelector('.fc-readout')?.textContent).toBe('36')
})

test('renders a checkbox with its label and toggles it', () => {
  expect.hasAssertions()
  const { container, onInput } = control(specOf('showShadow'), false)
  expect(label(container)).toBe('fieldShowShadow')
  const box = required(container.querySelector('.fc-checkbox'), 'box')
  click(box)
  expect(onInput).toHaveBeenCalledWith(true)
})

test('renders radios and reports the picked option', () => {
  expect.hasAssertions()
  const { container, onInput } = control(specOf('direction'), 'rtl')
  const [, second] = container.querySelectorAll('.fc-radio')
  expect(container.querySelectorAll('.fc-radio').length).toBe(2)
  click(required(second, 'second radio'))
  expect(onInput).toHaveBeenCalledWith('ltr')
})

test('renders a text field and reports the typed value', () => {
  expect.hasAssertions()
  const { container, onInput } = control(specOf('fontFamily'), 'Noto Sans JP')
  const input = required(container.querySelector('input'), 'input')
  expect(input.value).toBe('Noto Sans JP')
  typeInto(input, 'Arial')
  expect(onInput).toHaveBeenCalledWith('Arial')
})

test('renders a colour field as a colour input', () => {
  expect.hasAssertions()
  const { container } = control(specOf('textColor'), '#ffffff')
  expect(container.querySelector('input')?.getAttribute('type')).toBe('color')
})

test('lists font candidates on the combobox', () => {
  expect.hasAssertions()
  const { container } = control(specOf('fontFamily'), 'Roboto')
  const options = [...container.querySelectorAll('#fc-fonts-fontFamily option')].map((option) =>
    option.getAttribute('value'),
  )
  expect(options.filter((name) => name === 'Roboto')).toStrictEqual(['Roboto'])
  expect(options.filter((name) => name === 'Arial')).toStrictEqual(['Arial'])
})

test('hides the load button where the browser cannot list device fonts', () => {
  expect.hasAssertions()
  // 環境が対応していない場合をはっきりさせる
  vi.stubGlobal('queryLocalFonts', null)
  const { container } = control(specOf('fontFamily'), 'Roboto')
  expect(container.querySelector('.fc-load-fonts')).toBeNull()
  expect(container.textContent).toContain('fontLoadUnsupported')
  vi.unstubAllGlobals()
})

test('renders a select with the current option shown', () => {
  expect.hasAssertions()
  const { container } = control(OPTIONS_SPEC, 'rtl')
  expect(container.querySelector('.fc-select')?.textContent).toContain('fieldDirectionRtl')
})

test('keeps every control out of reach while disabled', () => {
  expect.hasAssertions()
  const { container, onInput } = control(specOf('showShadow'), false, true)
  const box = required(container.querySelector('.fc-checkbox'), 'box')
  click(box)
  expect(onInput).not.toHaveBeenCalled()
})

const TEXT_SPEC: FieldSpec = { key: 'direction', labelKey: 'fieldDirection', type: 'text' }
const RADIO_WITHOUT_OPTIONS: FieldSpec = {
  key: 'direction',
  labelKey: 'fieldDirection',
  type: 'radio',
}
const SELECT_WITHOUT_OPTIONS: FieldSpec = {
  key: 'direction',
  labelKey: 'fieldDirection',
  type: 'select',
}

test('resets the font family to the default', () => {
  expect.hasAssertions()
  const { container, onInput } = control(specOf('fontFamily'), 'Roboto')
  click(required(container.querySelector('.fc-font-reset'), 'reset button'))
  expect(onInput).toHaveBeenCalledWith(DEFAULT_CONFIG.fontFamily)
})

test('loads device fonts from the button when the browser allows it', async () => {
  expect.hasAssertions()
  vi.stubGlobal(
    'queryLocalFonts',
    vi.fn<() => Promise<readonly { readonly family: string }[]>>(() =>
      Promise.resolve([{ family: 'Machine Font' }]),
    ),
  )
  const { container } = control(specOf('fontFamily'), 'Roboto')
  await clickAsync(required(container.querySelector('.fc-load-fonts'), 'load button'))
  const options = [...container.querySelectorAll('#fc-fonts-fontFamily option')].map((option) =>
    option.getAttribute('value'),
  )
  expect(options.filter((name) => name === 'Machine Font')).toStrictEqual(['Machine Font'])
  vi.unstubAllGlobals()
})

test('says when the user denies device fonts', async () => {
  expect.hasAssertions()
  vi.spyOn(console, 'info').mockReturnValue()
  vi.stubGlobal(
    'queryLocalFonts',
    vi.fn<() => Promise<never>>(() => Promise.reject(new Error('denied'))),
  )
  const { container } = control(specOf('fontFamily'), 'Roboto')
  await clickAsync(required(container.querySelector('.fc-load-fonts'), 'load button'))
  expect(container.textContent).toContain('fontLoadDenied')
  vi.unstubAllGlobals()
})

// 種類ごとに、値が同じときと変わったときの両方を描く（React Compiler の覚えた値）。
test('keeps every kind of control through unchanged and changed values', () => {
  expect.hasAssertions()
  const cases: readonly (readonly [FieldSpec, FieldValue, FieldValue, boolean])[] = [
    [specOf('fontSizePx'), 36, 40, false],
    [specOf('shadowOffsetXPx'), 4, 8, false],
    [specOf('showShadow'), false, true, true],
    [specOf('direction'), 'rtl', 'ltr', false],
    [specOf('fontFamily'), 'Roboto', 'Arial', false],
    [specOf('textColor'), '#ffffff', '#000000', false],
    [OPTIONS_SPEC, 'rtl', 'ltr', false],
    [TEXT_SPEC, 'a', 'b', false],
    [RADIO_WITHOUT_OPTIONS, '', '', false],
    [SELECT_WITHOUT_OPTIONS, '', '', true],
  ]
  for (const [spec, value, changed, disabled] of cases) {
    const onInput = vi.fn<() => void>()
    const element = (
      <FieldControl t={translate} disabled={disabled} onInput={onInput} spec={spec} value={value} />
    )
    const other = (
      <FieldControl
        t={translate}
        disabled={!disabled}
        onInput={vi.fn<() => void>()}
        spec={spec}
        value={changed}
      />
    )
    expect(exercise(element, other).querySelector('.field')).not.toBeNull()
  }
})

test('keeps the picker out of reach while disabled', () => {
  expect.hasAssertions()
  const { container, onInput } = control(specOf('fontFamily'), 'Roboto', true)
  expect(container.querySelector<HTMLInputElement>('.font-picker input')?.disabled).toBe(true)
  expect(onInput).not.toHaveBeenCalled()
})

// 無効な行は、見えているが触れないことが分かるようにする。
test('marks a disabled row as disabled for the eye and the pointer', () => {
  expect.hasAssertions()
  const { container } = control(specOf('fontSizePx'), 36, true)
  expect(container.querySelector('.field.is-disabled')).not.toBeNull()
  expect(container.querySelector('[data-disabled]')).not.toBeNull()
})
