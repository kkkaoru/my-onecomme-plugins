// Runs with bun.
// Font family as one combobox: the input is the filter and the value.
import { Field } from '@base-ui/react/field'
import type { ReactElement } from 'react'

import { useFonts } from '../hooks/use-fonts'
import { FontActions } from './font-actions'
import type { ControlProps } from './types'

export const FontField = ({ disabled, onInput, spec, t, value }: ControlProps): ReactElement => {
  const { canLoad, loadLocal, loadResult, matches } = useFonts('')
  const names = [...new Set([String(value), ...matches])].filter((name) => name !== '')
  const notes = canLoad ? loadResult === 'denied' : true
  const listId = `fc-fonts-${spec.key}`
  return (
    <Field.Root
      className={disabled ? 'field field-wide is-disabled' : 'field field-wide'}
      data-group={spec.group}
      disabled={disabled}
    >
      <Field.Label className="field-label">{t(spec.labelKey)}</Field.Label>
      <div className="font-picker">
        <input
          className="fc-input"
          disabled={disabled}
          list={listId}
          onChange={(event) => {
            onInput(event.currentTarget.value)
          }}
          value={String(value)}
        />
        <datalist id={listId}>
          {names.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <FontActions
          canAskForFonts={canLoad && loadResult !== 'loaded'}
          disabled={disabled}
          loadLocal={loadLocal}
          onInput={onInput}
          t={t}
        />
        {notes ? (
          <span className="note">{t(canLoad ? 'fontLoadDenied' : 'fontLoadUnsupported')}</span>
        ) : null}
      </div>
    </Field.Root>
  )
}
