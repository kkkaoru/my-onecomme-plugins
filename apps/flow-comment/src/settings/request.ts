// Runs with bun.
// わんコメの REST API のルーティング。?action=presets の有無で
// 設定本体とプリセットを分け、method で読み・書き・初期化を分ける。
import {
  deletePreset,
  readPresets,
  readSettings,
  resetSettings,
  savePreset,
  saveSettings,
} from './store'
import type { OneCommeStore, PluginRequest, PluginResponse } from './types'

const STATUS_OK = 200
const STATUS_NOT_FOUND = 404
const ACTION_PRESETS = 'presets'
const ACTION_SETTINGS = 'settings'

const readAction = (req: PluginRequest): string => req.params?.action ?? ACTION_SETTINGS
const readPresetName = (req: PluginRequest): string => req.params?.name ?? ''

const handleGet = (store: OneCommeStore, action: string): PluginResponse =>
  action === ACTION_PRESETS
    ? { code: STATUS_OK, response: Object.fromEntries(readPresets(store)) }
    : { code: STATUS_OK, response: readSettings(store) }

interface PutInput {
  readonly action: string
  readonly body: unknown
  readonly name: string
}

const handlePut = (store: OneCommeStore, { action, body, name }: PutInput): PluginResponse => ({
  code: STATUS_OK,
  response:
    action === ACTION_PRESETS && name !== ''
      ? savePreset(store, name, body)
      : saveSettings(store, body),
})

const handleDelete = (store: OneCommeStore, action: string, name: string): PluginResponse =>
  action === ACTION_PRESETS
    ? { code: STATUS_OK, response: { deleted: deletePreset(store, name) } }
    : { code: STATUS_OK, response: resetSettings(store) }

export const handleRequest = (store: OneCommeStore, req: PluginRequest): PluginResponse => {
  const method = req.method.toUpperCase()
  const action = readAction(req)
  const name = readPresetName(req)
  if (method === 'GET') {
    return handleGet(store, action)
  }
  if (method === 'PUT' || method === 'POST') {
    return handlePut(store, { action, body: req.body, name })
  }
  if (method === 'DELETE') {
    return handleDelete(store, action, name)
  }
  return { code: STATUS_NOT_FOUND, response: {} }
}
