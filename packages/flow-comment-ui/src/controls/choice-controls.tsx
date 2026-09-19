// Runs with bun.
// 選択肢を持つ項目。ラジオは全部見せ、セレクトは省スペースで出す。
import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import type { ReactElement } from 'react'

import { OptionSelect } from '../parts/option-select'
import type { ControlProps } from './types'

export const RadioControl = ({ disabled, onInput, spec, t, value }: ControlProps): ReactElement => (
  <fieldset
    className={disabled ? 'field field-wide is-disabled' : 'field field-wide'}
    data-group={spec.group}
    disabled={disabled}
  >
    <legend className="field-label">{t(spec.labelKey)}</legend>
    <RadioGroup
      className="radio-group"
      disabled={disabled}
      onValueChange={(next) => {
        onInput(String(next))
      }}
      value={String(value)}
    >
      {(spec.options ?? []).map((option) => (
        <label className="radio-item" key={option.value}>
          <Radio.Root className="fc-radio" disabled={disabled} value={option.value} />
          <span>{t(option.labelKey)}</span>
        </label>
      ))}
    </RadioGroup>
  </fieldset>
)

export const SelectControl = ({
  disabled,
  onInput,
  spec,
  t,
  value,
}: ControlProps): ReactElement => (
  <div className={disabled ? 'field is-disabled' : 'field'} data-group={spec.group}>
    <span className="field-label">{t(spec.labelKey)}</span>
    <OptionSelect
      disabled={disabled}
      label={t(spec.labelKey)}
      onSelect={onInput}
      options={(spec.options ?? []).map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      }))}
      value={String(value)}
    />
  </div>
)
