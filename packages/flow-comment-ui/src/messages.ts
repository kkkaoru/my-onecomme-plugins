// Runs with bun.
// 画面が使う文言のキー。文言そのものはアプリの辞書にあり、ここはキーの一覧だけを
// 持つ。辞書がこの集合を満たしていることはアプリ側のテストで確かめる。
import type { FieldLabelKey } from '@my-onecomme-plugins/flow-comment-core/fields'
import type { SampleLabelKey } from '@my-onecomme-plugins/flow-comment-core/samples'

export const UI_MESSAGE_KEYS = [
  'appTitle',
  'appDescription',
  'buttonCopy',
  'buttonExport',
  'buttonFontReset',
  'fontFilterPlaceholder',
  'buttonFontPick',
  'buttonImport',
  'buttonPresetDelete',
  'buttonPresetLoad',
  'buttonPresetSave',
  'buttonReset',
  'buttonSave',
  'copyFailed',
  'copySuccess',
  'exportSuccess',
  'fontLoad',
  'fontLoadDenied',
  'fontLoadUnsupported',
  'groupPadding',
  'groupShadow',
  'toolGetSettings',
  'toolListPresets',
  'toolSavePreset',
  'toolUpdateSettings',
  'importFailed',
  'importSuccess',
  'labelJson',
  'linkHelp',
  'linkLicenses',
  'labelPresetName',
  'labelPresetSaved',
  'loadFailed',
  'placeholderPresetName',
  'presetDeleteFailed',
  'presetDeleted',
  'presetLoadFailed',
  'presetLoaded',
  'presetNameRequired',
  'presetSaveFailed',
  'presetSaved',
  'previewBackground',
  'previewDark',
  'previewLight',
  'previewNote',
  'resetFailed',
  'resetSuccess',
  'saveFailed',
  'saveSuccess',
  'sectionDisplay',
  'sectionJson',
  'sectionPresets',
  'sectionPreview',
] as const

export type UiMessageKey = (typeof UI_MESSAGE_KEYS)[number]

export type MessageKey = FieldLabelKey | SampleLabelKey | UiMessageKey

export type Translate = (key: MessageKey, params?: Readonly<Record<string, string>>) => string
