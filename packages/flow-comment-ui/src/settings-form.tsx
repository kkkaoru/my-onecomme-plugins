// Runs with bun.
// 表示設定のフォーム。値はすべて外から渡し、ここでは入力の通知だけをする。
import { Button } from '@base-ui/react/button'
import { FIELD_SPECS } from '@my-onecomme-plugins/flow-comment-core/fields'
import type { FieldSpec } from '@my-onecomme-plugins/flow-comment-core/fields'
import type { FieldValue } from '@my-onecomme-plugins/flow-comment-core/settings'
import { Fragment } from 'react'
import type { ReactElement } from 'react'

import { FieldControl } from './controls/field-control'
import type { FieldValues } from './hooks/use-settings'
import type { MessageKey, Translate } from './messages'

export interface SettingsFormProps {
  readonly onReset: () => void
  readonly onSubmit: () => void
  readonly onUpdate: (key: string, value: FieldValue) => void
  readonly t: Translate
  readonly values: FieldValues
}

// まとまりのある項目（余白・影）は見出しを付けて、何の設定か分かるようにする。
const GROUP_KEYS: Readonly<Record<string, MessageKey>> = {
  padding: 'groupPadding',
  shadow: 'groupShadow',
}

interface Row {
  readonly heading: MessageKey | undefined
  readonly spec: FieldSpec
}

const rowsOf = (): readonly Row[] =>
  FIELD_SPECS.map((spec, index) => ({
    heading:
      spec.group !== undefined && spec.group !== FIELD_SPECS[index - 1]?.group
        ? GROUP_KEYS[spec.group]
        : undefined,
    spec,
  }))

export const SettingsForm = ({
  onReset,
  onSubmit,
  onUpdate,
  t,
  values,
}: SettingsFormProps): ReactElement => {
  // 影が OFF のときは、値を残したまま触れないようにする。
  const shadowOff = values['showShadow'] !== true
  return (
    <form
      className="fc-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <h2>{t('sectionDisplay')}</h2>
      <div className="fc-fields">
        {rowsOf().map(({ heading, spec }) => (
          <Fragment key={spec.key}>
            {heading === undefined ? null : <h3 className="group-heading">{t(heading)}</h3>}
            <FieldControl
              disabled={spec.group === 'shadow' && shadowOff}
              onInput={(value) => {
                onUpdate(spec.key, value)
              }}
              spec={spec}
              t={t}
              value={values[spec.key] ?? ''}
            />
          </Fragment>
        ))}
      </div>
      <div className="actions">
        <Button className="fc-primary" type="submit">
          {t('buttonSave')}
        </Button>
        <Button onClick={onReset} type="button">
          {t('buttonReset')}
        </Button>
      </div>
    </form>
  )
}
