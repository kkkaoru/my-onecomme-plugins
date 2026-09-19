// Runs with bun.
// The item collection. Adding enforces the cap and removing frees the
// compositor layer, so the only code that touches the array lives here.

import { unmountItem } from './mount'
import type { FlowItem, FlowState } from './types'

export const removeItem = (state: FlowState, item: FlowItem): void => {
  if (!state.items.includes(item)) {
    return
  }
  state.items = state.items.filter((entry) => entry !== item)
  item.animation.cancel()
  item.element.style.willChange = 'auto'
  unmountItem(item)
}

export const clearItems = (state: FlowState): void => {
  const removed = state.items
  // Empty first: a cancelled animation still settles, and its handler checks
  // membership before doing anything.
  state.items = []
  for (const item of removed) {
    item.animation.cancel()
    unmountItem(item)
  }
}

const enforceCap = (state: FlowState): void => {
  const excess = state.items.length - state.config.maxItems
  if (excess <= 0) {
    return
  }
  // Slice first so removing does not disturb the walk.
  for (const item of state.items.slice(0, excess)) {
    removeItem(state, item)
  }
}

export const addItem = (state: FlowState, item: FlowItem): void => {
  state.items.push(item)
  enforceCap(state)
}
