import { Button } from '@base-ui/react/button'
// Runs with bun.
// フォントを選び直すときの操作列。「デフォルトに戻す」「フォントを選択する」を
// 並べ、端末のフォントを読める環境では「読み込む」も出す。
import { DEFAULT_CONFIG } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FieldValue } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { ReactElement } from 'react'

import type { Translate } from '../messages'

export interface FontActionsProps {
  /** 端末のフォントを読むボタンを出すか。読み終えたら消す。 */
  readonly canAskForFonts: boolean
  readonly disabled: boolean
  readonly loadLocal: () => Promise<void>
  readonly onInput: (value: FieldValue) => void
  /** これから選ぶ、という合図。今の指定は外して検索に切り替える。 */
  readonly onStartPicking: () => void
  readonly t: Translate
}

export const FontActions = ({
  canAskForFonts,
  disabled,
  loadLocal,
  onInput,
  onStartPicking,
  t,
}: FontActionsProps): ReactElement => (
  <div className="font-actions">
    <Button
      className="fc-font-reset"
      disabled={disabled}
      onClick={() => {
        onInput(DEFAULT_CONFIG.fontFamily)
      }}
      type="button"
    >
      {t('buttonFontReset')}
    </Button>
    <Button className="fc-font-pick" disabled={disabled} onClick={onStartPicking} type="button">
      {t('buttonFontPick')}
    </Button>
    {canAskForFonts ? (
      <Button
        className="fc-load-fonts"
        disabled={disabled}
        onClick={() => {
          void loadLocal()
        }}
        type="button"
      >
        {t('fontLoad')}
      </Button>
    ) : null}
  </div>
)
