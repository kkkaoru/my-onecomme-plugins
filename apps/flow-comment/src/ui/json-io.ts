// Runs with bun.
// The whole settings object in and out of one textarea, for people who would
// rather paste JSON than click.
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'

import { setStatus } from './elements'

const JSON_TEXTAREA_ID = 'io-json'
const JSON_INDENT = 2

export interface JsonIoWiring {
  readonly apply: (settings: FlowConfig) => void
  readonly current: () => FlowConfig
  readonly status: HTMLElement
}

// AI エージェントが設定を読み書きしやすいよう、全項目を JSON で入出力できるようにする。
export const wireJsonIo = ({ apply, current, status }: JsonIoWiring): void => {
  const textarea = document.querySelector<HTMLTextAreaElement>(`#${JSON_TEXTAREA_ID}`)
  const exportButton = document.querySelector<HTMLElement>('#io-export')
  const copyButton = document.querySelector<HTMLElement>('#io-copy')
  const importButton = document.querySelector<HTMLElement>('#io-import')
  if (textarea === null || exportButton === null || copyButton === null || importButton === null) {
    return
  }

  exportButton.addEventListener('click', () => {
    textarea.value = `${JSON.stringify(current(), null, JSON_INDENT)}\n`
    setStatus(status, '現在の設定を書き出しました。')
  })

  copyButton.addEventListener('click', () => {
    void (async (): Promise<void> => {
      try {
        await navigator.clipboard.writeText(textarea.value)
        setStatus(status, 'クリップボードにコピーしました。')
      } catch (error) {
        console.info('[flow-comment] clipboard write failed', error)
        setStatus(status, 'コピーできませんでした。テキストを選択してコピーしてください。')
      }
    })()
  })

  importButton.addEventListener('click', () => {
    const result = ((): { readonly value: unknown } | null => {
      try {
        return { value: JSON.parse(textarea.value) }
      } catch {
        return null
      }
    })()
    if (result === null) {
      setStatus(status, 'JSON として読めませんでした。')
      return
    }
    apply(sanitizeConfig(result.value))
    setStatus(status, '読み込みました。保存すると確定します。')
  })
}
