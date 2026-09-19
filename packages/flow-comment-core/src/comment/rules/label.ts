// Runs with bun.
// Which label a comment shows. This package owns the rule but not the words:
// the result is a descriptor, and the host application turns it into text.

import type { FlowComment } from '../model/comment'

type LabelKind = 'gift' | 'giftReceived' | 'membership' | 'paid'

interface CommentLabel {
  /** Gift count. Only a gift carries one. */
  readonly count?: number | undefined
  readonly kind: LabelKind
  /** Text the streaming service already produced (amount, membership name). */
  readonly text?: string | undefined
}

type FormatLabel = (label: CommentLabel) => string

interface LabelRule {
  readonly label: (comment: FlowComment) => CommentLabel | undefined
}

const textLabel = (kind: LabelKind, text: string | undefined): CommentLabel | undefined =>
  text === undefined ? undefined : { kind, text }

// First match wins. A gift carries an empty paidText, so the empty check below
// is what lets the later rows take over.
const LABEL_RULES: readonly LabelRule[] = [
  { label: (comment) => textLabel('paid', comment.paidText) },
  { label: (comment) => textLabel('membership', comment.membership) },
  { label: (comment) => (comment.isGiftReceiver === true ? { kind: 'giftReceived' } : undefined) },
  {
    label: (comment) =>
      comment.isGift === true ? { count: comment.giftCount, kind: 'gift' } : undefined,
  },
]

const isUsable = (label: CommentLabel | undefined): label is CommentLabel =>
  label !== undefined && (label.text === undefined || label.text !== '')

export const selectLabel = (comment: FlowComment): CommentLabel | undefined =>
  LABEL_RULES.map((rule) => rule.label(comment)).find((label) => isUsable(label))

export type { CommentLabel, FormatLabel, LabelKind }
