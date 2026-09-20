// Runs with bun.
// Builds one comment. Everything rendered here comes from the derivation
// helpers, so this file holds no display rules of its own.
import type { ReactElement } from 'react'

import type { FlowConfig } from '../../settings/config'
import type { FlowComment } from '../model/comment'
import type { FormatLabel } from '../rules/label'
import { selectLabel } from '../rules/label'
import { cardColorsOf, nameColorOf, selectBodyStyle, selectItemStyle } from '../rules/style'
import { selectVisibility } from '../rules/visibility'
import { AuthorName, Avatar, Badge, CommentBody, PaidLabel } from './parts'

interface CommentItemProps {
  readonly comment: FlowComment
  readonly config: FlowConfig
  /** Supplied by the host application, which owns the words. */
  readonly formatLabel: FormatLabel
  readonly lane: number
}

const labelTextOf = (comment: FlowComment, formatLabel: FormatLabel): string | undefined => {
  const label = selectLabel(comment)
  return label === undefined ? undefined : formatLabel(label)
}

export const CommentItem = ({
  comment,
  config,
  formatLabel,
  lane,
}: CommentItemProps): ReactElement => {
  const colors = cardColorsOf(comment)
  const visibility = selectVisibility(comment, config)
  const { avatarUrl } = comment
  const nameColor = nameColorOf(comment, config)
  return (
    <div
      className="fc-item"
      data-gift={String(comment.isGift === true)}
      data-id={comment.id}
      data-lane={String(lane)}
      data-member={String(comment.isMember === true)}
      style={{ ...selectItemStyle(config, colors !== undefined), ...selectBodyStyle(colors) }}
    >
      {avatarUrl === undefined ? null : (
        <Avatar alt={comment.name} url={avatarUrl} visible={visibility.avatar} />
      )}
      {visibility.badges
        ? (comment.badges ?? []).map((badge) => <Badge badge={badge} key={badge.label} />)
        : null}
      <PaidLabel colors={colors} label={labelTextOf(comment, formatLabel)} />
      <AuthorName color={nameColor} name={comment.name} visible={visibility.name} />
      <CommentBody color={config.textColor} html={comment.html} />
    </div>
  )
}

export type { FlowBadge, FlowColors, FlowComment } from '../model/comment'
export type { CommentLabel, FormatLabel, LabelKind } from '../rules/label'
