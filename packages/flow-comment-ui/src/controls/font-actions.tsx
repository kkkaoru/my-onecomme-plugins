import { Button } from '@base-ui/react/button'
// Runs with bun.
// Extra font actions: restore the default family, and load device fonts.
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
  readonly t: Translate
}

export const FontActions = ({
  canAskForFonts,
  disabled,
  loadLocal,
  onInput,
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
