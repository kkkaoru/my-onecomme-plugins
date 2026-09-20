// Runs with bun.
// 設定項目と UI コントロールの対応表。ここが表示順そのものなので、
// 並べ替えると設定画面の並びも変わる。
import type { FlowConfig } from './config'
import type { FieldLabelKey } from './label-keys'

export { FIELD_LABEL_KEYS } from './label-keys'
export type { FieldLabelKey } from './label-keys'

interface FieldOption {
  readonly labelKey: FieldLabelKey
  readonly value: string
}

interface FieldSpec {
  readonly key: keyof FlowConfig
  readonly labelKey: FieldLabelKey
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
    labelKey: 'fieldDirection',
    options: [
      { labelKey: 'fieldDirectionRtl', value: 'rtl' },
      { labelKey: 'fieldDirectionLtr', value: 'ltr' },
    ],
    type: 'radio',
  },
  {
    key: 'durationMs',
    labelKey: 'fieldDurationMs',
    max: 60_000,
    min: 500,
    step: 100,
    type: 'range',
  },
  { key: 'lanes', labelKey: 'fieldLanes', max: 50, min: 1, step: 1, type: 'range' },
  { key: 'laneGapPx', labelKey: 'fieldLaneGapPx', max: 200, min: 0, step: 1, type: 'range' },
  {
    key: 'laneHeightPx',
    labelKey: 'fieldLaneHeightPx',
    max: 1000,
    min: 0,
    step: 1,
    type: 'range',
  },
  { key: 'maxItems', labelKey: 'fieldMaxItems', max: 2000, min: 1, step: 1, type: 'range' },
  { key: 'fontFamily', labelKey: 'fieldFontFamily', type: 'font' },
  { key: 'fontSizePx', labelKey: 'fieldFontSizePx', max: 200, min: 8, step: 1, type: 'range' },
  { key: 'fontWeight', labelKey: 'fieldFontWeight', max: 900, min: 100, step: 100, type: 'range' },
  { key: 'textColor', labelKey: 'fieldTextColor', type: 'color' },
  {
    key: 'outlineWidthPx',
    labelKey: 'fieldOutlineWidthPx',
    max: 20,
    min: 0,
    step: 0.1,
    type: 'range',
  },
  { key: 'outlineColor', labelKey: 'fieldOutlineColor', type: 'color' },
  { key: 'showShadow', labelKey: 'fieldShowShadow', type: 'checkbox' },
  {
    group: 'shadow',
    key: 'shadowOffsetXPx',
    labelKey: 'fieldShadowOffsetXPx',
    max: 100,
    min: -100,
    step: 1,
    type: 'range',
  },
  {
    group: 'shadow',
    key: 'shadowOffsetYPx',
    labelKey: 'fieldShadowOffsetYPx',
    max: 100,
    min: -100,
    step: 1,
    type: 'range',
  },
  {
    group: 'shadow',
    key: 'shadowBlurPx',
    labelKey: 'fieldShadowBlurPx',
    max: 100,
    min: 0,
    step: 1,
    type: 'range',
  },
  { group: 'shadow', key: 'shadowColor', labelKey: 'fieldShadowColor', type: 'color' },
  { key: 'opacity', labelKey: 'fieldOpacity', max: 1, min: 0, step: 0.05, type: 'range' },
  {
    group: 'padding',
    key: 'paddingTopPx',
    labelKey: 'fieldItemPaddingTopPx',
    max: 200,
    min: 0,
    step: 1,
    type: 'range',
  },
  {
    group: 'padding',
    key: 'paddingRightPx',
    labelKey: 'fieldItemPaddingRightPx',
    max: 200,
    min: 0,
    step: 1,
    type: 'range',
  },
  {
    group: 'padding',
    key: 'paddingBottomPx',
    labelKey: 'fieldItemPaddingBottomPx',
    max: 200,
    min: 0,
    step: 1,
    type: 'range',
  },
  {
    group: 'padding',
    key: 'paddingLeftPx',
    labelKey: 'fieldItemPaddingLeftPx',
    max: 200,
    min: 0,
    step: 1,
    type: 'range',
  },
  { key: 'showAvatar', labelKey: 'fieldShowAvatar', type: 'checkbox' },
  { key: 'showName', labelKey: 'fieldShowName', type: 'checkbox' },
  { key: 'nameColor', labelKey: 'fieldNameColor', type: 'color' },
  { key: 'showBadges', labelKey: 'fieldShowBadges', type: 'checkbox' },
  { key: 'showPaidAvatar', labelKey: 'fieldShowPaidAvatar', type: 'checkbox' },
  { key: 'showPaidName', labelKey: 'fieldShowPaidName', type: 'checkbox' },
]

export type { FieldOption, FieldSpec }
