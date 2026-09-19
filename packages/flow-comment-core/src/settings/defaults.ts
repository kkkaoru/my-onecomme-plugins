// Runs with bun.
// 設定の形と既定値。ここが唯一の「正」で、読み取りも検証もこの表を参照する。
const DEFAULT_LANES = 5
const DEFAULT_DURATION_MS = 9000
const DEFAULT_FONT_SIZE_PX = 36
const DEFAULT_FONT_WEIGHT = 700
const DEFAULT_OUTLINE_WIDTH_PX = 2
const DEFAULT_SHADOW_BLUR_PX = 1
const DEFAULT_SHADOW_COLOR = '#000000'
const DEFAULT_SHADOW_OFFSET_PX = 1
const DEFAULT_LANE_GAP_PX = 4
const DEFAULT_PADDING_X_PX = 14
const DEFAULT_PADDING_Y_PX = 5
const DEFAULT_LANE_HEIGHT_PX = 0
const DEFAULT_SHOW_AVATAR = false
const DEFAULT_SHOW_BADGES = true
const DEFAULT_SHOW_SHADOW = false
const DEFAULT_SHOW_PAID_AUTHOR = true
const DEFAULT_OPACITY = 1
const DEFAULT_MAX_ITEMS = 200
const DEFAULT_TEXT_COLOR = '#ffffff'
const DEFAULT_OUTLINE_COLOR = '#000000'
const DEFAULT_NAME_COLOR = '#ffd400'
const DEFAULT_FONT_FAMILY = 'Noto Sans JP Variable'

// CSS 変数や JSON から来る真偽値の表記ゆれをここで吸収する。
const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on'])

type FlowDirection = 'ltr' | 'rtl'
type FieldValue = boolean | number | string

interface FlowConfig {
  readonly direction: FlowDirection
  readonly durationMs: number
  readonly fontFamily: string
  readonly fontSizePx: number
  readonly fontWeight: number
  readonly paddingBottomPx: number
  readonly paddingLeftPx: number
  readonly paddingRightPx: number
  readonly paddingTopPx: number
  readonly laneGapPx: number
  readonly laneHeightPx: number
  readonly lanes: number
  readonly maxItems: number
  readonly nameColor: string
  readonly opacity: number
  readonly outlineColor: string
  readonly outlineWidthPx: number
  readonly shadowBlurPx: number
  readonly shadowColor: string
  readonly shadowOffsetXPx: number
  readonly shadowOffsetYPx: number
  readonly showAvatar: boolean
  readonly showBadges: boolean
  readonly showName: boolean
  readonly showPaidAvatar: boolean
  readonly showPaidName: boolean
  readonly showShadow: boolean
  readonly textColor: string
}

type VariableLookup = (name: string, fallback: string) => string

interface VariableBinding {
  readonly field: keyof FlowConfig
  readonly name: string
}

const DEFAULT_CONFIG: FlowConfig = {
  direction: 'rtl',
  durationMs: DEFAULT_DURATION_MS,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontSizePx: DEFAULT_FONT_SIZE_PX,
  fontWeight: DEFAULT_FONT_WEIGHT,
  laneGapPx: DEFAULT_LANE_GAP_PX,
  laneHeightPx: DEFAULT_LANE_HEIGHT_PX,
  lanes: DEFAULT_LANES,
  maxItems: DEFAULT_MAX_ITEMS,
  nameColor: DEFAULT_NAME_COLOR,
  opacity: DEFAULT_OPACITY,
  outlineColor: DEFAULT_OUTLINE_COLOR,
  outlineWidthPx: DEFAULT_OUTLINE_WIDTH_PX,
  paddingBottomPx: DEFAULT_PADDING_Y_PX,
  paddingLeftPx: DEFAULT_PADDING_X_PX,
  paddingRightPx: DEFAULT_PADDING_X_PX,
  paddingTopPx: DEFAULT_PADDING_Y_PX,
  shadowBlurPx: DEFAULT_SHADOW_BLUR_PX,
  shadowColor: DEFAULT_SHADOW_COLOR,
  shadowOffsetXPx: DEFAULT_SHADOW_OFFSET_PX,
  shadowOffsetYPx: DEFAULT_SHADOW_OFFSET_PX,
  showAvatar: DEFAULT_SHOW_AVATAR,
  showBadges: DEFAULT_SHOW_BADGES,
  // 名前は「アイコンとは別に」既定では出さないため、専用の定数を持たせない。
  showName: false,
  showPaidAvatar: DEFAULT_SHOW_PAID_AUTHOR,
  showPaidName: DEFAULT_SHOW_PAID_AUTHOR,
  showShadow: DEFAULT_SHOW_SHADOW,
  textColor: DEFAULT_TEXT_COLOR,
}

export { DEFAULT_CONFIG, TRUE_VALUES }
export type { FieldValue, FlowConfig, FlowDirection, VariableBinding, VariableLookup }
