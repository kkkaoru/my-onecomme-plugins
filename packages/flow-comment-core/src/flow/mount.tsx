// Runs with bun.
// Mounting and unmounting one comment. React 19 renders asynchronously, so the
// commit is forced before the element is measured.

import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'

import type { FlowComment } from '../comment/model/comment'
import { CommentItem } from '../comment/view/comment-item'
import type { FlowState, MountedItem } from './types'

export const mountItem = (comment: FlowComment, state: FlowState, lane: number): MountedItem => {
  const host = document.createElement('div')
  host.className = 'fc-run'
  const root = createRoot(host)
  flushSync(() => {
    root.render(
      <CommentItem
        comment={comment}
        config={state.config}
        formatLabel={state.formatLabel}
        lane={lane}
      />,
    )
  })
  const element = host.firstElementChild
  if (!(element instanceof HTMLDivElement)) {
    throw new Error('CommentItem did not render a div')
  }
  return { element, host, root }
}

export const unmountItem = (item: MountedItem): void => {
  item.root.unmount()
  item.host.remove()
}
