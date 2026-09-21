// Runs with bun.
// Presentational pieces of one comment. Each part takes only the values it
// renders, so no part needs to know about the whole comment.

import type { ReactElement } from 'react'

import type { FlowBadge, FlowColors } from '../model/comment'

interface AvatarProps {
  readonly alt: string
  readonly url: string
  readonly visible: boolean
}

export const Avatar = ({ alt, url, visible }: AvatarProps): ReactElement | null =>
  visible ? <img alt={alt} className="fc-avatar" src={url} /> : null

export const Badge = ({ badge }: { readonly badge: FlowBadge }): ReactElement => (
  <span className="fc-badge" title={badge.label}>
    {badge.url === undefined ? badge.label : <img alt={badge.label} src={badge.url} />}
  </span>
)

interface PaidLabelProps {
  readonly colors: FlowColors | undefined
  readonly label: string | undefined
}

export const PaidLabel = ({ colors, label }: PaidLabelProps): ReactElement | null =>
  label === undefined ? null : (
    <span className="fc-paid" style={{ color: colors?.headerTextColor }}>
      {label}
    </span>
  )

interface AuthorNameProps {
  readonly color: string
  readonly name: string
  readonly visible: boolean
}

export const AuthorName = ({ color, name, visible }: AuthorNameProps): ReactElement | null =>
  visible ? (
    <span className="fc-name" style={{ color }}>
      {name}
    </span>
  ) : null

interface CommentBodyProps {
  readonly color: string
  readonly fontFamily: string
  readonly html: string
}

// OneComme hands over ready-made HTML (gift images included), so it is rendered
// as-is rather than parsed into parts.
export const CommentBody = ({ color, fontFamily, html }: CommentBodyProps): ReactElement => (
  <span
    className="fc-text"
    dangerouslySetInnerHTML={{ __html: html }}
    style={{ color, fontFamily }}
  />
)
