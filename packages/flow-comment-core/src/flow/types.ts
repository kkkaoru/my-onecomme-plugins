// Runs with bun.
// Shared shapes for the flow controller. Types only, so every other module can
// depend on this file without pulling in behaviour.
import type { Root } from 'react-dom/client'

import type { FlowComment } from '../comment/model/comment'
import type { FormatLabel } from '../comment/rules/label'
import type { LaneAllocator, LaneGeometry } from '../motion/flow'
import type { FlowConfig } from '../settings/config'

interface FlowController {
  readonly applyConfig: (config: FlowConfig) => void
  readonly clear: () => void
  readonly destroy: () => void
  readonly push: (comment: FlowComment) => void
}

interface FlowOptions {
  /** The host application owns the words, so it supplies the label text. */
  readonly formatLabel: FormatLabel
  /** Dev overlay. Off in distributed builds. */
  readonly metrics: boolean
}

interface FlowItem {
  readonly comment: FlowComment
  readonly durationMs: number
  readonly element: HTMLDivElement
  readonly from: number
  readonly host: HTMLDivElement
  readonly lane: number
  readonly root: Root
  startedAt: number
  readonly to: number
}

interface FlowState {
  allocateLane: LaneAllocator
  config: FlowConfig
  containerHeightPx: number
  containerWidthPx: number
  destroyed: boolean
  readonly formatLabel: FormatLabel
  geometry: LaneGeometry | null
  items: FlowItem[]
  pending: FlowComment[]
  readonly root: HTMLElement
}

interface MountedItem {
  readonly comment: FlowComment
  readonly element: HTMLDivElement
  readonly host: HTMLDivElement
  readonly lane: number
  readonly root: Root
}

export type { FlowController, FlowItem, FlowOptions, FlowState, MountedItem }
