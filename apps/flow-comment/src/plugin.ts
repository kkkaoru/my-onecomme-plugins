// Runs with bun.
// OneComme plugin entry. Built to CommonJS: the app requires module.exports to
// be the plugin object itself.
import { DEFAULT_CONFIG } from '@my-onecomme-plugins/flow-comment-core/settings'

import { handleRequest } from './settings/request'
import type { OneCommeStore, PluginRequest, PluginResponse } from './settings/types'
import { FLOW_COMMENT_UID } from './settings/uid'

interface PluginContext {
  readonly store: OneCommeStore
}

interface PluginState {
  store: OneCommeStore | null
}

const STATUS_UNAVAILABLE = 404
const state: PluginState = { store: null }

const plugin = {
  author: 'kkkaoru',
  defaultState: { settings: DEFAULT_CONFIG },
  destroy(): void {
    state.store = null
  },
  init(context: PluginContext): void {
    state.store = context.store
    console.info(`[flow-comment] enabled: ${FLOW_COMMENT_UID}`)
  },
  name: 'Flow Comment',
  permissions: [],
  request(req: PluginRequest): PluginResponse {
    if (state.store === null) {
      return { code: STATUS_UNAVAILABLE, response: {} }
    }
    return handleRequest(state.store, req)
  },
  uid: FLOW_COMMENT_UID,
  url: `http://localhost:11180/plugins/${FLOW_COMMENT_UID}/`,
  version: '0.0.0',
}

export default plugin
