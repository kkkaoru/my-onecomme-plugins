// Runs with bun.
// 設定項目と UI コントロールの対応表。ここが表示順そのものなので、
// 並べ替えると設定画面の並びも変わる。
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'

interface FieldOption {
  readonly label: string
  readonly value: string
}

interface FieldSpec {
  readonly key: keyof FlowConfig
  readonly label: string
  readonly type: 'checkbox' | 'color' | 'font' | 'radio' | 'range' | 'select' | 'text'
  readonly max?: number
  readonly min?: number
  readonly group?: string
  readonly options?: readonly FieldOption[]
  readonly step?: number
}

export const FIELD_SPECS: readonly FieldSpec[] = [
  {
    key: 'direction',
    label: '流れる向き',
    options: [
      { label: '右から左', value: 'rtl' },
      { label: '左から右', value: 'ltr' },
    ],
    type: 'radio',
  },
  {
    key: 'durationMs',
    label: '画面を横切る時間 (ms)',
    max: 60_000,
    min: 500,
    step: 100,
    type: 'range',
  },
  { key: 'lanes', label: 'レーン数 (行数)', max: 50, min: 1, step: 1, type: 'range' },
  { key: 'maxItems', label: '同時に保持する最大数', max: 2000, min: 1, step: 1, type: 'range' },
  { key: 'fontSizePx', label: '文字サイズ (px)', max: 200, min: 8, step: 1, type: 'range' },
  { key: 'fontFamily', label: 'フォント', type: 'font' },
  { key: 'fontWeight', label: '文字の太さ', max: 900, min: 100, step: 100, type: 'range' },
  { key: 'textColor', label: '文字色', type: 'color' },
  {
    key: 'outlineWidthPx',
    label: '縁取りの太さ (px, 太いとトゲが出やすい)',
    max: 20,
    min: 0,
    step: 0.1,
    type: 'range',
  },
  { key: 'outlineColor', label: '縁取りの色', type: 'color' },
  { key: 'showPaidAvatar', label: 'スパチャ/ギフトでアイコンを表示', type: 'checkbox' },
  { key: 'showPaidName', label: 'スパチャ/ギフトで名前を表示', type: 'checkbox' },
  { key: 'showShadow', label: '影を付ける', type: 'checkbox' },
  {
    group: 'shadow',
    key: 'shadowOffsetXPx',
    label: '影の横位置 (px)',
    max: 100,
    min: -100,
    step: 1,
    type: 'range',
  },
  {
    group: 'shadow',
    key: 'shadowOffsetYPx',
    label: '影の縦位置 (px)',
    max: 100,
    min: -100,
    step: 1,
    type: 'range',
  },
  {
    group: 'shadow',
    key: 'shadowBlurPx',
    label: '影のほかし (px)',
    max: 100,
    min: 0,
    step: 1,
    type: 'range',
  },
  { group: 'shadow', key: 'shadowColor', label: '影の色', type: 'color' },
  { key: 'opacity', label: '不透明度', max: 1, min: 0, step: 0.05, type: 'range' },
  { key: 'paddingTopPx', label: '余白 上 (px)', max: 200, min: 0, step: 1, type: 'range' },
  { key: 'paddingRightPx', label: '余白 右 (px)', max: 200, min: 0, step: 1, type: 'range' },
  { key: 'paddingBottomPx', label: '余白 下 (px)', max: 200, min: 0, step: 1, type: 'range' },
  { key: 'paddingLeftPx', label: '余白 左 (px)', max: 200, min: 0, step: 1, type: 'range' },
  { key: 'laneGapPx', label: '行の間隔 (px)', max: 200, min: 0, step: 1, type: 'range' },
  {
    key: 'laneHeightPx',
    label: '1行の高さ (px, 0 = 自動)',
    max: 1000,
    min: 0,
    step: 1,
    type: 'range',
  },
  { key: 'showAvatar', label: 'アイコンを表示', type: 'checkbox' },
  { key: 'showBadges', label: 'バッジを表示（メンバー等）', type: 'checkbox' },
  { key: 'showName', label: '投稿者名を表示', type: 'checkbox' },
  { key: 'nameColor', label: '投稿者名の色', type: 'color' },
]

export type { FieldOption, FieldSpec }
