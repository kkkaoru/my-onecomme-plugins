// Runs with bun.
// プラグインの REST API。URL を組み立てる場所をここ1つに閉じ込める。
// どのプラグインかを知っているのは呼び出し側（アプリ）なので、baseUrl は外から受ける。
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'

import { publishSettings } from './settings-sync'

const STATUS_OK = 200
const PRESET_QUERY = '?action=presets'

export interface SettingsApi {
  readonly deletePreset: (name: string) => Promise<boolean>
  readonly fetchPresets: () => Promise<readonly (readonly [string, unknown])[]>
  readonly fetchSettings: () => Promise<FlowConfig | null>
  readonly resetSettings: () => Promise<FlowConfig | null>
  readonly savePreset: (name: string, settings: FlowConfig) => Promise<boolean>
  readonly saveSettings: (settings: FlowConfig) => Promise<FlowConfig | null>
}

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null

// OneComme wraps every plugin response in { code, response }.
const readEnvelope = (payload: unknown): unknown => {
  if (!isRecord(payload)) {
    return null
  }
  if (Object.hasOwn(payload, 'response')) {
    return payload['response'] ?? null
  }
  return Object.hasOwn(payload, 'lanes') ? payload : null
}

export const createSettingsApi = (baseUrl: string): SettingsApi => {
  const request = async (method: string, body?: unknown, query = ''): Promise<unknown> => {
    try {
      const init: RequestInit = { cache: 'no-store', method }
      if (body !== undefined) {
        init.body = JSON.stringify(body)
        init.headers = { 'content-type': 'application/json' }
      }
      const response = await fetch(`${baseUrl}${query}`, init)
      if (response.status !== STATUS_OK) {
        return null
      }
      return readEnvelope(await response.json())
    } catch (error) {
      console.info('[flow-comment] plugin request failed', error)
      return null
    }
  }

  const requestSettings = async (method: string, body?: unknown): Promise<FlowConfig | null> => {
    const payload = await request(method, body)
    return payload === null ? null : sanitizeConfig(payload)
  }

  const storeAndPublish = async (method: string, body?: unknown): Promise<FlowConfig | null> => {
    const stored = await requestSettings(method, body)
    if (stored !== null) {
      publishSettings(stored)
    }
    return stored
  }

  const fetchSettings = (): Promise<FlowConfig | null> => requestSettings('GET')
  const saveSettings = (settings: FlowConfig): Promise<FlowConfig | null> =>
    storeAndPublish('PUT', settings)
  const resetSettings = (): Promise<FlowConfig | null> => storeAndPublish('DELETE')

  const fetchPresets = async (): Promise<readonly (readonly [string, unknown])[]> => {
    const payload = await request('GET', undefined, PRESET_QUERY)
    return isRecord(payload) ? Object.entries(payload) : []
  }

  const savePreset = async (name: string, settings: FlowConfig): Promise<boolean> => {
    const query = `${PRESET_QUERY}&name=${encodeURIComponent(name)}`
    return (await request('PUT', settings, query)) !== null
  }

  const deletePreset = async (name: string): Promise<boolean> => {
    const query = `${PRESET_QUERY}&name=${encodeURIComponent(name)}`
    return (await request('DELETE', undefined, query)) !== null
  }

  return { deletePreset, fetchPresets, fetchSettings, resetSettings, savePreset, saveSettings }
}
