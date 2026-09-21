import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FieldValue, FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
// Runs with bun.
// Settings read/write. Autosave is armed from update(), not from an effect.
import { useCallback, useMemo, useRef, useState } from 'react'

import type { SettingsApi } from '../api'
import type { Translate } from '../messages'

const AUTOSAVE_DELAY_MS = 500

export type FieldValues = Readonly<Record<string, FieldValue>>

export interface SettingsState {
  /** プリセットや JSON から差し込む。保存はしない。 */
  readonly apply: (next: FlowConfig, message: string) => void
  /** 常に最新の設定を返す。登録済みの外部ツールから呼ばれる。 */
  readonly current: () => FlowConfig
  readonly reset: () => Promise<void>
  readonly save: () => Promise<void>
  readonly setStatus: (message: string) => void
  readonly settings: FlowConfig
  readonly status: string
  readonly update: (key: string, value: FieldValue) => void
  readonly values: FieldValues
}

export const valuesOf = (config: FlowConfig): FieldValues => ({ ...config })

interface LatestBox {
  readonly current: FlowConfig
}

const useAutosave = (
  api: SettingsApi,
  latest: LatestBox,
): { readonly arm: () => void; readonly stop: () => void } => {
  const persist = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stop = useCallback((): void => {
    if (persist.current === null) {
      return
    }
    globalThis.clearTimeout(persist.current)
    persist.current = null
  }, [])
  const arm = useCallback((): void => {
    stop()
    persist.current = globalThis.setTimeout(() => {
      persist.current = null
      void api.saveSettings(latest.current)
    }, AUTOSAVE_DELAY_MS)
  }, [api, latest, stop])
  return { arm, stop }
}

export const useSettings = (
  api: SettingsApi,
  initial: FlowConfig | null,
  t: Translate,
): SettingsState => {
  const [values, setValues] = useState<FieldValues>(() => valuesOf(initial ?? sanitizeConfig({})))
  const [status, setStatus] = useState(() => (initial === null ? t('loadFailed') : ''))
  const settings = useMemo(() => sanitizeConfig(values), [values])
  const latest = useRef(settings)
  const { arm, stop } = useAutosave(api, latest)

  const update = useCallback(
    (key: string, value: FieldValue): void => {
      setValues((previous) => {
        const next = { ...previous, [key]: value }
        latest.current = sanitizeConfig(next)
        return next
      })
      arm()
    },
    [arm],
  )

  const apply = useCallback(
    (next: FlowConfig, message: string): void => {
      stop()
      latest.current = next
      setValues(valuesOf(next))
      setStatus(message)
      void api.saveSettings(next)
    },
    [api, stop],
  )

  const save = useCallback(async (): Promise<void> => {
    stop()
    const stored = await api.saveSettings(latest.current)
    setStatus(stored === null ? t('saveFailed') : t('saveSuccess'))
  }, [api, stop, t])

  const reset = useCallback(async (): Promise<void> => {
    stop()
    const restored = await api.resetSettings()
    if (restored === null) {
      setStatus(t('resetFailed'))
      return
    }
    latest.current = restored
    setValues(valuesOf(restored))
    setStatus(t('resetSuccess'))
  }, [api, stop, t])

  const current = useCallback((): FlowConfig => latest.current, [])

  return { apply, current, reset, save, setStatus, settings, status, update, values }
}
