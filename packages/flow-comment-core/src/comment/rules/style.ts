// Runs with bun.
// Style derivations for one comment. Each returns a plain object so the
// component itself holds no branching.

import type { CSSProperties } from 'react'

import type { FlowConfig } from '../../settings/config'
import { px } from '../../units'
import type { FlowColors } from '../model/comment'

// Past this width the outline is expensive to rasterize and a shadow would add
// a second full paint over it, so the shadow is dropped.
// ponytail: fixed threshold, make it a setting only if someone needs it.
const THICK_OUTLINE_PX = 6

const isFlatShadow = (config: FlowConfig): boolean =>
  config.shadowOffsetXPx === 0 && config.shadowOffsetYPx === 0 && config.shadowBlurPx === 0

export const selectStroke = (config: FlowConfig): string =>
  config.outlineWidthPx > 0 ? `${px(config.outlineWidthPx)} ${config.outlineColor}` : ''

export const selectShadow = (config: FlowConfig): string => {
  if (!config.showShadow || config.outlineWidthPx >= THICK_OUTLINE_PX || isFlatShadow(config)) {
    return 'none'
  }
  return `${px(config.shadowOffsetXPx)} ${px(config.shadowOffsetYPx)} ${px(config.shadowBlurPx)} ${config.shadowColor}`
}

export const selectItemStyle = (config: FlowConfig, card: boolean): CSSProperties => ({
  WebkitTextStroke: selectStroke(config),
  boxShadow: card ? selectShadow(config) : '',
  color: config.textColor,
  fontFamily: config.fontFamily,
  fontSize: px(config.fontSizePx),
  fontWeight: String(config.fontWeight),
  opacity: String(config.opacity),
  padding: `${px(config.paddingTopPx)} ${px(config.paddingRightPx)} ${px(config.paddingBottomPx)} ${px(config.paddingLeftPx)}`,
  paintOrder: 'stroke',
  // A card owns its background, so the shadow belongs to the box, not the text.
  textShadow: card ? '' : selectShadow(config),
})

export const selectBodyStyle = (colors: FlowColors | undefined): CSSProperties => ({
  background: colors?.bodyBackgroundColor,
  color: colors?.bodyTextColor,
})

export { THICK_OUTLINE_PX }
