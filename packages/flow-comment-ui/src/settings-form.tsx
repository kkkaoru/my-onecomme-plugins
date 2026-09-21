// Runs with bun. 表示設定のフォーム。値は外から渡し、ここでは入力の通知だけをする。
import { Button } from '@base-ui/react/button'
import { FIELD_SPECS } from '@my-onecomme-plugins/flow-comment-core/fields'
import type { FieldSpec } from '@my-onecomme-plugins/flow-comment-core/fields'
import type { FieldValue } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { ReactElement } from 'react'

import { FieldControl } from './controls/field-control'
import type { FieldValues } from './hooks/use-settings'
import type { MessageKey, Translate } from './messages'

export interface SettingsFormProps {
  readonly onReset: () => void
  readonly onUpdate: (key: string, value: FieldValue) => void
  readonly t: Translate
  readonly values: FieldValues
}

interface FieldRowProps {
  readonly disabled: boolean
  readonly onUpdate: SettingsFormProps['onUpdate']
  readonly spec: FieldSpec
  readonly t: Translate
  readonly values: FieldValues
}

interface PaddingGroupProps {
  readonly onUpdate: SettingsFormProps['onUpdate']
  readonly t: Translate
  readonly values: FieldValues
}

interface FormRowProps {
  readonly heading: MessageKey | undefined
  readonly onUpdate: SettingsFormProps['onUpdate']
  readonly shadowOff: boolean
  readonly spec: FieldSpec
  readonly t: Translate
  readonly values: FieldValues
}

const GROUP_KEYS: Readonly<Record<string, MessageKey>> = {
  padding: 'groupPadding',
  shadow: 'groupShadow',
}

const PADDING_SPECS: readonly FieldSpec[] = FIELD_SPECS.filter((spec) => spec.group === 'padding')

const headingOf = (spec: FieldSpec, index: number): MessageKey | undefined =>
  spec.group !== undefined && spec.group !== FIELD_SPECS[index - 1]?.group
    ? GROUP_KEYS[spec.group]
    : undefined

const FieldRow = ({ disabled, onUpdate, spec, t, values }: FieldRowProps): ReactElement => (
  <FieldControl
    disabled={disabled}
    onInput={(value) => {
      onUpdate(spec.key, value)
    }}
    spec={spec}
    t={t}
    value={values[spec.key] ?? ''}
  />
)

const PaddingGroup = ({ onUpdate, t, values }: PaddingGroupProps): ReactElement => (
  <details className="fc-collapsible">
    <summary className="fc-collapsible-trigger">{t('groupPadding')}</summary>
    <div className="fc-collapsible-panel">
      {PADDING_SPECS.map((spec) => (
        <FieldRow
          disabled={false}
          key={spec.key}
          onUpdate={onUpdate}
          spec={spec}
          t={t}
          values={values}
        />
      ))}
    </div>
  </details>
)

const FormRow = ({
  heading,
  onUpdate,
  shadowOff,
  spec,
  t,
  values,
}: FormRowProps): ReactElement | null => {
  if (spec.group === 'padding') {
    return heading === undefined ? null : <PaddingGroup onUpdate={onUpdate} t={t} values={values} />
  }
  return (
    <>
      {heading === undefined ? null : <h3 className="group-heading">{t(heading)}</h3>}
      <FieldRow
        disabled={spec.group === 'shadow' && shadowOff}
        onUpdate={onUpdate}
        spec={spec}
        t={t}
        values={values}
      />
    </>
  )
}

export const SettingsForm = ({ onReset, onUpdate, t, values }: SettingsFormProps): ReactElement => {
  const shadowOff = values['showShadow'] !== true
  return (
    <form
      className="fc-form"
      onSubmit={(event) => {
        event.preventDefault()
      }}
    >
      <h2>{t('sectionDisplay')}</h2>
      <div className="fc-fields">
        {FIELD_SPECS.map((spec, index) => (
          <FormRow
            key={spec.key}
            heading={headingOf(spec, index)}
            onUpdate={onUpdate}
            shadowOff={shadowOff}
            spec={spec}
            t={t}
            values={values}
          />
        ))}
      </div>
      <div className="actions">
        <Button onClick={onReset} type="button">
          {t('buttonReset')}
        </Button>
      </div>
    </form>
  )
}
