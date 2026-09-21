// Runs with bun.
// Mounting and unmounting one comment. React 19 renders asynchronously, so the
// commit is forced before the element is measured.

import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'

import type { FlowComment } from '../comment/model/comment'
import { CommentItem } from '../comment/view/comment-item'
import { cssFontFamily } from '../settings/fonts'
import type { FlowState, MountedItem } from './types'

export const paintItem = (item: MountedItem, state: FlowState): void => {
  item.host.style.fontFamily = cssFontFamily(state.config.fontFamily)
  flushSync(() => {
    item.root.render(
      <CommentItem
        comment={item.comment}
        config={state.config}
        formatLabel={state.formatLabel}
        lane={item.lane}
      />,
    )
  })
}

export const mountItem = (comment: FlowComment, state: FlowState, lane: number): MountedItem => {
  const host = document.createElement('div')
  host.className = 'fc-run'
  const root = createRoot(host)
  const mounted: MountedItem = { comment, element: host, host, lane, root }
  paintItem(mounted, state)
  const element = host.firstElementChild
  if (!(element instanceof HTMLDivElement)) {
    throw new Error('CommentItem did not render a div')
  }
  return { ...mounted, element }
}

export const unmountItem = (item: MountedItem): void => {
  item.root.unmount()
  item.host.remove()
}

export const restyleItems = (state: FlowState): void => {
  for (const item of state.items) {
    paintItem(item, state)
  }
}
