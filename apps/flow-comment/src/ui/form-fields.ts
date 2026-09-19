// Runs with bun.
// Wraps a control with its label and, for ranges, a live readout.
import type { FieldValue, FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'

import { FIELD_SPECS } from '../settings/fields'
import type { FieldSpec } from '../settings/fields'
import { FONT_LOAD_ID, FONT_OPTIONS_ID, renderFontOptions } from './fonts'
import { createControl, createInput, createRadio } from './form-controls'

export const createFontField = (spec: FieldSpec, value: FieldValue): HTMLElement => {
  const wrapper = document.createElement('p')
  wrapper.className = 'field field-wide'
  const legend = document.createElement('span')
  legend.className = 'field-label'
  legend.textContent = spec.label
  const picker = document.createElement('span')
  picker.className = 'font-picker'
  const input = createInput(spec, value, () => {
    renderFontOptions(input.value)
  })
  input.id = `field-${spec.key}`
  const loadButton = document.createElement('button')
  loadButton.type = 'button'
  loadButton.id = FONT_LOAD_ID
  loadButton.textContent = '端末のフォントを読み込む'
  const options = document.createElement('span')
  options.className = 'font-options'
  options.id = FONT_OPTIONS_ID
  picker.append(input, loadButton, options)
  wrapper.append(legend, picker)
  return wrapper
}

// ラジオは入力欄の代わりに見出しを置くので、他の項目とは組み立てが違う。
const createRadioField = (
  spec: FieldSpec,
  value: FieldValue,
  onInput: (next: FieldValue) => void,
): HTMLElement => {
  const wrapper = document.createElement('p')
  wrapper.className = 'field field-wide'
  const legend = document.createElement('span')
  legend.className = 'field-label'
  legend.textContent = spec.label
  wrapper.append(legend, createRadio(spec, value, onInput))
  return wrapper
}

// range の現在値は、つまみを動かしている間ずっと見えている必要がある。
const addRangeReadout = (wrapper: HTMLElement, control: HTMLInputElement): void => {
  const readout = document.createElement('output')
  readout.textContent = control.value
  control.addEventListener('input', () => {
    readout.textContent = control.value
  })
  wrapper.append(readout)
}

export const createField = (
  spec: FieldSpec,
  value: FieldValue,
  onInput: (next: FieldValue) => void,
): HTMLElement => {
  if (spec.type === 'font') {
    return createFontField(spec, value)
  }
  if (spec.type === 'radio') {
    return createRadioField(spec, value, onInput)
  }
  const wrapper = document.createElement('p')
  wrapper.className = 'field'
  if (spec.group !== undefined) {
    wrapper.dataset.group = spec.group
  }
  const label = document.createElement('label')
  label.htmlFor = `field-${spec.key}`
  label.textContent = spec.label
  const control = createControl(spec, value, onInput)
  control.id = `field-${spec.key}`
  wrapper.append(label, control)
  if (spec.type === 'range' && control instanceof HTMLInputElement) {
    addRangeReadout(wrapper, control)
  }
  return wrapper
}

export const renderForm = (
  container: HTMLElement,
  values: ReadonlyMap<keyof FlowConfig, FieldValue>,
  onInput: () => void,
): void => {
  container.replaceChildren(
    ...FIELD_SPECS.map((spec) => createField(spec, values.get(spec.key) ?? '', onInput)),
  )
}
