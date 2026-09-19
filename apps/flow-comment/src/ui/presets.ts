// Runs with bun.
// Save, load and delete named presets from the panel next to the form.
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'

import { setStatus } from './elements'
import { deletePreset, fetchPresets, savePreset } from './plugin-api'

const PRESET_NAME_ID = 'preset-name'
const PRESET_LIST_ID = 'preset-list'

interface PresetWiring {
  readonly apply: (settings: FlowConfig) => void
  readonly current: () => FlowConfig
  readonly status: HTMLElement
}

interface PresetElements {
  readonly list: HTMLSelectElement
  readonly load: HTMLElement
  readonly name: HTMLInputElement
  readonly remove: HTMLElement
  readonly save: HTMLElement
}

const findPresetElements = (): PresetElements | null => {
  const name = document.querySelector<HTMLInputElement>(`#${PRESET_NAME_ID}`)
  const list = document.querySelector<HTMLSelectElement>(`#${PRESET_LIST_ID}`)
  const save = document.querySelector<HTMLElement>('#preset-save')
  const load = document.querySelector<HTMLElement>('#preset-load')
  const remove = document.querySelector<HTMLElement>('#preset-delete')
  if (name === null || list === null || save === null || load === null || remove === null) {
    return null
  }
  return { list, load, name, remove, save }
}

const refreshPresetList = async (list: HTMLSelectElement): Promise<void> => {
  const entries = await fetchPresets()
  list.replaceChildren(
    ...entries.map(([name]) => {
      const option = document.createElement('option')
      option.value = name
      option.textContent = name
      return option
    }),
  )
}

const wirePresetSave = (
  { name, save }: PresetElements,
  { current, status }: PresetWiring,
  refresh: () => Promise<void>,
): void => {
  save.addEventListener('click', () => {
    void (async (): Promise<void> => {
      const preset = name.value.trim()
      if (preset === '') {
        setStatus(status, 'プリセット名を入力してください。')
        return
      }
      const saved = await savePreset(preset, current())
      setStatus(
        status,
        saved ? `「${preset}」を保存しました。` : 'プリセットの保存に失敗しました。',
      )
      await refresh()
    })()
  })
}

const wirePresetLoad = ({ list, load }: PresetElements, { apply, status }: PresetWiring): void => {
  load.addEventListener('click', () => {
    void (async (): Promise<void> => {
      const name = list.value
      const entries = await fetchPresets()
      const found = entries.find(([key]) => key === name)
      if (found === undefined) {
        setStatus(status, '読み込むプリセットを選んでください。')
        return
      }
      apply(sanitizeConfig(found[1]))
      setStatus(status, `「${name}」を読み込みました。保存すると確定します。`)
    })()
  })
}

const wirePresetRemove = (
  { list, remove }: PresetElements,
  { status }: PresetWiring,
  refresh: () => Promise<void>,
): void => {
  remove.addEventListener('click', () => {
    void (async (): Promise<void> => {
      const name = list.value
      if (name === '') {
        return
      }
      await deletePreset(name)
      setStatus(status, `「${name}」を削除しました。`)
      await refresh()
    })()
  })
}

export const wirePresets = (wiring: PresetWiring): void => {
  const elements = findPresetElements()
  if (elements === null) {
    return
  }
  const refresh = (): Promise<void> => refreshPresetList(elements.list)
  wirePresetSave(elements, wiring, refresh)
  wirePresetLoad(elements, wiring)
  wirePresetRemove(elements, wiring, refresh)
  void refresh()
}
