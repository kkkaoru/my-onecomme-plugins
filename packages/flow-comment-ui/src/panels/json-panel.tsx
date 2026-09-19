// Runs with bun.
// 設定 JSON の入出力。貼り付けた内容は sanitizeConfig を通してから当てる。
import { Button } from '@base-ui/react/button'
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import { useCallback, useState } from 'react'
import type { ReactElement } from 'react'

import type { Translate } from '../messages'

const JSON_INDENT = 2
type ParseResult = { readonly ok: true; readonly value: unknown } | { readonly ok: false }

const parseJson = (text: string): ParseResult => {
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch {
    return { ok: false }
  }
}

export interface JsonPanelProps {
  /** 開いた状態を外から決めたいとき（テストやストーリー）。 */
  readonly open?: boolean
  readonly current: () => FlowConfig
  readonly onApply: (next: FlowConfig, message: string) => void
  readonly setStatus: (message: string) => void
  readonly t: Translate
}

interface JsonActions {
  readonly copy: () => Promise<void>
  readonly exportNow: () => void
  readonly importNow: () => void
}

const useJsonActions = (
  { current, onApply, setStatus, t }: JsonPanelProps,
  text: string,
  setText: (next: string) => void,
): JsonActions => {
  const exportNow = useCallback((): void => {
    setText(`${JSON.stringify(current(), null, JSON_INDENT)}\n`)
    setStatus(t('exportSuccess'))
  }, [current, setStatus, setText, t])

  const copy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus(t('copySuccess'))
    } catch (error) {
      console.info('[flow-comment] clipboard write failed', error)
      setStatus(t('copyFailed'))
    }
  }, [setStatus, t, text])

  const importNow = useCallback((): void => {
    const parsed = parseJson(text)
    if (!parsed.ok) {
      setStatus(t('importFailed'))
      return
    }
    onApply(sanitizeConfig(parsed.value), t('importSuccess'))
  }, [onApply, setStatus, t, text])

  return { copy, exportNow, importNow }
}

export const JsonPanel = ({ open, t, ...props }: JsonPanelProps): ReactElement => {
  const [text, setText] = useState('')
  const { copy, exportNow, importNow } = useJsonActions({ ...props, t }, text, setText)
  return (
    <section>
      {/* 普段は使わないので畳んでおく。details は標準でキーボード操作も読み上げも効く。 */}
      <details className="fc-collapsible" open={open}>
        <summary className="fc-collapsible-trigger">{t('sectionJson')}</summary>
        <div className="fc-collapsible-panel">
          <div className="fc-field">
            <Button onClick={exportNow} type="button">
              {t('buttonExport')}
            </Button>
            <Button
              onClick={() => {
                void copy()
              }}
              type="button"
            >
              {t('buttonCopy')}
            </Button>
            <Button onClick={importNow} type="button">
              {t('buttonImport')}
            </Button>
          </div>
          <div className="fc-field">
            <label className="field-label" htmlFor="io-json">
              {t('labelJson')}
            </label>
            <textarea
              className="fc-textarea"
              id="io-json"
              onChange={(event) => {
                setText(event.currentTarget.value)
              }}
              rows={8}
              spellCheck={false}
              value={text}
            />
          </div>
        </div>
      </details>
    </section>
  )
}
