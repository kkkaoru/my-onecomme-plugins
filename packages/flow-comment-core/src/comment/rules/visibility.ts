// Runs with bun.
// Which optional parts of a comment are shown. One table instead of scattered
// conditionals, so the whole rule is readable in a single place.

import type { FlowConfig } from '../../settings/config'
import { isCard } from '../model/comment'
import type { FlowComment } from '../model/comment'

export interface CommentVisibility {
  readonly avatar: boolean
  readonly badges: boolean
  readonly name: boolean
}

// Paid comments have their own switches; plain comments use the shared ones.
export const selectVisibility = (comment: FlowComment, config: FlowConfig): CommentVisibility =>
  isCard(comment)
    ? {
        avatar: config.showPaidAvatar,
        badges: config.showBadges,
        name: config.showPaidName,
      }
    : {
        avatar: config.showAvatar,
        badges: config.showBadges,
        name: config.showName,
      }
