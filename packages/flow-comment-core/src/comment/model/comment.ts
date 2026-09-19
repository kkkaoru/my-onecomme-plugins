// Runs with bun.
// Data shapes for a single OneComme comment. Types only, plus the one
// derivation that depends on nothing but the comment itself.

export interface FlowBadge {
  readonly label: string
  readonly url?: string | undefined
}

export interface FlowColors {
  readonly authorNameTextColor?: string | undefined
  readonly bodyBackgroundColor?: string | undefined
  readonly bodyTextColor?: string | undefined
  readonly headerBackgroundColor?: string | undefined
  readonly headerTextColor?: string | undefined
}

export interface FlowComment {
  readonly avatarUrl?: string | undefined
  readonly badges?: readonly FlowBadge[] | undefined
  readonly colors?: FlowColors | undefined
  readonly giftCount?: number | undefined
  readonly html: string
  readonly id: string
  readonly isGift?: boolean | undefined
  readonly isGiftReceiver?: boolean | undefined
  readonly isMember?: boolean | undefined
  readonly membership?: string | undefined
  readonly name: string
  readonly paidText?: string | undefined
}

// A paid comment carries the service's own colors, so it renders as a card and
// has its own visibility switches.
export const isCard = (comment: FlowComment): boolean => comment.colors !== undefined
