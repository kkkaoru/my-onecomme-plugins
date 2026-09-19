import type { FieldValue, FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'

// Runs with bun.
// Reading settings into the form and the form back into settings.
import { FIELD_SPECS } from '../settings/fields'
import type { FieldSpec } from '../settings/fields'

export const toSettingsMap = (settings: FlowConfig): Map<keyof FlowConfig, FieldValue> => {
  const values = new Map<keyof FlowConfig, FieldValue>()
  for (const spec of FIELD_SPECS) {
    values.set(spec.key, settings[spec.key])
  }
  return values
}

// 保存時はフォーム（DOM）から直接読む。別に保持した値と食い違う余地をなくす。
const readControl = (spec: FieldSpec): FieldValue | null => {
  if (spec.type === 'radio') {
    const checked = document.querySelector<HTMLInputElement>(`input[name="fc-${spec.key}"]:checked`)
    return checked === null ? null : checked.value
  }
  const control = document.querySelector<HTMLInputElement>(`#field-${spec.key}`)
  if (control === null) {
    return null
  }
  return spec.type === 'checkbox' ? control.checked : control.value
}

export const collectValues = (): Readonly<Record<string, FieldValue>> => {
  const entries: [string, FieldValue][] = []
  for (const spec of FIELD_SPECS) {
    const value = readControl(spec)
    if (value !== null) {
      entries.push([spec.key, value])
    }
  }
  return Object.fromEntries(entries)
}

// 影が OFF のときは、値を残したまま操作できない見た目にする。
export const syncShadowState = (): void => {
  const toggle = document.querySelector<HTMLInputElement>('#field-showShadow')
  const enabled = toggle?.checked === true
  for (const field of document.querySelectorAll<HTMLElement>('[data-group="shadow"]')) {
    field.classList.toggle('is-disabled', !enabled)
    for (const control of field.querySelectorAll<HTMLInputElement>('input, select')) {
      control.disabled = !enabled
    }
  }
}
