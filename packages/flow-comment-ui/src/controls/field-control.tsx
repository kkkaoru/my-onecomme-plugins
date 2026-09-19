// Runs with bun.
// 項目の種類ごとにコントロールを選ぶ。種類を知っているのはこのファイルだけ。
import { Checkbox } from '@base-ui/react/checkbox'
import { Field } from '@base-ui/react/field'
import type { FieldSpec } from '@my-onecomme-plugins/flow-comment-core/fields'
import type { ReactElement } from 'react'

import { RadioControl, SelectControl } from './choice-controls'
import { FontField } from './font-field'
import { RangeControl } from './range-control'
import type { ControlProps } from './types'

const TextControl = ({ disabled, onInput, spec, t, value }: ControlProps): ReactElement => (
  <Field.Root
    className={disabled ? 'field is-disabled' : 'field'}
    data-group={spec.group}
    disabled={disabled}
  >
    <Field.Label className="field-label">{t(spec.labelKey)}</Field.Label>
    <Field.Control
      className="fc-input"
      disabled={disabled}
      onValueChange={(next) => {
        onInput(next)
      }}
      type={spec.type === 'color' ? 'color' : 'text'}
      value={String(value)}
    />
  </Field.Root>
)

const CheckboxControl = ({ disabled, onInput, spec, t, value }: ControlProps): ReactElement => (
  <label className={disabled ? 'field is-disabled' : 'field'} data-group={spec.group}>
    <Checkbox.Root
      checked={value === true}
      className="fc-checkbox"
      disabled={disabled}
      onCheckedChange={(checked) => {
        onInput(checked)
      }}
    >
      <Checkbox.Indicator className="fc-check-indicator" />
    </Checkbox.Root>
    <span className="field-label">{t(spec.labelKey)}</span>
  </label>
)

// 種類とコントロールの対応。設定項目を増やすときは FIELD_SPECS に足すだけで済む。
const CONTROLS: Readonly<Record<FieldSpec['type'], (props: ControlProps) => ReactElement>> = {
  checkbox: CheckboxControl,
  color: TextControl,
  font: FontField,
  radio: RadioControl,
  range: RangeControl,
  select: SelectControl,
  text: TextControl,
}

export const FieldControl = (props: ControlProps): ReactElement => {
  const Control = CONTROLS[props.spec.type]
  return <Control {...props} />
}
