import type { FieldValue } from '@my-onecomme-plugins/flow-comment-core/settings'

// Runs with bun.
// One builder per input type, plus the dispatch that picks between them.
import type { FieldSpec } from '../settings/fields'

export const createSelect = (
  spec: FieldSpec,
  value: FieldValue,
  onInput: (next: FieldValue) => void,
): HTMLSelectElement => {
  const select = document.createElement('select')
  for (const option of spec.options ?? []) {
    const item = document.createElement('option')
    item.value = option.value
    item.textContent = option.label
    select.append(item)
  }
  select.value = String(value)
  select.addEventListener('change', () => {
    onInput(select.value)
  })
  return select
}

export const createRadio = (
  spec: FieldSpec,
  value: FieldValue,
  onInput: (next: FieldValue) => void,
): HTMLElement => {
  const group = document.createElement('span')
  group.className = 'radio-group'
  for (const option of spec.options ?? []) {
    const item = document.createElement('label')
    item.className = 'radio-item'
    const input = document.createElement('input')
    input.type = 'radio'
    input.name = `fc-${spec.key}`
    input.value = option.value
    input.checked = String(value) === option.value
    input.addEventListener('change', () => {
      onInput(option.value)
    })
    const text = document.createElement('span')
    text.textContent = option.label
    item.append(input, text)
    group.append(item)
  }
  return group
}

export const createCheckbox = (
  value: FieldValue,
  onInput: (next: FieldValue) => void,
): HTMLInputElement => {
  const box = document.createElement('input')
  box.type = 'checkbox'
  box.checked = value === true
  box.addEventListener('change', () => {
    onInput(box.checked)
  })
  return box
}

export const createInput = (
  spec: FieldSpec,
  value: FieldValue,
  onInput: (next: FieldValue) => void,
): HTMLInputElement => {
  const input = document.createElement('input')
  input.type = spec.type === 'font' ? 'text' : spec.type
  // range は min/max を value より先に設定しないと既定範囲でクランプされる。
  input.min = spec.min === undefined ? '' : String(spec.min)
  input.max = spec.max === undefined ? '' : String(spec.max)
  input.step = spec.step === undefined ? '' : String(spec.step)
  input.value = String(value)
  input.addEventListener('input', () => {
    onInput(input.value)
  })
  return input
}

export const createControl = (
  spec: FieldSpec,
  value: FieldValue,
  onInput: (next: FieldValue) => void,
): HTMLElement => {
  if (spec.type === 'select') {
    return createSelect(spec, value, onInput)
  }
  if (spec.type === 'radio') {
    return createRadio(spec, value, onInput)
  }
  return spec.type === 'checkbox'
    ? createCheckbox(value, onInput)
    : createInput(spec, value, onInput)
}
