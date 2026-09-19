// Runs with bun.
// WebMCP tools, so an AI agent can read and change the settings without the UI.
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'

import { setStatus } from './elements'
import type { JsonIoWiring } from './json-io'
import { fetchPresets, savePreset, saveSettings } from './plugin-api'

interface ModelTool {
  readonly description: string
  readonly execute: (args: Readonly<Record<string, unknown>>) => Promise<unknown>
  readonly inputSchema: Readonly<Record<string, unknown>>
  readonly name: string
}

interface ModelContextLike {
  readonly registerTool: (tool: ModelTool) => unknown
}

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null

const isModelContext = (value: unknown): value is ModelContextLike =>
  isRecord(value) && typeof value.registerTool === 'function'

// WebMCP は document.modelContext が正式。移行期のため navigator 側も見る。
const resolveModelContext = (): ModelContextLike | null => {
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

const readSettingsTool = ({ current }: JsonIoWiring): ModelTool => ({
  description: 'Flow Comment テンプレートの現在の表示設定を JSON で返す。',
  execute: () => Promise.resolve(JSON.stringify(current())),
  inputSchema: { properties: {}, type: 'object' },
  name: 'get_flow_comment_settings',
})

const updateSettingsTool = ({ apply, current, status }: JsonIoWiring): ModelTool => ({
  description:
    'Flow Comment の表示設定を更新して保存する。settings には変更したい項目だけを含める（含めない項目は現在値を保つ）。',
  execute: async (args) => {
    const patch = args.settings
    const next = sanitizeConfig({ ...current(), ...(isRecord(patch) ? patch : {}) })
    apply(next)
    const saved = await saveSettings(next)
    if (saved === null) {
      setStatus(status, '保存に失敗しました。')
      return 'failed'
    }
    setStatus(status, '設定を更新しました。')
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

const listPresetsTool = (): ModelTool => ({
  description: '保存済みプリセットの名前一覧を JSON 配列で返す。',
  execute: async () => {
    const entries = await fetchPresets()
    return JSON.stringify(entries.map(([name]) => name))
  },
  inputSchema: { properties: {}, type: 'object' },
  name: 'list_flow_comment_presets',
})

const savePresetTool = ({ current }: JsonIoWiring): ModelTool => ({
  description: '現在の設定を指定した名前のプリセットとして保存する。',
  execute: async (args) => {
    const name = readStringArgument(args, 'name').trim()
    if (name === '') {
      return 'name is required'
    }
    const saved = await savePreset(name, current())
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
const buildModelTools = (wiring: JsonIoWiring): readonly ModelTool[] => [
  readSettingsTool(wiring),
  updateSettingsTool(wiring),
  listPresetsTool(),
  savePresetTool(wiring),
]

export const wireModelContext = (wiring: JsonIoWiring): void => {
  const context = resolveModelContext()
  if (context === null) {
    console.info('[flow-comment] WebMCP 未対応のため設定ツールは登録しません')
    return
  }
  for (const tool of buildModelTools(wiring)) {
    context.registerTool(tool)
  }
  console.info('[flow-comment] WebMCP に設定ツールを登録しました')
}
