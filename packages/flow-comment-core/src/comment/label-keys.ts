// Runs with bun.
// 見本ボタンの文言は辞書が持つ。ここはキーだけを持つ。
export const SAMPLE_LABEL_KEYS = [
  'samplePlain',
  'sampleSuperChatBlue',
  'sampleSuperChatCyan',
  'sampleSuperChatGreen',
  'sampleSuperChatYellow',
  'sampleSuperChatOrange',
  'sampleSuperChatPink',
  'sampleSuperChatRed',
  'sampleMembershipJoin',
  'sampleMembershipGift',
  'sampleMember',
  'sampleGift',
] as const

export type SampleLabelKey = (typeof SAMPLE_LABEL_KEYS)[number]
