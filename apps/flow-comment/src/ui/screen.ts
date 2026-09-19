// Runs with bun.
// Builds the settings screen and keeps the preview in step with the form.
import { createFlow } from '@my-onecomme-plugins/flow-comment-core/flow'
import type { FlowController } from '@my-onecomme-plugins/flow-comment-core/flow'
import {
  createVariableLookup,
  readFlowConfig,
  sanitizeConfig,
} from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'

import { createTranslator } from '../i18n'
import { findElements, setStatus } from './elements'
import type { UiElements } from './elements'
import { collectValues, syncShadowState, toSettingsMap } from './field-values'
import { wireFontList } from './fonts'
import { renderForm } from './form-fields'
import { createLabelFormatter } from './label-format'
import { wirePanels } from './panels'
import { fetchSettings, resetSettings, saveSettings } from './plugin-api'

const AUTOSAVE_DELAY_MS = 500

interface Screen {
  readonly flow: FlowController
  readonly replace: (next: FlowConfig, message: string) => void
  readonly resolve: () => FlowConfig
}

const readVariable = (name: string): string =>
  globalThis.getComputedStyle(document.documentElement).getPropertyValue(name)

// 保存時はフォームから直接読む。別に保持した値と食い違う余地をなくす。
const resolveSettings = (): FlowConfig => sanitizeConfig(collectValues())

const createAutosave = (save: () => Promise<void>): (() => void) => {
  let timer: ReturnType<typeof globalThis.setTimeout> | null = null
  return () => {
    if (timer !== null) {
      globalThis.clearTimeout(timer)
    }
    timer = globalThis.setTimeout(() => {
      timer = null
      void save()
    }, AUTOSAVE_DELAY_MS)
  }
}

const createScreen = (ui: UiElements, initial: FlowConfig): Screen => {
  const flow = createFlow(ui.preview, readFlowConfig(createVariableLookup(readVariable, initial)), {
    formatLabel: createLabelFormatter(createTranslator().t),
  })

  const redraw = (): void => {
    flow.applyConfig(readFlowConfig(createVariableLookup(readVariable, resolveSettings())))
  }

  const scheduleAutosave = createAutosave(async () => {
    await saveSettings(resolveSettings())
  })

  const onInput = (): void => {
    syncShadowState()
    redraw()
    scheduleAutosave()
  }

  const replace = (next: FlowConfig, message: string): void => {
    renderForm(ui.fields, toSettingsMap(next), onInput)
    syncShadowState()
    redraw()
    setStatus(ui.status, message)
  }

  renderForm(ui.fields, toSettingsMap(initial), onInput)
  syncShadowState()
  return { flow, replace, resolve: resolveSettings }
}

const wireActions = (ui: UiElements, screen: Screen): void => {
  const submit = async (event: Event): Promise<void> => {
    event.preventDefault()
    const saved = await saveSettings(screen.resolve())
    const failed = saved === null
    screen.replace(saved ?? screen.resolve(), failed ? '保存に失敗しました。' : '保存しました。')
  }

  const resetToDefaults = async (): Promise<void> => {
    const restored = await resetSettings()
    const failed = restored === null
    screen.replace(
      restored ?? screen.resolve(),
      failed ? '初期化に失敗しました。' : '初期値に戻しました。',
    )
  }

  ui.form.addEventListener('submit', (event) => {
    void submit(event)
  })
  ui.reset.addEventListener('click', () => {
    void resetToDefaults()
  })
}

export const startScreen = async (): Promise<void> => {
  const ui = findElements()
  const settings = await fetchSettings()
  if (ui === null) {
    return
  }
  if (settings === null) {
    setStatus(ui.status, '設定を読み込めませんでした。プラグインが有効か確認してください。')
  }
  const screen = createScreen(ui, settings ?? sanitizeConfig({}))
  setStatus(ui.status, '')
  wireFontList()
  wirePanels({
    apply: (next) => {
      screen.replace(next, '')
    },
    current: screen.resolve,
    flow: screen.flow,
    preview: ui.preview,
    status: ui.status,
  })
  wireActions(ui, screen)
}
