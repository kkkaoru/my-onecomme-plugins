// Runs with bun.
// 設定とプリセットの永続化。保存先はわんコメの store（ElectronStore）で、
// 形式はどちらも FlowConfig の JSON。
import { DEFAULT_CONFIG, sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'

import type { OneCommeStore } from './types'

const SETTINGS_KEY = 'settings'
const PRESETS_KEY = 'presets'

export const readSettings = (store: OneCommeStore): FlowConfig =>
  sanitizeConfig(store.get(SETTINGS_KEY))

export const saveSettings = (store: OneCommeStore, body: unknown): FlowConfig => {
  const settings = sanitizeConfig(body)
  store.set(SETTINGS_KEY, settings)
  return settings
}

export const resetSettings = (store: OneCommeStore): FlowConfig => {
  store.set(SETTINGS_KEY, DEFAULT_CONFIG)
  return DEFAULT_CONFIG
}

export const readPresets = (store: OneCommeStore): ReadonlyMap<string, FlowConfig> => {
  const stored = store.get(PRESETS_KEY)
  const presets = new Map<string, FlowConfig>()
  if (typeof stored === 'object' && stored !== null) {
    for (const [name, value] of Object.entries(stored)) {
      presets.set(name, sanitizeConfig(value))
    }
  }
  return presets
}

const writePresets = (store: OneCommeStore, presets: ReadonlyMap<string, FlowConfig>): void => {
  store.set(PRESETS_KEY, Object.fromEntries(presets))
}

export const savePreset = (store: OneCommeStore, name: string, body: unknown): FlowConfig => {
  const presets = new Map(readPresets(store))
  const settings = sanitizeConfig(body)
  presets.set(name, settings)
  writePresets(store, presets)
  return settings
}

export const deletePreset = (store: OneCommeStore, name: string): boolean => {
  const presets = new Map(readPresets(store))
  const removed = presets.delete(name)
  writePresets(store, presets)
  return removed
}
