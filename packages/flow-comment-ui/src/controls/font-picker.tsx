import { Button } from '@base-ui/react/button'
import { Input } from '@base-ui/react/input'
// Runs with bun.
// フォントの選択。押されたときだけ検索と候補を出す。
import type { FieldValue } from '@my-onecomme-plugins/flow-comment-core/settings'
import { useState } from 'react'
import type { ReactElement } from 'react'

import { useFonts } from '../hooks/use-fonts'
import type { Translate } from '../messages'
import { FontActions } from './font-actions'

interface ChoicesProps {
  readonly disabled: boolean
  readonly filter: string
  readonly matches: readonly string[]
  readonly onFilter: (next: string) => void
  readonly onPick: (value: FieldValue) => void
  readonly t: Translate
}

const FontChoices = ({
  disabled,
  filter,
  matches,
  onFilter,
  onPick,
  t,
}: ChoicesProps): ReactElement => (
  <>
    <Input
      className="fc-input fc-font-search"
      disabled={disabled}
      onChange={(event) => {
        onFilter(event.currentTarget.value)
      }}
      placeholder={t('fontFilterPlaceholder')}
      type="search"
      value={filter}
    />
    <div className="font-choices">
      {matches.map((name) => (
        <Button
          className="fc-font-choice"
          disabled={disabled}
          key={name}
          onClick={() => {
            onPick(name)
          }}
          type="button"
        >
          {name}
        </Button>
      ))}
    </div>
  </>
)

export interface FontPickerProps {
  readonly disabled: boolean
  readonly onInput: (value: FieldValue) => void
  readonly t: Translate
}

export const FontPicker = ({ disabled, onInput, t }: FontPickerProps): ReactElement => {
  const [picking, setPicking] = useState(false)
  const [filter, setFilter] = useState('')
  const { canLoad, loadLocal, loadResult, matches } = useFonts(filter)
  const notes = canLoad ? loadResult === 'denied' : true
  return (
    <>
      <FontActions
        canAskForFonts={canLoad && loadResult !== 'loaded'}
        disabled={disabled}
        loadLocal={loadLocal}
        onInput={onInput}
        onStartPicking={() => {
          setPicking(true)
          setFilter('')
          onInput('')
        }}
        t={t}
      />
      {picking ? (
        <FontChoices
          disabled={disabled}
          filter={filter}
          matches={matches}
          onFilter={setFilter}
          onPick={(next) => {
            onInput(next)
            setPicking(false)
          }}
          t={t}
        />
      ) : null}
      {notes ? (
        <span className="note">{t(canLoad ? 'fontLoadDenied' : 'fontLoadUnsupported')}</span>
      ) : null}
    </>
  )
}
