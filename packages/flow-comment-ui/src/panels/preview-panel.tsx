// Runs with bun.
// プレビュー。設定をその場で当てて、見本のコメントを流し続ける。
import { Button } from '@base-ui/react/button'
import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import type { FormatLabel } from '@my-onecomme-plugins/flow-comment-core/comment'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import { useState } from 'react'
import type { ReactElement } from 'react'

import { usePreview } from '../hooks/use-preview'
import type { Translate } from '../messages'

const DARK = 'dark'
const LIGHT = 'light'

export interface PreviewPanelProps {
  readonly t: Translate
  readonly formatLabel: FormatLabel
  readonly settings: FlowConfig
}

export const PreviewPanel = ({ formatLabel, settings, t }: PreviewPanelProps): ReactElement => {
  // 既定は白系。配信の見た目ではなくプレビューの背景だけの話。
  const [light, setLight] = useState(true)
  const { host, push, samples } = usePreview(settings, formatLabel)
  return (
    <section>
      <h2>{t('sectionPreview')}</h2>
      <RadioGroup
        className="preview-tools"
        onValueChange={(next) => {
          setLight(next === LIGHT)
        }}
        value={light ? LIGHT : DARK}
      >
        <span className="field-label">{t('previewBackground')}</span>
        <label className="radio-item">
          <Radio.Root className="fc-radio" value={DARK} />
          <span>{t('previewDark')}</span>
        </label>
        <label className="radio-item">
          <Radio.Root className="fc-radio" value={LIGHT} />
          <span>{t('previewLight')}</span>
        </label>
        <span className="note">{t('previewNote')}</span>
      </RadioGroup>
      <p className="preview-samples">
        {samples.map((sample) => (
          <Button
            className="fc-sample"
            key={sample.labelKey}
            onClick={() => {
              push(sample)
            }}
            type="button"
          >
            {t(sample.labelKey)}
          </Button>
        ))}
      </p>
      <div className={light ? 'preview is-light' : 'preview'} ref={host} />
    </section>
  )
}
