import { FIELD_SPECS } from '@my-onecomme-plugins/flow-comment-core/fields'
import type { FieldSpec } from '@my-onecomme-plugins/flow-comment-core/fields'
import type { FieldValue } from '@my-onecomme-plugins/flow-comment-core/settings'
/* eslint-disable vitest/prefer-importing-vitest-globals -- storybook/test の expect を使う */
// Runs with bun.
// 項目のコントロールを Storybook で管理する。操作の結果は play 関数で確かめる。
import type { Meta, StoryObj } from '@storybook/react-vite'
// ストーリーではキーを見出しとして出す（文言はアプリの辞書が持つ）。
import { useState } from 'react'
import type { ReactElement } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { FieldControl } from './field-control'

// ストーリーではキーを見出しとして出す（文言はアプリの辞書が持つ）。
const t = (key: string): string => key

const noop = (): void => {
  // このストーリーでは入力を観察しない。
}

const specOf = (key: string): FieldSpec => {
  const spec = FIELD_SPECS.find((entry) => entry.key === key)
  if (spec === undefined) {
    throw new Error(`no spec for ${key}`)
  }
  return spec
}

// 入力は状態として持つ。操作が画面に出るので、play 関数で確かめられる。
const Harness = ({
  spec,
  initial,
}: {
  readonly initial: FieldValue
  readonly spec: FieldSpec
}): ReactElement => {
  const [value, setValue] = useState<FieldValue>(initial)
  return <FieldControl t={t} disabled={false} onInput={setValue} spec={spec} value={value} />
}

interface StoryArgs {
  readonly spec: FieldSpec
  readonly initial: FieldValue
}

const meta = {
  render: ({ initial, spec }: StoryArgs): ReactElement => <Harness spec={spec} initial={initial} />,
  title: 'flow-comment/controls/FieldControl',
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<StoryArgs>

export const Range: Story = {
  args: { initial: 36, spec: specOf('fontSizePx') },
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('fieldFontSizePx')).toBeTruthy()
    await expect(canvasElement.querySelector('.fc-readout')?.textContent).toBe('36')
  },
}

export const RangeShowsTheValue: Story = {
  args: { initial: 36, spec: specOf('fontSizePx') },
  play: async ({ canvasElement }): Promise<void> => {
    await expect(canvasElement.querySelector('.fc-thumb')).not.toBeNull()
    await expect(canvasElement.querySelector('.fc-readout')?.textContent).toBe('36')
  },
}

export const Checkbox: Story = {
  args: { initial: false, spec: specOf('showShadow') },
  play: async ({ canvasElement }): Promise<void> => {
    const box = canvasElement.querySelector('.fc-checkbox')
    if (box === null) {
      throw new Error('no checkbox')
    }
    await userEvent.click(box)
    await expect(box.getAttribute('aria-checked')).toBe('true')
  },
}

export const Radio: Story = {
  args: { initial: 'rtl', spec: specOf('direction') },
  play: async ({ canvasElement }): Promise<void> => {
    const radios = canvasElement.querySelectorAll('.fc-radio')
    await expect(radios.length).toBe(2)
    const left = radios.item(1)
    if (left === null) {
      throw new Error('no second radio')
    }
    await userEvent.click(left)
    await expect(left.getAttribute('aria-checked')).toBe('true')
  },
}

export const Font: Story = {
  args: { initial: 'Roboto', spec: specOf('fontFamily') },
  play: async ({ canvasElement }): Promise<void> => {
    const pick = canvasElement.querySelector('.fc-font-pick')
    if (pick === null) {
      throw new Error('no pick button')
    }
    await userEvent.click(pick)
    await expect(canvasElement.querySelector('.fc-font-search')).toBeTruthy()
    await expect(canvasElement.querySelectorAll('.fc-font-choice').length).toBeGreaterThan(0)
  },
}

export const Color: Story = {
  args: { initial: '#ffd400', spec: specOf('textColor') },
  play: async ({ canvasElement }): Promise<void> => {
    await expect(canvasElement.querySelector('input')?.getAttribute('type')).toBe('color')
  },
}

export const Disabled: Story = {
  args: { initial: 4, spec: specOf('shadowBlurPx') },
  play: async ({ canvasElement }): Promise<void> => {
    await expect(canvasElement.querySelector('[data-disabled]')).toBeTruthy()
  },
  render: ({ initial, spec }: StoryArgs): ReactElement => (
    <FieldControl t={t} disabled onInput={noop} spec={spec} value={initial} />
  ),
}
