// Runs with bun.
// The plugin REST API. Every read and write goes through here so no component
// builds a URL or parses an envelope itself.
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'

import { FLOW_COMMENT_UID } from '../settings/uid'

const STATUS_OK = 200
const PRESET_QUERY = '?action=presets'
const API_URL = `/api/plugins/${FLOW_COMMENT_UID}`

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null

// OneComme wraps every plugin response in { code, response }.
const readEnvelope = (payload: unknown): unknown => {
  if (!isRecord(payload)) {
    return null
  }
  return Object.entries(payload).find(([key]) => key === 'response')?.[1] ?? null
}

const request = async (method: string, body?: unknown, query = ''): Promise<unknown> => {
  try {
    const init: RequestInit = { cache: 'no-store', method }
    if (body !== undefined) {
      init.body = JSON.stringify(body)
    }
    const response = await fetch(`${API_URL}${query}`, init)
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

export const fetchSettings = (): Promise<FlowConfig | null> => requestSettings('GET')

export const saveSettings = (settings: FlowConfig): Promise<FlowConfig | null> =>
  requestSettings('PUT', settings)

export const resetSettings = (): Promise<FlowConfig | null> => requestSettings('DELETE')

export const fetchPresets = async (): Promise<readonly (readonly [string, unknown])[]> => {
  const payload = await request('GET', undefined, PRESET_QUERY)
  return isRecord(payload) ? Object.entries(payload) : []
}

export const savePreset = async (name: string, settings: FlowConfig): Promise<boolean> => {
  const query = `${PRESET_QUERY}&name=${encodeURIComponent(name)}`
  return (await request('PUT', settings, query)) !== null
}

export const deletePreset = async (name: string): Promise<boolean> => {
  const query = `${PRESET_QUERY}&name=${encodeURIComponent(name)}`
  return (await request('DELETE', undefined, query)) !== null
}

export { API_URL, PRESET_QUERY }
