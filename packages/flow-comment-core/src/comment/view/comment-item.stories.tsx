/* eslint-disable vitest/prefer-importing-vitest-globals -- storybook/test の expect を使う */
import type { Meta, StoryObj } from '@storybook/react-vite'
// Runs with bun.
// コメント1件の描画を Storybook で管理し、play 関数で表示を検証する。
import type { CSSProperties, ReactElement } from 'react'
import { expect } from 'storybook/test'

import { sanitizeConfig } from '../../settings/config'
import type { FlowConfig } from '../../settings/config'
import type { FormatLabel } from '../rules/label'
import { CommentItem } from './comment-item'

interface StoryContext {
  readonly canvasElement: HTMLElement
}

const STAGE_STYLE = {
  background: '#1e1e1e',
  height: '120px',
  overflow: 'hidden',
  padding: '12px',
  position: 'relative',
} satisfies CSSProperties

// 実際の文言はアプリ側が持つ。ストーリーでは同じ日本語を再現し、play 関数が
// 画面に出る文字をそのまま検証できるようにする。
const formatLabel: FormatLabel = (label) => {
  if (label.kind === 'gift') {
    return label.count === undefined ? 'ギフト' : `ギフト ×${label.count}`
  }
  if (label.kind === 'giftReceived') {
    return 'ギフト受付'
  }
  return label.text ?? ''
}

const config = (overrides: Record<string, unknown>): FlowConfig => sanitizeConfig(overrides)

const meta = {
  args: { formatLabel, lane: 0 },
  component: CommentItem,
  render: (args): ReactElement => (
    <div style={STAGE_STYLE}>
      <CommentItem {...args} />
    </div>
  ),
  title: 'flow-comment/Comment',
} satisfies Meta<typeof CommentItem>

export default meta

type Story = StoryObj<typeof meta>

const avatarUrl = (initial: string, background: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${background}"/><text x="32" y="45" font-size="36" font-family="sans-serif" fill="#fff" text-anchor="middle">${initial}</text></svg>`,
  )}`

interface FlowColorsShape {
  readonly authorNameTextColor: string
  readonly bodyBackgroundColor: string
  readonly bodyTextColor: string
  readonly headerBackgroundColor: string
  readonly headerTextColor: string
}

const chatColors = (background: string): FlowColorsShape => ({
  authorNameTextColor: 'rgb(255, 255, 255)',
  bodyBackgroundColor: background,
  bodyTextColor: 'rgb(255, 255, 255)',
  headerBackgroundColor: background,
  headerTextColor: 'rgb(255, 255, 255)',
})

const AUTHOR_CONFIG: Record<string, unknown> = { showAvatar: true, showName: true }

export const Plain: Story = {
  args: {
    comment: {
      avatarUrl: avatarUrl('み', '#e91e63'),
      html: 'こんばんは！',
      id: '1',
      name: 'みなと',
    },
    config: config(AUTHOR_CONFIG),
  },
  play: async ({ canvasElement }: StoryContext): Promise<void> => {
    await expect(canvasElement.querySelector('.fc-avatar')).toBeTruthy()
    await expect(canvasElement.querySelector('.fc-name')?.textContent).toBe('みなと')
    await expect(canvasElement.querySelector('.fc-text')?.innerHTML).toBe('こんばんは！')
    await expect(canvasElement.querySelector('.fc-paid')).toBeNull()
  },
}

export const SuperChat: Story = {
  args: {
    comment: {
      avatarUrl: avatarUrl('そ', '#3f51b5'),
      colors: chatColors('rgb(30, 136, 229)'),
      html: 'スパチャありがとうございます！',
      id: '2',
      name: 'そらまめ',
      paidText: '¥1,000',
    },
    config: config(AUTHOR_CONFIG),
  },
  play: async ({ canvasElement }: StoryContext): Promise<void> => {
    const item = canvasElement.querySelector<HTMLElement>('.fc-item')
    await expect(item?.style.background).toBe('rgb(30, 136, 229)')
    await expect(canvasElement.querySelector('.fc-paid')?.textContent).toBe('¥1,000')
    // カード系は影を背景に付け、中の文字には付けない。
    await expect(item?.style.textShadow).toBe('')
  },
}

export const MemberGift: Story = {
  args: {
    comment: {
      badges: [{ label: 'メンバー' }],
      colors: chatColors('rgb(23, 118, 13)'),
      giftCount: 1,
      html: 'メンバーシップ ギフトを 1 個贈りました',
      id: '3',
      isGift: true,
      isMember: true,
      name: 'かえで',
    },
    config: config(AUTHOR_CONFIG),
  },
  play: async ({ canvasElement }: StoryContext): Promise<void> => {
    const item = canvasElement.querySelector<HTMLElement>('.fc-item')
    await expect(item?.style.background).toBe('rgb(23, 118, 13)')
    await expect(canvasElement.querySelector('.fc-paid')?.textContent).toBe('ギフト ×1')
    await expect(canvasElement.querySelector('.fc-badge')?.textContent).toBe('メンバー')
    await expect(item?.dataset['member']).toBe('true')
  },
}

export const MemberJoin: Story = {
  args: {
    comment: {
      badges: [{ label: 'メンバー' }],
      html: 'はじめまして',
      id: '4',
      isMember: true,
      membership: '新規メンバー',
      name: 'ゆず',
    },
    config: config(AUTHOR_CONFIG),
  },
  play: async ({ canvasElement }: StoryContext): Promise<void> => {
    await expect(canvasElement.querySelector('.fc-paid')?.textContent).toBe('新規メンバー')
    await expect(canvasElement.querySelector('.fc-badge')).toBeTruthy()
  },
}

export const GiftReceiver: Story = {
  args: {
    comment: {
      html: 'メンバーシップを受け取りました',
      id: '5',
      isGiftReceiver: true,
      name: 'れん',
    },
    config: config(AUTHOR_CONFIG),
  },
  play: async ({ canvasElement }: StoryContext): Promise<void> => {
    await expect(canvasElement.querySelector('.fc-paid')?.textContent).toBe('ギフト受付')
  },
}

export const HiddenAuthor: Story = {
  args: {
    comment: {
      avatarUrl: avatarUrl('あ', '#607d8b'),
      html: 'アイコンと名前なし',
      id: '6',
      name: 'あおい',
    },
    config: config({ showAvatar: false, showName: false }),
  },
  play: async ({ canvasElement }: StoryContext): Promise<void> => {
    await expect(canvasElement.querySelector('.fc-avatar')).toBeNull()
    await expect(canvasElement.querySelector('.fc-name')).toBeNull()
    await expect(canvasElement.querySelector('.fc-text')).toBeTruthy()
  },
}
