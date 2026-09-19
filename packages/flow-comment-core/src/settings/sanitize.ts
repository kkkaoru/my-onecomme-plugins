// Runs with bun.
// 未検証の値（設定 JSON、CSS 変数、store の中身）を FlowConfig に均す。
// 範囲外はクランプ、型違いと欠損は既定値に落とす。ここを通らない設定は存在しない。
import { DEFAULT_CONFIG, TRUE_VALUES } from './defaults'
import type { FieldValue, FlowConfig } from './defaults'

const MIN_LANES = 1
const MAX_LANES = 50
const MIN_DURATION_MS = 500
const MAX_DURATION_MS = 60_000
const MIN_FONT_SIZE_PX = 8
const MAX_FONT_SIZE_PX = 200
const MIN_FONT_WEIGHT = 100
const MAX_FONT_WEIGHT = 900
const MIN_OUTLINE_WIDTH_PX = 0
const MAX_OUTLINE_WIDTH_PX = 20
const MIN_SHADOW_BLUR_PX = 0
const MAX_SHADOW_BLUR_PX = 100
const MIN_SHADOW_OFFSET_PX = -100
const MAX_SHADOW_OFFSET_PX = 100
const MIN_LANE_GAP_PX = 0
const MAX_LANE_GAP_PX = 200
const MIN_ITEM_PADDING_PX = 0
const MAX_ITEM_PADDING_PX = 200
const MIN_LANE_HEIGHT_PX = 0
const MAX_LANE_HEIGHT_PX = 1000
const MIN_OPACITY = 0
const MAX_OPACITY = 1
const MIN_MAX_ITEMS = 1
const MAX_MAX_ITEMS = 2000

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(Math.round(value), min), max)

const clampFloat = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

const toNumber = (raw: string, fallback: number): number => {
  const value = Number.parseFloat(raw)
  return Number.isFinite(value) ? value : fallback
}

const toBoolean = (raw: string, fallback: boolean): boolean => {
  const value = raw.trim().toLowerCase()
  return value === '' ? fallback : TRUE_VALUES.has(value)
}

const toText = (raw: string, fallback: string): string => raw.trim() || fallback

const toColor = (raw: string, fallback: string): string => {
  const value = raw.trim()
  return value === '' ? fallback : value
}

const readFieldValue = (raw: unknown, field: keyof FlowConfig): FieldValue => {
  if (typeof raw === 'boolean' || typeof raw === 'number' || typeof raw === 'string') {
    return raw
  }
  // 欠けたキーは既定値に戻す。ここを false 固定にすると既定 true の項目が false になる。
  return DEFAULT_CONFIG[field]
}

const asFieldRecord = (input: unknown): ReadonlyMap<string, unknown> => {
  const fields = new Map<string, unknown>()
  if (typeof input !== 'object' || input === null) {
    return fields
  }
  for (const [key, value] of Object.entries(input)) {
    fields.set(key, value)
  }
  return fields
}

export const sanitizeConfig = (input: unknown): FlowConfig => {
  const source = asFieldRecord(input)
  const pick = (field: keyof FlowConfig): FieldValue => readFieldValue(source.get(field), field)
  const number = (field: keyof FlowConfig, min: number, max: number): number =>
    clamp(toNumber(String(pick(field)), Number(DEFAULT_CONFIG[field])), min, max)
  const decimal = (field: keyof FlowConfig, min: number, max: number): number =>
    clampFloat(toNumber(String(pick(field)), Number(DEFAULT_CONFIG[field])), min, max)
  const flag = (field: keyof FlowConfig, fallback: boolean): boolean =>
    toBoolean(String(pick(field)), fallback)
  const color = (field: keyof FlowConfig, fallback: string): string =>
    toColor(String(pick(field)), fallback)
  return {
    direction: pick('direction') === 'ltr' ? 'ltr' : 'rtl',
    durationMs: number('durationMs', MIN_DURATION_MS, MAX_DURATION_MS),
    fontFamily: toText(String(pick('fontFamily')), DEFAULT_CONFIG.fontFamily),
    fontSizePx: number('fontSizePx', MIN_FONT_SIZE_PX, MAX_FONT_SIZE_PX),
    fontWeight: number('fontWeight', MIN_FONT_WEIGHT, MAX_FONT_WEIGHT),
    laneGapPx: number('laneGapPx', MIN_LANE_GAP_PX, MAX_LANE_GAP_PX),
    laneHeightPx: number('laneHeightPx', MIN_LANE_HEIGHT_PX, MAX_LANE_HEIGHT_PX),
    lanes: number('lanes', MIN_LANES, MAX_LANES),
    maxItems: number('maxItems', MIN_MAX_ITEMS, MAX_MAX_ITEMS),
    nameColor: color('nameColor', DEFAULT_CONFIG.nameColor),
    opacity: decimal('opacity', MIN_OPACITY, MAX_OPACITY),
    outlineColor: color('outlineColor', DEFAULT_CONFIG.outlineColor),
    outlineWidthPx: decimal('outlineWidthPx', MIN_OUTLINE_WIDTH_PX, MAX_OUTLINE_WIDTH_PX),
    paddingBottomPx: number('paddingBottomPx', MIN_ITEM_PADDING_PX, MAX_ITEM_PADDING_PX),
    paddingLeftPx: number('paddingLeftPx', MIN_ITEM_PADDING_PX, MAX_ITEM_PADDING_PX),
    paddingRightPx: number('paddingRightPx', MIN_ITEM_PADDING_PX, MAX_ITEM_PADDING_PX),
    paddingTopPx: number('paddingTopPx', MIN_ITEM_PADDING_PX, MAX_ITEM_PADDING_PX),
    shadowBlurPx: number('shadowBlurPx', MIN_SHADOW_BLUR_PX, MAX_SHADOW_BLUR_PX),
    shadowColor: color('shadowColor', DEFAULT_CONFIG.shadowColor),
    shadowOffsetXPx: number('shadowOffsetXPx', MIN_SHADOW_OFFSET_PX, MAX_SHADOW_OFFSET_PX),
    shadowOffsetYPx: number('shadowOffsetYPx', MIN_SHADOW_OFFSET_PX, MAX_SHADOW_OFFSET_PX),
    showAvatar: flag('showAvatar', DEFAULT_CONFIG.showAvatar),
    showBadges: flag('showBadges', DEFAULT_CONFIG.showBadges),
    showName: flag('showName', DEFAULT_CONFIG.showName),
    showPaidAvatar: flag('showPaidAvatar', DEFAULT_CONFIG.showPaidAvatar),
    showPaidName: flag('showPaidName', DEFAULT_CONFIG.showPaidName),
    showShadow: flag('showShadow', DEFAULT_CONFIG.showShadow),
    textColor: color('textColor', DEFAULT_CONFIG.textColor),
  }
}
