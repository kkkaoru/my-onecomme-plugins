import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
// Runs with bun.
// プリセットの保存・読み込み・削除。画面本体は組み立てだけを持つ。
import { useCallback } from 'react'

import type { PresetPanelProps } from './preset-panel'

export interface PresetActions {
  readonly load: () => Promise<void>
  readonly remove: () => Promise<void>
  readonly store: () => Promise<void>
}

export const usePresetActions = (
  { api, current, onApply, setStatus, t }: PresetPanelProps,
  name: string,
  selected: string,
  refresh: () => Promise<void>,
): PresetActions => {
  const store = useCallback(async (): Promise<void> => {
    const trimmed = name.trim()
    if (trimmed === '') {
      setStatus(t('presetNameRequired'))
      return
    }
    const saved = await api.savePreset(trimmed, current())
    setStatus(saved ? t('presetSaved', { name: trimmed }) : t('presetSaveFailed'))
    await refresh()
  }, [api, current, name, refresh, setStatus, t])

  const load = useCallback(async (): Promise<void> => {
    const entries = await api.fetchPresets()
    const found = entries.find(([key]) => key === selected)
    if (found === undefined) {
      setStatus(t('presetLoadFailed'))
      return
    }
    onApply(sanitizeConfig(found[1]), t('presetLoaded', { name: selected }))
  }, [api, onApply, selected, setStatus, t])

  const remove = useCallback(async (): Promise<void> => {
    if (selected === '') {
      return
    }
    await api.deletePreset(selected)
    setStatus(t('presetDeleted', { name: selected }))
    await refresh()
  }, [api, refresh, selected, setStatus, t])

  return { load, remove, store }
}
