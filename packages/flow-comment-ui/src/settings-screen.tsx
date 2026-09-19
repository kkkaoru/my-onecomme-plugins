import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import { StatusLine } from '@my-onecomme-plugins/flow-comment-ui/status-line'
// Runs with bun.
// 画面の組み立て。状態はここで1つにまとめ、下のパネルには口だけを渡す。
import type { ReactElement } from 'react'

import type { SettingsApi } from './api'
import { useModelTools } from './hooks/use-model-tools'
import { useSettings } from './hooks/use-settings'
import { JsonPanel } from './panels/json-panel'
import { PresetPanel } from './panels/preset-panel'
import { PreviewPanel } from './panels/preview-panel'
import type { PreviewPanelProps } from './panels/preview-panel'
import { SettingsForm } from './settings-form'
import type { SettingsFormProps } from './settings-form'

export interface SettingsScreenProps {
  readonly api: SettingsApi
  readonly formatLabel: PreviewPanelProps['formatLabel']
  readonly t: SettingsFormProps['t']
  readonly initialPresets: readonly string[]
  readonly initialSettings: FlowConfig | null
}

export const SettingsScreen = ({
  api,
  formatLabel,
  initialPresets,
  initialSettings,
  t,
}: SettingsScreenProps): ReactElement => {
  const { apply, current, reset, save, setStatus, settings, status, update, values } = useSettings(
    api,
    initialSettings,
    t,
  )
  useModelTools({ api, apply, current, setStatus, t })

  return (
    <main>
      <h1>Flow Comment</h1>
      <p className="lead">{t('appDescription')}</p>
      <PreviewPanel formatLabel={formatLabel} settings={settings} t={t} />
      <PresetPanel
        api={api}
        current={current}
        initialNames={initialPresets}
        onApply={apply}
        setStatus={setStatus}
        t={t}
      />
      <JsonPanel current={current} onApply={apply} setStatus={setStatus} t={t} />
      <SettingsForm
        onReset={() => {
          void reset()
        }}
        onSubmit={() => {
          void save()
        }}
        onUpdate={update}
        t={t}
        values={values}
      />
      <StatusLine message={status} />
    </main>
  )
}
