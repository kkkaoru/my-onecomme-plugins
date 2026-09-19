// Runs with bun.
// プリセット。一覧は起動時に読んで渡すので、ここでは操作だけを扱う。
import { Button } from '@base-ui/react/button'
import { Input } from '@base-ui/react/input'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import { useCallback, useState } from 'react'
import type { ReactElement } from 'react'

import type { SettingsApi } from '../api'
import type { Translate } from '../messages'
import { OptionSelect } from '../parts/option-select'
import type { PresetActions } from './preset-actions'
import { usePresetActions } from './preset-actions'

export interface PresetPanelProps {
  readonly api: SettingsApi
  readonly current: () => FlowConfig
  readonly initialNames: readonly string[]
  readonly onApply: (next: FlowConfig, message: string) => void
  readonly setStatus: (message: string) => void
  readonly t: Translate
}

interface StoreFieldProps {
  readonly actions: PresetActions
  readonly name: string
  readonly onName: (next: string) => void
}

const StoreField = ({
  actions,
  name,
  onName,
  t,
}: StoreFieldProps & { readonly t: Translate }): ReactElement => (
  <div className="fc-field">
    <label className="field-label" htmlFor="preset-name">
      {t('labelPresetName')}
    </label>
    <Input
      className="fc-input"
      id="preset-name"
      onChange={(event) => {
        onName(event.currentTarget.value)
      }}
      placeholder={t('placeholderPresetName')}
      type="text"
      value={name}
    />
    <Button
      className="fc-primary"
      onClick={() => {
        void actions.store()
      }}
      type="button"
    >
      {t('buttonPresetSave')}
    </Button>
  </div>
)

interface PickerFieldProps {
  readonly actions: PresetActions
  readonly names: readonly string[]
  readonly onSelect: (next: string) => void
  readonly selected: string
}

const PickerField = ({
  actions,
  names,
  onSelect,
  selected,
  t,
}: PickerFieldProps & { readonly t: Translate }): ReactElement => (
  <div className="fc-field">
    <span className="field-label">{t('labelPresetSaved')}</span>
    <OptionSelect
      label="保存済み"
      onSelect={onSelect}
      options={names.map((preset) => ({ label: preset, value: preset }))}
      value={selected}
    />
    <Button
      onClick={() => {
        void actions.load()
      }}
      type="button"
    >
      {t('buttonPresetLoad')}
    </Button>
    <Button
      onClick={() => {
        void actions.remove()
      }}
      type="button"
    >
      {t('buttonPresetDelete')}
    </Button>
  </div>
)

export const PresetPanel = ({ api, initialNames, t, ...rest }: PresetPanelProps): ReactElement => {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState('')
  const [names, setNames] = useState(initialNames)

  const refresh = useCallback(async (): Promise<void> => {
    const entries = await api.fetchPresets()
    setNames(entries.map(([key]) => key))
  }, [api])

  const actions = usePresetActions({ api, initialNames, t, ...rest }, name, selected, refresh)

  return (
    <section>
      <h2>{t('sectionPresets')}</h2>
      <StoreField actions={actions} name={name} onName={setName} t={t} />
      <PickerField
        actions={actions}
        names={names}
        onSelect={setSelected}
        selected={selected}
        t={t}
      />
    </section>
  )
}
