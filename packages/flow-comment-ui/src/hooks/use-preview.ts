import type { FormatLabel } from '@my-onecomme-plugins/flow-comment-core/comment'
import { createFlow } from '@my-onecomme-plugins/flow-comment-core/flow'
import type { FlowController } from '@my-onecomme-plugins/flow-comment-core/flow'
import type { PreviewSample } from '@my-onecomme-plugins/flow-comment-core/samples'
import { PREVIEW_SAMPLES } from '@my-onecomme-plugins/flow-comment-core/samples'
import {
  createVariableLookup,
  readFlowConfig,
} from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
// Runs with bun.
// プレビューの流れ。flow は React の外で動くアニメーションなので、要素の
// 取り付けは ref コールバック（React 19 は後始末を返せる）で完結させる。
import { useCallback, useEffect, useRef } from 'react'

const PREVIEW_INTERVAL_MS = 900

export interface PreviewApi {
  readonly host: (element: HTMLElement | null) => (() => void) | undefined
  readonly push: (sample: PreviewSample) => void
  readonly samples: readonly PreviewSample[]
}

const readVariable = (name: string): string =>
  globalThis.getComputedStyle(document.documentElement).getPropertyValue(name)

export const usePreview = (settings: FlowConfig, formatLabel: FormatLabel): PreviewApi => {
  const flow = useRef<FlowController | null>(null)
  const count = useRef(0)

  const host = useCallback(
    (element: HTMLElement | null): (() => void) | undefined => {
      if (element === null) {
        return
      }
      // 設定は次の commit で流し込むので、ここでは既定値で作り始める。
      const controller = createFlow(
        element,
        readFlowConfig(createVariableLookup(readVariable, null)),
        { formatLabel },
      )
      flow.current = controller
      const timer = globalThis.setInterval(() => {
        // 見えていない間は流さない。溜め込む理由がない。
        if (document.hidden) {
          return
        }
        count.current += 1
        const sample = PREVIEW_SAMPLES[count.current % PREVIEW_SAMPLES.length]
        if (sample !== undefined) {
          controller.push({ ...sample.comment, id: `${sample.comment.id}-${count.current}` })
        }
      }, PREVIEW_INTERVAL_MS)
      return () => {
        globalThis.clearInterval(timer)
        controller.clear()
        flow.current = null
      }
    },
    [formatLabel],
  )

  // 設定はアニメーションの状態そのものなので、commit のあとに流し込む。
  useEffect(() => {
    flow.current?.applyConfig(readFlowConfig(createVariableLookup(readVariable, settings)))
  }, [settings])

  const push = useCallback((sample: PreviewSample): void => {
    count.current += 1
    flow.current?.push({ ...sample.comment, id: `${sample.comment.id}-manual-${count.current}` })
  }, [])

  return { host, push, samples: PREVIEW_SAMPLES }
}
