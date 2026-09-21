// Runs with bun.
// The item collection. Adding enforces the cap and removing unmounts the node.

import { unmountItem } from './mount'
import type { FlowItem, FlowState } from './types'

export const removeItem = (state: FlowState, item: FlowItem): void => {
  if (!state.items.includes(item)) {
    return
  }
  state.items = state.items.filter((entry) => entry !== item)
  unmountItem(item)
}

export const clearItems = (state: FlowState): void => {
  const removed = state.items
  state.items = []
  for (const item of removed) {
    unmountItem(item)
  }
}

const enforceCap = (state: FlowState): void => {
  const excess = state.items.length - state.config.maxItems
  if (excess <= 0) {
    return
  }
  for (const item of state.items.slice(0, excess)) {
    removeItem(state, item)
  }
}

export const addItem = (state: FlowState, item: FlowItem): void => {
  state.items.push(item)
  enforceCap(state)
}
