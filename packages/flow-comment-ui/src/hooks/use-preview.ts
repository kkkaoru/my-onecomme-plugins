import type { FormatLabel } from '@my-onecomme-plugins/flow-comment-core/comment'
import { createFlow } from '@my-onecomme-plugins/flow-comment-core/flow'
import type { FlowController } from '@my-onecomme-plugins/flow-comment-core/flow'
import type { PreviewSample, SampleLabelKey } from '@my-onecomme-plugins/flow-comment-core/samples'
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

export interface PreviewOptions {
  readonly enabled: ReadonlySet<SampleLabelKey>
  readonly formatLabel: FormatLabel
  readonly settings: FlowConfig
}

export interface PreviewApi {
  readonly host: (element: HTMLElement | null) => (() => void) | undefined
  readonly push: (sample: PreviewSample) => void
  readonly samples: readonly PreviewSample[]
}

const readVariable = (name: string): string =>
  globalThis.getComputedStyle(document.documentElement).getPropertyValue(name)

const activeSamples = (enabled: ReadonlySet<SampleLabelKey>): readonly PreviewSample[] =>
  PREVIEW_SAMPLES.filter((sample) => enabled.has(sample.labelKey))

const sampleAt = (list: readonly PreviewSample[], index: number): PreviewSample | undefined =>
  list.length === 0 ? undefined : list[index % list.length]

export const usePreview = ({ enabled, formatLabel, settings }: PreviewOptions): PreviewApi => {
  const flow = useRef<FlowController | null>(null)
  const count = useRef(0)
  const enabledRef = useRef(enabled)
  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const host = useCallback(
    (element: HTMLElement | null): (() => void) | undefined => {
      if (element === null) {
        return
      }
      const controller = createFlow(
        element,
        readFlowConfig(createVariableLookup(readVariable, null)),
        { formatLabel },
      )
      flow.current = controller
      const timer = globalThis.setInterval(() => {
        if (document.hidden) {
          return
        }
        count.current += 1
        const sample = sampleAt(activeSamples(enabledRef.current), count.current)
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

  useEffect(() => {
    flow.current?.applyConfig(readFlowConfig(createVariableLookup(readVariable, settings)))
  }, [settings])

  const push = useCallback((sample: PreviewSample): void => {
    count.current += 1
    flow.current?.push({ ...sample.comment, id: `${sample.comment.id}-manual-${count.current}` })
  }, [])

  return { host, push, samples: PREVIEW_SAMPLES }
}
