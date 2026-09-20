// Runs with bun.
import { expect, test } from 'vitest'

import { createVariableLookup, readFlowConfig, sanitizeConfig } from './config'

const noVariable: (name: string) => string = () => ''
const noOverride: (name: string, fallback: string) => string = (_name, fallback) => fallback

const readFrom =
  (variables: Readonly<Record<string, string>>) =>
  (name: string): string =>
    variables[name] ?? ''

test('falls back to the documented defaults', () => {
  expect.hasAssertions()
  expect(readFlowConfig(noOverride)).toStrictEqual({
    direction: 'rtl',
    durationMs: 9000,
    fontFamily: 'Noto Sans JP Variable',
    fontSizePx: 36,
    fontWeight: 700,
    laneGapPx: 4,
    laneHeightPx: 0,
    lanes: 5,
    maxItems: 200,
    nameColor: '#ffffff',
    opacity: 1,
    outlineColor: '#000000',
    outlineWidthPx: 2,
    paddingBottomPx: 5,
    paddingLeftPx: 14,
    paddingRightPx: 14,
    paddingTopPx: 5,
    shadowBlurPx: 1,
    shadowColor: '#000000',
    shadowOffsetXPx: 1,
    shadowOffsetYPx: 1,
    showAvatar: false,
    showBadges: true,
    showName: false,
    showPaidAvatar: true,
    showPaidName: true,
    showShadow: false,
    textColor: '#ffffff',
  })
})

test('parses every supported css variable', () => {
  expect.hasAssertions()
  const lookup = readFrom({
    '--fc-direction': 'ltr',
    '--fc-duration': '1200',
    '--fc-font-family': 'serif',
    '--fc-font-size': '40',
    '--fc-font-weight': '400',
    '--fc-lane-gap': '20',
    '--fc-lane-height': '64',
    '--fc-lanes': '3',
    '--fc-max-items': '9',
    '--fc-name-color': '#111111',
    '--fc-opacity': '0.5',
    '--fc-outline-color': '#222222',
    '--fc-outline-width': '5',
    '--fc-padding-bottom': '12',
    '--fc-padding-left': '12',
    '--fc-padding-right': '12',
    '--fc-padding-top': '12',
    '--fc-shadow-blur': '4',
    '--fc-shadow-color': '#000',
    '--fc-shadow-x': '2',
    '--fc-shadow-y': '2',
    '--fc-show-name': 'true',
    '--fc-show-shadow': 'true',
    '--fc-text-color': '#ffffff',
  })
  expect(readFlowConfig(createVariableLookup(lookup, null))).toStrictEqual({
    direction: 'ltr',
    durationMs: 1200,
    fontFamily: 'serif',
    fontSizePx: 40,
    fontWeight: 400,
    laneGapPx: 20,
    laneHeightPx: 64,
    lanes: 3,
    maxItems: 9,
    nameColor: '#111111',
    opacity: 0.5,
    outlineColor: '#222222',
    outlineWidthPx: 5,
    paddingBottomPx: 12,
    paddingLeftPx: 12,
    paddingRightPx: 12,
    paddingTopPx: 12,
    shadowBlurPx: 4,
    shadowColor: '#000',
    shadowOffsetXPx: 2,
    shadowOffsetYPx: 2,
    showAvatar: false,
    showBadges: true,
    showName: true,
    showPaidAvatar: true,
    showPaidName: true,
    showShadow: true,
    textColor: '#ffffff',
  })
})

test('lets a css variable win over a plugin setting', () => {
  expect.hasAssertions()
  const settings = sanitizeConfig({ fontSizePx: 10, lanes: 8 })
  const lookup = createVariableLookup(readFrom({ '--fc-lanes': '2' }), settings)
  const config = readFlowConfig(lookup)
  expect([config.lanes, config.fontSizePx]).toStrictEqual([2, 10])
})

test('uses plugin settings when no css variable is set', () => {
  expect.hasAssertions()
  const settings = sanitizeConfig({ lanes: 8, showName: true, textColor: '#abcdef' })
  const config = readFlowConfig(createVariableLookup(noVariable, settings))
  expect([config.lanes, config.showName, config.textColor]).toStrictEqual([8, true, '#abcdef'])
})

test('clamps out of range settings', () => {
  expect.hasAssertions()
  const config = sanitizeConfig({
    durationMs: 1,
    fontSizePx: 100_000,
    lanes: 999,
    maxItems: 0,
    opacity: 5,
  })
  expect([
    config.durationMs,
    config.fontSizePx,
    config.lanes,
    config.maxItems,
    config.opacity,
  ]).toStrictEqual([500, 200, 50, 1, 1])
})

test('rejects malformed settings without throwing', () => {
  expect.hasAssertions()
  const config = sanitizeConfig({
    direction: 'sideways',
    durationMs: null,
    fontFamily: 42,
    lanes: 'three',
    showAvatar: false,
    showBadges: true,
    showName: 'yes',
    showPaidAvatar: true,
    showPaidName: true,
    showShadow: false,
  })
  expect([config.direction, config.durationMs, config.lanes, config.showName]).toStrictEqual([
    'rtl',
    9000,
    5,
    true,
  ])
})

test('accepts native boolean and number values', () => {
  expect.hasAssertions()
  const config = sanitizeConfig({ lanes: 4, opacity: 0.25, showName: true })
  expect([config.lanes, config.opacity, config.showName]).toStrictEqual([4, 0.25, true])
})

test('falls back for values of an unsupported type', () => {
  expect.hasAssertions()
  const config = sanitizeConfig({ lanes: null, showName: null, textColor: null })
  expect([config.lanes, config.showName, config.textColor]).toStrictEqual([5, false, '#ffffff'])
})

test('falls back for blank string values', () => {
  expect.hasAssertions()
  const config = sanitizeConfig({
    fontFamily: '',
    nameColor: '',
    outlineColor: '',
    showAvatar: false,
    showBadges: true,
    showName: '',
    showPaidAvatar: true,
    showPaidName: true,
    showShadow: false,
    textColor: '',
  })
  expect([
    config.fontFamily,
    config.nameColor,
    config.outlineColor,
    config.showName,
    config.textColor,
  ]).toStrictEqual(['Noto Sans JP Variable', '#ffffff', '#000000', false, '#ffffff'])
})

test('uses defaults when no variable and no settings are available', () => {
  expect.hasAssertions()
  const config = readFlowConfig(createVariableLookup(noVariable, null))
  expect([config.lanes, config.textColor]).toStrictEqual([5, '#ffffff'])
})

test('accepts unknown input shapes', () => {
  expect.hasAssertions()
  expect(sanitizeConfig(null).lanes).toBe(5)
  expect(sanitizeConfig('nope').lanes).toBe(5)
  expect(sanitizeConfig([]).lanes).toBe(5)
})
