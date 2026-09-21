// Runs with bun.
// Lane geometry. Recomputed only when the container size changes, because
// writing height and top invalidates layout.

import { createLaneGeometry, quantizeToDevicePixel } from '../motion/flow'
import type { LaneGeometry } from '../motion/flow'
import { px } from '../units'
import type { FlowState } from './types'

export const devicePixelRatioOf = (): number => globalThis.devicePixelRatio || 1

export const applyGeometry = (element: HTMLElement, geometry: LaneGeometry, lane: number): void => {
  const ratio = devicePixelRatioOf()
  Object.assign(element.style, {
    height: px(quantizeToDevicePixel(geometry.laneHeightPx, ratio)),
    top: px(quantizeToDevicePixel(geometry.topOf(lane), ratio)),
  })
}

const measureGeometry = (state: FlowState): LaneGeometry =>
  createLaneGeometry({
    containerHeightPx: state.root.clientHeight,
    laneGapPx: state.config.laneGapPx,
    laneHeightPx: state.config.laneHeightPx,
    lanes: state.config.lanes,
  })

export const syncGeometry = (state: FlowState): LaneGeometry => {
  const width = state.root.clientWidth
  const height = state.root.clientHeight
  if (
    state.geometry !== null &&
    width === state.containerWidthPx &&
    height === state.containerHeightPx
  ) {
    return state.geometry
  }
  state.containerWidthPx = width
  state.containerHeightPx = height
  state.geometry = measureGeometry(state)
  return state.geometry
}
