// Runs with bun.
// 1項目ぶんの入力コントロールが受け取る形。種類ごとの実装はこれだけを知る。
import type { FieldSpec } from '@my-onecomme-plugins/flow-comment-core/fields'
import type { FieldValue } from '@my-onecomme-plugins/flow-comment-core/settings'

import type { Translate } from '../messages'

export interface ControlProps {
  readonly disabled: boolean
  readonly onInput: (value: FieldValue) => void
  readonly spec: FieldSpec
  readonly t: Translate
  readonly value: FieldValue
}
