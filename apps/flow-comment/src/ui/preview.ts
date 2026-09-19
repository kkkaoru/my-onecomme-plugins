// Runs with bun.
// Streams the sample comments into the preview box so the settings can be seen
// moving. Buttons push one sample at a time; the light theme flip is local to
// the preview so the settings page keeps its own colours.
import type { FlowController } from '@my-onecomme-plugins/flow-comment-core/flow'

import { PREVIEW_SAMPLES } from './samples'

const PREVIEW_INTERVAL_MS = 900
const PREVIEW_SAMPLES_ID = 'preview-samples'
const PREVIEW_THEME_ID = 'preview-theme'
const LIGHT_THEME_VALUE = 'light'
const LIGHT_THEME_CLASS = 'is-light'

export const startPreview = (flow: FlowController): ReturnType<typeof globalThis.setInterval> => {
  let index = 0
  return globalThis.setInterval(() => {
    const sample = PREVIEW_SAMPLES[index % PREVIEW_SAMPLES.length]
    if (sample !== undefined) {
      flow.push({ ...sample.comment, id: `${sample.comment.id}-${index}` })
    }
    index += 1
  }, PREVIEW_INTERVAL_MS)
}

// 種類ごとのサンプルをその場で流して確認できるようにする。
export const wirePreviewSamples = (flow: FlowController): void => {
  const container = document.querySelector<HTMLElement>(`#${PREVIEW_SAMPLES_ID}`)
  if (container === null) {
    return
  }
  let count = 0
  container.replaceChildren(
    ...PREVIEW_SAMPLES.map((sample) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = sample.label
      button.addEventListener('click', () => {
        count += 1
        flow.push({ ...sample.comment, id: `${sample.comment.id}-manual-${count}` })
      })
      return button
    }),
  )
}

export const wirePreviewTheme = (preview: HTMLElement): void => {
  const inputs = document.querySelectorAll<HTMLInputElement>(`input[name="${PREVIEW_THEME_ID}"]`)
  if (inputs.length === 0) {
    return
  }
  const apply = (): void => {
    const checked = [...inputs].find((input) => input.checked)
    preview.classList.toggle(LIGHT_THEME_CLASS, checked?.value === LIGHT_THEME_VALUE)
  }
  for (const input of inputs) {
    input.addEventListener('change', apply)
  }
  apply()
}
