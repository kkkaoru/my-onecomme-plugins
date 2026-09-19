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
}

interface FlowItem {
  readonly animation: Animation
  readonly element: HTMLDivElement
  readonly host: HTMLDivElement
  readonly root: Root
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
  readonly root: HTMLElement
}

interface MountedItem {
  readonly element: HTMLDivElement
  readonly host: HTMLDivElement
  readonly root: Root
}

export type { FlowController, FlowItem, FlowOptions, FlowState, MountedItem }
