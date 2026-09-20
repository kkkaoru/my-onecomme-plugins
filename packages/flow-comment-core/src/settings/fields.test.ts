// Runs with bun.
import { expect, test } from 'vitest'

import { FIELD_SPECS } from './fields'

test('lists fields in the order the settings screen shows them', () => {
  expect.hasAssertions()
  expect(FIELD_SPECS.map((spec) => spec.key)).toStrictEqual([
    'direction',
    'durationMs',
    'lanes',
    'laneGapPx',
    'laneHeightPx',
    'maxItems',
    'fontFamily',
    'fontSizePx',
    'fontWeight',
    'textColor',
    'outlineWidthPx',
    'outlineColor',
    'showShadow',
    'shadowOffsetXPx',
    'shadowOffsetYPx',
    'shadowBlurPx',
    'shadowColor',
    'opacity',
    'paddingTopPx',
    'paddingRightPx',
    'paddingBottomPx',
    'paddingLeftPx',
    'showAvatar',
    'showName',
    'nameColor',
    'showBadges',
    'showPaidAvatar',
    'showPaidName',
  ])
})
