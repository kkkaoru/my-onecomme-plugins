import type { FormatLabel } from '@my-onecomme-plugins/flow-comment-core/comment'
import { createFlow } from '@my-onecomme-plugins/flow-comment-core/flow'
import type { FlowController } from '@my-onecomme-plugins/flow-comment-core/flow'
import type { PreviewSample, SampleLabelKey } from '@my-onecomme-plugins/flow-comment-core/samples'
import { PREVIEW_SAMPLES } from '@my-onecomme-plugins/flow-comment-core/samples'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
// Runs with bun.
// Preview flow lives outside React. The host ref callback mounts it.
import { useCallback, useRef } from 'react'

import { metricsWanted } from '../hud'

const PREVIEW_INTERVAL_MS = 900

export interface EnabledBox {
  current: ReadonlySet<SampleLabelKey>
}

export interface PreviewOptions {
  readonly enabled: EnabledBox
  readonly formatLabel: FormatLabel
  readonly settings: FlowConfig
}

export interface PreviewApi {
  readonly host: (element: HTMLElement | null) => (() => void) | undefined
  readonly push: (sample: PreviewSample) => void
  readonly samples: readonly PreviewSample[]
}

const activeSamples = (enabled: ReadonlySet<SampleLabelKey>): readonly PreviewSample[] =>
  PREVIEW_SAMPLES.filter((sample) => enabled.has(sample.labelKey))

const sampleAt = (list: readonly PreviewSample[], index: number): PreviewSample | undefined =>
  list.length === 0 ? undefined : list[index % list.length]

export const usePreview = ({ enabled, formatLabel, settings }: PreviewOptions): PreviewApi => {
  const flow = useRef<FlowController | null>(null)
  const count = useRef(0)

  const host = useCallback(
    (element: HTMLElement | null): (() => void) | undefined => {
      if (element === null) {
        return
      }
      const controller = createFlow(element, settings, {
        formatLabel,
        metrics: metricsWanted(globalThis.location.search),
      })
      flow.current = controller
      const timer = globalThis.setInterval(() => {
        controller.applyConfig(settings)
        if (document.hidden) {
          return
        }
        count.current += 1
        const sample = sampleAt(activeSamples(enabled.current), count.current)
        if (sample !== undefined) {
          controller.push({
            ...sample.comment,
            id: `${sample.comment.id}-${String(count.current)}`,
          })
        }
      }, PREVIEW_INTERVAL_MS)
      return () => {
        globalThis.clearInterval(timer)
        controller.clear()
        flow.current = null
      }
    },
    [enabled, formatLabel, settings],
  )

  const push = useCallback((sample: PreviewSample): void => {
    count.current += 1
    flow.current?.push({
      ...sample.comment,
      id: `${sample.comment.id}-manual-${String(count.current)}`,
    })
  }, [])

  return { host, push, samples: PREVIEW_SAMPLES }
}
