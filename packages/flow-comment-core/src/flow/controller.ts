import type { FlowComment } from '../comment/model/comment'
// Runs with bun.
// Wiring only: owns the state object and exposes the controller interface.
import { createLaneAllocator } from '../motion/flow'
import type { FlowConfig } from '../settings/config'
import { startItem } from './animation'
import { applyGeometry, syncGeometry } from './geometry'
import { clearItems } from './items'
import { mountItem } from './mount'
import type { FlowController, FlowOptions, FlowState } from './types'

const pushComment = (state: FlowState, comment: FlowComment): void => {
  if (state.destroyed) {
    return
  }
  const lane = state.allocateLane.next()
  const geometry = syncGeometry(state)
  const mounted = mountItem(comment, state, lane)
  applyGeometry(mounted.host, geometry, lane)
  startItem(state, mounted)
}

const applyConfigTo = (state: FlowState, config: FlowConfig): void => {
  state.config = config
  state.geometry = null
  state.allocateLane = createLaneAllocator(config.lanes)
  clearItems(state)
}

export const createFlow = (
  root: HTMLElement,
  initialConfig: FlowConfig,
  options: FlowOptions,
): FlowController => {
  const state: FlowState = {
    allocateLane: createLaneAllocator(initialConfig.lanes),
    config: initialConfig,
    containerHeightPx: -1,
    containerWidthPx: -1,
    destroyed: false,
    formatLabel: options.formatLabel,
    geometry: null,
    items: [],
    root,
  }
  return {
    applyConfig: (config) => {
      applyConfigTo(state, config)
    },
    clear: () => {
      clearItems(state)
    },
    destroy: () => {
      state.destroyed = true
      clearItems(state)
    },
    push: (comment) => {
      pushComment(state, comment)
    },
  }
}

export type { FlowController } from './types'
