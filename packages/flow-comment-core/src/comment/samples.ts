// Runs with bun. Preview data. Fake users and YouTube super chat tiers.
import type { SampleLabelKey } from './label-keys'
import type { FlowComment } from './model/comment'

export { SAMPLE_LABEL_KEYS } from './label-keys'
export type { SampleLabelKey } from './label-keys'

interface PreviewSample {
  readonly comment: FlowComment
  readonly labelKey: SampleLabelKey
}

interface FakeUser {
  readonly avatarUrl: string
  readonly name: string
}

interface SuperChatTier {
  readonly amount: string
  readonly background: string
  readonly labelKey: SampleLabelKey
}

// Inline SVG avatars keep the preview offline.
const avatarFor = (initial: string, background: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${background}"/><text x="32" y="45" font-size="36" font-family="sans-serif" fill="#fff" text-anchor="middle">${initial}</text></svg>`,
  )}`

const FAKE_USERS: readonly FakeUser[] = [
  { avatarUrl: avatarFor('み', '#e91e63'), name: 'みなと' },
  { avatarUrl: avatarFor('そ', '#3f51b5'), name: 'そらまめ' },
  { avatarUrl: avatarFor('か', '#009688'), name: 'かえで' },
  { avatarUrl: avatarFor('ゆ', '#ff9800'), name: 'ゆず' },
  { avatarUrl: avatarFor('れ', '#795548'), name: 'れん' },
  { avatarUrl: avatarFor('あ', '#607d8b'), name: 'あおい' },
]

const JOIN_USER = 0
const MEMBER_GIFT_USER = 1
const MEMBER_USER = 2
const GIFT_USER = 3
const NORMAL_USER = 4

const MEMBER_BADGE_URL = avatarFor('M', '#2ba640')
const GIFT_IMAGE_URL = avatarFor('G', '#9c27b0')

const userAt = (index: number): FakeUser =>
  FAKE_USERS[index % FAKE_USERS.length] ?? { avatarUrl: avatarFor('？', '#555555'), name: 'ゲスト' }

// YouTube's super chat tiers. A live stream carries the real colors in
// comment.data.colors, so these are only for the preview.
const SUPER_CHAT_TIERS: readonly SuperChatTier[] = [
  { amount: '¥100', background: 'rgb(30, 136, 229)', labelKey: 'sampleSuperChatBlue' },
  { amount: '¥200', background: 'rgb(0, 184, 212)', labelKey: 'sampleSuperChatCyan' },
  { amount: '¥500', background: 'rgb(0, 191, 165)', labelKey: 'sampleSuperChatGreen' },
  { amount: '¥1,000', background: 'rgb(255, 202, 40)', labelKey: 'sampleSuperChatYellow' },
  { amount: '¥2,000', background: 'rgb(245, 124, 0)', labelKey: 'sampleSuperChatOrange' },
  { amount: '¥5,000', background: 'rgb(194, 24, 91)', labelKey: 'sampleSuperChatPink' },
  { amount: '¥10,000', background: 'rgb(208, 0, 0)', labelKey: 'sampleSuperChatRed' },
]

const superChatSample = (tier: SuperChatTier, index: number): PreviewSample => {
  const user = userAt(index)
  return {
    comment: {
      avatarUrl: user.avatarUrl,
      colors: {
        authorNameTextColor: 'rgb(255, 255, 255)',
        bodyBackgroundColor: tier.background,
        bodyTextColor: 'rgb(255, 255, 255)',
        headerBackgroundColor: tier.background,
        headerTextColor: 'rgb(255, 255, 255)',
      },
      html: 'スパチャありがとうございます！',
      id: `sample-superchat-${tier.amount}`,
      name: user.name,
      paidText: tier.amount,
    },
    labelKey: tier.labelKey,
  }
}

const fixedSample = (comment: FlowComment, labelKey: SampleLabelKey): PreviewSample => ({
  comment,
  labelKey,
})

const PREVIEW_SAMPLES: readonly PreviewSample[] = [
  fixedSample(
    {
      avatarUrl: userAt(NORMAL_USER).avatarUrl,
      html: 'こんばんは！',
      id: 'sample-normal',
      name: userAt(NORMAL_USER).name,
    },
    'samplePlain',
  ),
  ...SUPER_CHAT_TIERS.map((tier, index) => superChatSample(tier, index)),
  fixedSample(
    {
      avatarUrl: userAt(JOIN_USER).avatarUrl,
      badges: [{ label: 'メンバー', url: MEMBER_BADGE_URL }],
      html: 'はじめまして',
      id: 'sample-join',
      isMember: true,
      membership: '新規メンバー',
      name: userAt(JOIN_USER).name,
    },
    'sampleMembershipJoin',
  ),
  fixedSample(
    {
      badges: [{ label: 'ギフト', url: GIFT_IMAGE_URL }],
      giftCount: 1,
      html: `<img alt="ギフト" class="gift-image" src="${GIFT_IMAGE_URL}" /> メンバーシップ ギフトを 1 個贈りました`,
      id: 'sample-member-gift',
      isGift: true,
      isMember: true,
      name: userAt(MEMBER_GIFT_USER).name,
    },
    'sampleMembershipGift',
  ),
  fixedSample(
    {
      avatarUrl: userAt(MEMBER_USER).avatarUrl,
      badges: [{ label: 'メンバー', url: MEMBER_BADGE_URL }],
      html: 'いつもありがとう',
      id: 'sample-member',
      isMember: true,
      name: userAt(MEMBER_USER).name,
    },
    'sampleMember',
  ),
  fixedSample(
    {
      avatarUrl: userAt(GIFT_USER).avatarUrl,
      html: `<img alt="ギフト" class="gift-image" src="${GIFT_IMAGE_URL}" /> プレゼント`,
      id: 'sample-gift',
      isGift: true,
      name: userAt(GIFT_USER).name,
      paidText: 'ギフト',
    },
    'sampleGift',
  ),
]

export { PREVIEW_SAMPLES, SUPER_CHAT_TIERS }
export type { PreviewSample }
