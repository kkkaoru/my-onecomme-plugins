// Runs with bun.
// 設定画面の入口。プラグイン固有の情報（UID と言語）を与えて、
// 画面そのものは flow-comment-ui に任せる。
import { createSettingsApi } from '@my-onecomme-plugins/flow-comment-ui/api'
import { SettingsScreen } from '@my-onecomme-plugins/flow-comment-ui/settings-screen'
import { createRoot } from 'react-dom/client'

import { createTranslator } from './i18n'
import { FLOW_COMMENT_UID } from './settings/uid'
import { createAppLabelFormatter } from './ui/label-format'

const start = async (): Promise<void> => {
  const container = document.querySelector('#root')
  if (container === null) {
    return
  }
  const api = createSettingsApi(`/api/plugins/${FLOW_COMMENT_UID}`)
  const [settings, presets] = await Promise.all([api.fetchSettings(), api.fetchPresets()])
  createRoot(container).render(
    <SettingsScreen
      t={createTranslator().t}
      api={api}
      formatLabel={createAppLabelFormatter()}
      initialPresets={presets.map(([name]) => name)}
      initialSettings={settings}
    />,
  )
}

void start()
