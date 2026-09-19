// Runs with bun.
// フォントの項目。入力欄と、選び直すためのボタンだけを見せる。
import { Field } from '@base-ui/react/field'
import type { ReactElement } from 'react'

import { FontPicker } from './font-picker'
import type { ControlProps } from './types'

export const FontField = ({ disabled, onInput, spec, t, value }: ControlProps): ReactElement => (
  <Field.Root
    className={disabled ? 'field field-wide is-disabled' : 'field field-wide'}
    data-group={spec.group}
    disabled={disabled}
  >
    <Field.Label className="field-label">{t(spec.labelKey)}</Field.Label>
    <div className="font-picker">
      <Field.Control
        className="fc-input"
        disabled={disabled}
        onValueChange={(next) => {
          onInput(next)
        }}
        type="text"
        value={String(value)}
      />
      <FontPicker disabled={disabled} onInput={onInput} t={t} />
    </div>
  </Field.Root>
)
