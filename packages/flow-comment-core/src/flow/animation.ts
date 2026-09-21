// Runs with bun.
// Wall-clock position, integer CSS pixels. OBS smears long comments when
// WAAPI interpolates subpixels on a wide layer.
import { horizontalRange, quantizeToDevicePixel } from '../motion/flow'
import { px } from '../units'
import { devicePixelRatioOf } from './geometry'
import { addItem, removeItem } from './items'
import type { FlowItem, FlowState, MountedItem } from './types'

const UNSET = -1

const translateX = (x: number): string => `translate(${px(x)}, 0)`

const widthOf = (element: HTMLElement): number => {
  const painted = element.getBoundingClientRect().width
  const width = painted === 0 ? element.offsetWidth : painted
  return Math.max(1, Math.round(width))
}

const placeItem = (state: FlowState, mounted: MountedItem): FlowItem => {
  const { element, host } = mounted
  state.root.append(host)
  const width = Math.max(1, widthOf(element))
  const { endX, startX } = horizontalRange(state.config.direction, width, state.containerWidthPx)
  const ratio = devicePixelRatioOf()
  const from = quantizeToDevicePixel(startX, ratio)
  const to = quantizeToDevicePixel(endX, ratio)
  host.style.transform = translateX(from)
  return { ...mounted, durationMs: state.config.durationMs, from, startedAt: UNSET, to }
}

export const tickMotion = (state: FlowState, now: number): void => {
  const finished: FlowItem[] = []
  for (const item of state.items) {
    if (item.startedAt < 0) {
      item.startedAt = now
    }
    const elapsed = now - item.startedAt
    const p = elapsed >= item.durationMs ? 1 : elapsed / item.durationMs
    const x = Math.round(item.from + (item.to - item.from) * p)
    item.host.style.transform = translateX(x)
    if (p >= 1) {
      finished.push(item)
    }
  }
  for (const item of finished) {
    removeItem(state, item)
  }
}

export const startItem = (state: FlowState, mounted: MountedItem): void => {
  addItem(state, placeItem(state, mounted))
}
