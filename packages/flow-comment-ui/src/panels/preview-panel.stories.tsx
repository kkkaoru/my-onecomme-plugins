import type { FormatLabel } from '@my-onecomme-plugins/flow-comment-core/comment'
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
/* eslint-disable vitest/prefer-importing-vitest-globals -- storybook/test の expect を使う */
// Runs with bun.
// プレビューのパネル。設定をその場で当てて、見本のコメントが流れる様子を管理する。
import type { Meta, StoryObj } from '@storybook/react-vite'
// ストーリーではキーを見出しとして出す（文言はアプリの辞書が持つ）。
import type { ReactElement } from 'react'
import { expect, userEvent } from 'storybook/test'

import { PreviewPanel } from './preview-panel'

// ストーリーではキーを見出しとして出す（文言はアプリの辞書が持つ）。
const t = (key: string): string => key

const formatLabel: FormatLabel = (label) => label.text ?? label.kind

interface StoryArgs {
  readonly settings: FlowConfig
}

const meta = {
  render: ({ settings }: StoryArgs): ReactElement => (
    <PreviewPanel t={t} formatLabel={formatLabel} settings={settings} />
  ),
  title: 'flow-comment/panels/PreviewPanel',
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<StoryArgs>

export const Default: Story = {
  args: { settings: sanitizeConfig({ direction: 'rtl', lanes: 3 }) },
  play: async ({ canvasElement }): Promise<void> => {
    await expect(canvasElement.querySelectorAll('.fc-sample').length).toBeGreaterThan(0)
    await expect(canvasElement.querySelector('.preview')).toBeTruthy()
  },
}

export const PushingASample: Story = {
  args: { settings: sanitizeConfig({ direction: 'rtl', durationMs: 20_000, lanes: 3 }) },
  play: async ({ canvasElement }): Promise<void> => {
    const button = canvasElement.querySelector('.fc-sample')
    if (button === null) {
      throw new Error('no sample button')
    }
    await userEvent.click(button)
    await expect(canvasElement.querySelectorAll('.fc-item').length).toBe(1)
  },
}

export const LightPreview: Story = {
  args: { settings: sanitizeConfig({ direction: 'rtl', lanes: 3 }) },
  play: async ({ canvasElement }): Promise<void> => {
    const radios = canvasElement.querySelectorAll('.fc-radio')
    const light = radios.item(1)
    if (light === null) {
      throw new Error('no light radio')
    }
    await userEvent.click(light)
    await expect(canvasElement.querySelector('.preview')?.className).toContain('is-light')
  },
}

export const NarrowLanes: Story = {
  args: { settings: sanitizeConfig({ direction: 'ltr', lanes: 1 }) },
  play: async ({ canvasElement }): Promise<void> => {
    const button = canvasElement.querySelector('.fc-sample')
    if (button === null) {
      throw new Error('no sample button')
    }
    await userEvent.click(button)
    await expect(canvasElement.querySelector<HTMLElement>('.fc-item')?.dataset['lane']).toBe('0')
  },
}
