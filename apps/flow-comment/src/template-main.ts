import { createFlow } from '@my-onecomme-plugins/flow-comment-core/flow'
import type { FlowController } from '@my-onecomme-plugins/flow-comment-core/flow'
// Runs with bun.
// Template entry: resolve the settings, then let OneSDK feed the flow.
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import { createSettingsApi } from '@my-onecomme-plugins/flow-comment-ui/api'
import { metricsWanted } from '@my-onecomme-plugins/flow-comment-ui/hud'
import { subscribeSettings } from '@my-onecomme-plugins/flow-comment-ui/settings-sync'

import { toFlowComment } from './comment-map'
import { createTranslator } from './i18n'
import { FLOW_COMMENT_UID } from './settings/uid'
import { createLabelFormatter } from './ui/label-format'

const WATCH_INTERVAL_MS = 500

const PLUGIN_API = `http://127.0.0.1:11180/api/plugins/${FLOW_COMMENT_UID}`
const api = createSettingsApi(PLUGIN_API)

const applySettings = (flow: FlowController, settings: FlowConfig | null): void => {
  flow.applyConfig(settings ?? sanitizeConfig({}))
}

interface SettingsStamp {
  value: string
}

const applyIfChanged = (
  flow: FlowController,
  stamp: SettingsStamp,
  next: FlowConfig | null,
): void => {
  const serialized = JSON.stringify(next)
  if (serialized === stamp.value) {
    return
  }
  stamp.value = serialized
  applySettings(flow, next)
}

const watchSettings = (flow: FlowController, initial: FlowConfig | null): void => {
  const stamp: SettingsStamp = { value: JSON.stringify(initial) }
  subscribeSettings((next) => {
    applyIfChanged(flow, stamp, next)
  })
  const pull = async (): Promise<void> => {
    applyIfChanged(flow, stamp, await api.fetchSettings())
  }
  globalThis.setInterval(() => {
    void pull()
  }, WATCH_INTERVAL_MS)
}

const start = async (): Promise<void> => {
  const root = document.querySelector<HTMLElement>('#flow')
  if (root === null) {
    return
  }
  const settings = await api.fetchSettings()
  const flow = createFlow(root, settings ?? sanitizeConfig({}), {
    formatLabel: createLabelFormatter(createTranslator().t),
    metrics: metricsWanted(globalThis.location.search),
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
