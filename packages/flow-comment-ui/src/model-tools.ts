// Runs with bun.
// WebMCP tools, so an AI agent can read and change the settings without the UI.
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'

import type { SettingsApi } from './api'
import type { Translate } from './messages'

export interface ModelTool {
  readonly description: string
  readonly execute: (args: Readonly<Record<string, unknown>>) => Promise<unknown>
  readonly inputSchema: Readonly<Record<string, unknown>>
  readonly name: string
}

interface ModelContextLike {
  readonly registerTool: (tool: ModelTool) => unknown
}

/** 設定画面の状態を渡す口。ツールは画面ではなくこの口だけを見る。 */
export interface ModelToolWiring {
  readonly api: SettingsApi
  readonly t: Translate
  readonly apply: (next: FlowConfig, message: string) => void
  readonly current: () => FlowConfig
  readonly setStatus: (message: string) => void
}

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null

const isModelContext = (value: unknown): value is ModelContextLike =>
  isRecord(value) && typeof value['registerTool'] === 'function'

// WebMCP は document.modelContext が正式。移行期のため navigator 側も見る。
export const resolveModelContext = (): ModelContextLike | null => {
  for (const source of [document, navigator]) {
    const candidate = Reflect.get(source, 'modelContext')
    if (isModelContext(candidate)) {
      return candidate
    }
  }
  return null
}

const readStringArgument = (args: Readonly<Record<string, unknown>>, key: string): string => {
  const value = args[key]
  return typeof value === 'string' ? value : ''
}

const readSettingsTool = ({ current, t }: ModelToolWiring): ModelTool => ({
  description: t('toolGetSettings'),
  execute: () => Promise.resolve(JSON.stringify(current())),
  inputSchema: { properties: {}, type: 'object' },
  name: 'get_flow_comment_settings',
})

const updateSettingsTool = ({ api, apply, current, setStatus, t }: ModelToolWiring): ModelTool => ({
  description: t('toolUpdateSettings'),
  execute: async (args) => {
    const patch = args['settings']
    const next = sanitizeConfig({ ...current(), ...(isRecord(patch) ? patch : {}) })
    apply(next, '')
    const saved = await api.saveSettings(next)
    if (saved === null) {
      setStatus(t('saveFailed'))
      return 'failed'
    }
    setStatus('設定を更新しました。')
    return JSON.stringify(saved)
  },
  inputSchema: {
    properties: {
      settings: { description: '更新する項目のみを含む JSON オブジェクト', type: 'object' },
    },
    required: ['settings'],
    type: 'object',
  },
  name: 'update_flow_comment_settings',
})

const listPresetsTool = ({ api, t }: ModelToolWiring): ModelTool => ({
  description: t('toolListPresets'),
  execute: async () => {
    const entries = await api.fetchPresets()
    return JSON.stringify(entries.map(([name]) => name))
  },
  inputSchema: { properties: {}, type: 'object' },
  name: 'list_flow_comment_presets',
})

const savePresetTool = ({ api, current, t }: ModelToolWiring): ModelTool => ({
  description: t('toolSavePreset'),
  execute: async (args) => {
    const name = readStringArgument(args, 'name').trim()
    if (name === '') {
      return 'name is required'
    }
    const saved = await api.savePreset(name, current())
    return saved ? `saved ${name}` : 'failed'
  },
  inputSchema: {
    properties: { name: { description: 'プリセット名', type: 'string' } },
    required: ['name'],
    type: 'object',
  },
  name: 'save_flow_comment_preset',
})

// AI エージェントが UI を介さず設定を扱えるよう、同じ操作をツールとして公開する。
export const buildModelTools = (wiring: ModelToolWiring): readonly ModelTool[] => [
  readSettingsTool(wiring),
  updateSettingsTool(wiring),
  listPresetsTool(wiring),
  savePresetTool(wiring),
]
