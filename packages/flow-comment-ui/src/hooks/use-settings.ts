import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FieldValue, FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
// Runs with bun.
// 設定の読み書き。初期値は React の外で読んで渡すので、ここに読み込みの
// effect は要らない。残る effect は自動保存のタイマーだけ。
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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

interface Ref<T> {
  current: T
}

// 入力のたびに保存すると重いので、止まってから保存する。最新値の控えも
// ここで更新し、外部から読めるようにする。
const usePersist = (
  api: SettingsApi,
  settings: FlowConfig,
  latest: Ref<FlowConfig>,
  dirty: Ref<boolean>,
): void => {
  useEffect(() => {
    // oxlint-disable-next-line react/immutability -- 最新値の控えを更新する
    latest.current = settings
    if (!dirty.current) {
      return
    }
    const timer = globalThis.setTimeout(() => {
      dirty.current = false
      void api.saveSettings(settings)
    }, AUTOSAVE_DELAY_MS)
    return (): void => {
      globalThis.clearTimeout(timer)
    }
  }, [api, dirty, latest, settings])
}

export const useSettings = (
  api: SettingsApi,
  initial: FlowConfig | null,
  t: Translate,
): SettingsState => {
  const [values, setValues] = useState<FieldValues>(() => valuesOf(initial ?? sanitizeConfig({})))
  const [status, setStatus] = useState(() => (initial === null ? t('loadFailed') : ''))
  const dirty = useRef(false)
  const settings = useMemo(() => sanitizeConfig(values), [values])
  const latest = useRef(settings)

  usePersist(api, settings, latest, dirty)

  const update = useCallback((key: string, value: FieldValue): void => {
    dirty.current = true
    setValues((previous) => ({ ...previous, [key]: value }))
  }, [])

  const apply = useCallback((next: FlowConfig, message: string): void => {
    dirty.current = false
    setValues(valuesOf(next))
    setStatus(message)
  }, [])

  const save = useCallback(async (): Promise<void> => {
    const stored = await api.saveSettings(latest.current)
    dirty.current = false
    if (stored === null) {
      setStatus(t('saveFailed'))
      return
    }
    setValues(valuesOf(stored))
    setStatus(t('saveSuccess'))
  }, [api, t])

  const reset = useCallback(async (): Promise<void> => {
    const restored = await api.resetSettings()
    dirty.current = false
    if (restored === null) {
      setStatus(t('resetFailed'))
      return
    }
    setValues(valuesOf(restored))
    setStatus(t('resetSuccess'))
  }, [api, t])

  const current = useCallback((): FlowConfig => latest.current, [])

  return { apply, current, reset, save, setStatus, settings, status, update, values }
}
