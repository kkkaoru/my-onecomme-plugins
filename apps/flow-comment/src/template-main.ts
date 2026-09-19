import { createFlow } from '@my-onecomme-plugins/flow-comment-core/flow'
import type { FlowController } from '@my-onecomme-plugins/flow-comment-core/flow'
// Runs with bun.
// Template entry: resolve the settings, then let OneSDK feed the flow.
import {
  createVariableLookup,
  readFlowConfig,
} from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import { createSettingsApi } from '@my-onecomme-plugins/flow-comment-ui/api'

import { toFlowComment } from './comment-map'
import { createTranslator } from './i18n'
import { FLOW_COMMENT_UID } from './settings/uid'
import { createLabelFormatter } from './ui/label-format'

const WATCH_INTERVAL_MS = 2000

const api = createSettingsApi(`/api/plugins/${FLOW_COMMENT_UID}`)

const readVariable = (name: string): string =>
  globalThis.getComputedStyle(document.documentElement).getPropertyValue(name)

const applySettings = (flow: FlowController, settings: FlowConfig | null): void => {
  flow.applyConfig(readFlowConfig(createVariableLookup(readVariable, settings)))
}

// OBS のブラウザソースを読み込み直さずに設定変更を反映するため、変更を監視する。
const watchSettings = (flow: FlowController, initial: FlowConfig | null): void => {
  let current = JSON.stringify(initial)
  const check = async (): Promise<void> => {
    const next = await api.fetchSettings()
    const serialized = JSON.stringify(next)
    if (serialized === current) {
      return
    }
    current = serialized
    applySettings(flow, next)
  }
  globalThis.setInterval(() => {
    void check()
  }, WATCH_INTERVAL_MS)
}

const start = async (): Promise<void> => {
  const root = document.querySelector<HTMLElement>('#flow')
  if (root === null) {
    return
  }
  const settings = await api.fetchSettings()
  const flow = createFlow(root, readFlowConfig(createVariableLookup(readVariable, settings)), {
    formatLabel: createLabelFormatter(createTranslator().t),
  })
  watchSettings(flow, settings)
  await OneSDK.ready()
  // OneSDK の API 名であって React のフックではない。
  // oxlint-disable-next-line react-hooks/rules-of-hooks -- OneSDK の usePermission
  OneSDK.setup({ mode: 'diff', permissions: OneSDK.usePermission([OneSDK.PERM.COMMENT]) })
  OneSDK.subscribe({
    action: 'comments',
    callback: (comments) => {
      for (const comment of comments) {
        flow.push(toFlowComment(comment))
      }
    },
  })
  OneSDK.connect()
}

void start()
