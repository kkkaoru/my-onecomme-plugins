import type { FlowComment } from '../comment/model/comment'
// Runs with bun.
// Wiring only: owns the state object and exposes the controller interface.
import { createLaneAllocator } from '../motion/flow'
import type { FlowConfig } from '../settings/config'
import { startItem, tickMotion } from './animation'
import { applyGeometry, syncGeometry } from './geometry'
import { clearItems } from './items'
import { startMetricsLoop } from './metrics'
import { mountItem, restyleItems } from './mount'
import type { FlowController, FlowOptions, FlowState } from './types'

interface LoopStart {
  readonly metrics: boolean
  readonly root: HTMLElement
  readonly state: FlowState
}

const launch = (state: FlowState, comment: FlowComment, lane: number): void => {
  const geometry = syncGeometry(state)
  const mounted = mountItem(comment, state, lane)
  applyGeometry(mounted.host, geometry, lane)
  startItem(state, mounted)
}

const flushPending = (state: FlowState): void => {
  if (state.destroyed || state.pending.length === 0) {
    return
  }
  const lane = state.allocateLane.pick(state.items.map((item) => item.lane))
  if (lane === null) {
    return
  }
  const [comment, ...rest] = state.pending
  if (comment === undefined) {
    return
  }
  state.pending = rest
  launch(state, comment, lane)
  flushPending(state)
}

const pushComment = (state: FlowState, comment: FlowComment): void => {
  if (state.destroyed) {
    return
  }
  state.pending = [...state.pending, comment]
  flushPending(state)
}

const applyConfigTo = (state: FlowState, config: FlowConfig): void => {
  state.config = config
  state.geometry = null
  state.allocateLane = createLaneAllocator(config.lanes, Math.random)
  const geometry = syncGeometry(state)
  for (const item of state.items) {
    applyGeometry(item.host, geometry, item.lane)
  }
  restyleItems(state)
  flushPending(state)
}

const startLoop = ({ metrics, root, state }: LoopStart): void => {
  const loop = (now: number): void => {
    if (state.destroyed) {
      return
    }
    tickMotion(state, now)
    flushPending(state)
    globalThis.requestAnimationFrame(loop)
  }
  globalThis.requestAnimationFrame(loop)
  if (!metrics) {
    return
  }
  startMetricsLoop({
    hostsOf: () => state.items.map((item) => item.host),
    isAlive: () => !state.destroyed,
    onTick: (now) => now,
    root,
  })
}

export const createFlow = (
  root: HTMLElement,
  initialConfig: FlowConfig,
  options: FlowOptions,
): FlowController => {
  const state: FlowState = {
    allocateLane: createLaneAllocator(initialConfig.lanes, Math.random),
    config: initialConfig,
    containerHeightPx: -1,
    containerWidthPx: -1,
    destroyed: false,
    formatLabel: options.formatLabel,
    geometry: null,
    items: [],
    pending: [],
    root,
  }
  startLoop({ metrics: options.metrics, root, state })
  return {
    applyConfig: (config) => {
      applyConfigTo(state, config)
    },
    clear: () => {
      state.pending = []
      clearItems(state)
    },
    destroy: () => {
      state.destroyed = true
      state.pending = []
      clearItems(state)
    },
    push: (comment) => {
      pushComment(state, comment)
    },
  }
}

export type { FlowController } from './types'
