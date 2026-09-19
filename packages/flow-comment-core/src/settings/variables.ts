// Runs with bun.
// 設定項目と CSS 変数の対応表。config.ts から分離して可読性を保つ。
import type { FlowConfig, VariableBinding } from './defaults'

const bindings = (
  entries: readonly (readonly [string, keyof FlowConfig])[],
): readonly VariableBinding[] => entries.map(([name, field]) => ({ field, name }))

export const FLOW_VARIABLES: readonly VariableBinding[] = bindings([
  ['--fc-direction', 'direction'],
  ['--fc-duration', 'durationMs'],
  ['--fc-font-family', 'fontFamily'],
  ['--fc-font-size', 'fontSizePx'],
  ['--fc-font-weight', 'fontWeight'],
  ['--fc-lane-gap', 'laneGapPx'],
  ['--fc-lane-height', 'laneHeightPx'],
  ['--fc-lanes', 'lanes'],
  ['--fc-max-items', 'maxItems'],
  ['--fc-name-color', 'nameColor'],
  ['--fc-opacity', 'opacity'],
  ['--fc-outline-color', 'outlineColor'],
  ['--fc-outline-width', 'outlineWidthPx'],
  ['--fc-padding-bottom', 'paddingBottomPx'],
  ['--fc-padding-left', 'paddingLeftPx'],
  ['--fc-padding-right', 'paddingRightPx'],
  ['--fc-padding-top', 'paddingTopPx'],
  ['--fc-shadow-blur', 'shadowBlurPx'],
  ['--fc-shadow-color', 'shadowColor'],
  ['--fc-shadow-x', 'shadowOffsetXPx'],
  ['--fc-shadow-y', 'shadowOffsetYPx'],
  ['--fc-show-avatar', 'showAvatar'],
  ['--fc-show-badges', 'showBadges'],
  ['--fc-show-name', 'showName'],
  ['--fc-show-paid-avatar', 'showPaidAvatar'],
  ['--fc-show-paid-name', 'showPaidName'],
  ['--fc-show-shadow', 'showShadow'],
  ['--fc-text-color', 'textColor'],
])
