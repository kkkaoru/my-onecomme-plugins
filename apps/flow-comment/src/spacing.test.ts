/* eslint-disable import/no-nodejs-modules -- CSS をそのまま読んで検証する */
import { readFileSync } from 'node:fs'

/* eslint-disable import/no-nodejs-modules -- CSS をそのまま読んで検証する */
// Runs with bun.
// 設定画面の余白の決まりごとを固定する。実際に詰まって見えた問題（行間 0px）が
// 再発しないよう、CSS そのものを検証する。
import { expect, test } from 'vitest'

const css = readFileSync(new URL('../static/style.css', import.meta.url), 'utf8')

// margin / padding / gap の宣言だけを見る（文字サイズや枠線は対象外）。
const SPACING =
  /(?:margin|padding|gap)(?:-(?:block|inline))?(?:-(?:start|end|top|bottom|left|right))?:\s*(?<value>[^;]+);/gu
const PX = /(?<number>-?\d*\.?\d+)px/gu

const spacingValues = (): readonly string[] =>
  [...css.matchAll(SPACING)].map((match) => match.groups?.['value'] ?? '')

const offGrid = (value: string): readonly number[] =>
  [...value.matchAll(PX)]
    .map((match) => Number(match.groups?.['number'] ?? 0))
    .filter((number) => number % 4 !== 0)

test('reads the settings stylesheet', () => {
  expect.hasAssertions()
  expect(css.length).toBeGreaterThan(1000)
})

test('uses only multiples of 4px for spacing', () => {
  expect.hasAssertions()
  expect(spacingValues().flatMap((value) => offGrid(value))).toStrictEqual([])
})

test('keeps vertical room below the rows of the form and the panels', () => {
  expect.hasAssertions()
  for (const selector of ['.field', '.fc-field']) {
    expect(css).toContain(`${selector} {`)
  }
  // 行の下に必ず余白がある（くっつくと読みにくい）。
  expect(css).toContain('margin: 0 0 var(--ui-space-3);')
})

test('keeps the section headings apart', () => {
  expect.hasAssertions()
  expect(css).toContain('margin: var(--ui-space-8) 0 var(--ui-space-3);')
})
