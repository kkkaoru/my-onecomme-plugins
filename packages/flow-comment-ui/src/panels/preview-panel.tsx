// Runs with bun.
// プレビュー。設定をその場で当てて、見本のコメントを流し続ける。
import { Checkbox } from '@base-ui/react/checkbox'
import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import type { FormatLabel } from '@my-onecomme-plugins/flow-comment-core/comment'
import type { PreviewSample, SampleLabelKey } from '@my-onecomme-plugins/flow-comment-core/samples'
import { PREVIEW_SAMPLES } from '@my-onecomme-plugins/flow-comment-core/samples'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import { useRef, useState } from 'react'
import type { ReactElement } from 'react'

import { usePreview } from '../hooks/use-preview'
import type { Translate } from '../messages'

const DARK = 'dark'
const LIGHT = 'light'

const ALL_SAMPLE_KEYS: ReadonlySet<SampleLabelKey> = new Set(
  PREVIEW_SAMPLES.map((sample) => sample.labelKey),
)

export interface PreviewPanelProps {
  readonly t: Translate
  readonly formatLabel: FormatLabel
  readonly settings: FlowConfig
}

interface EnabledHold {
  current: ReadonlySet<SampleLabelKey>
}

interface ToggleSample {
  readonly enabled: ReadonlySet<SampleLabelKey>
  readonly hold: EnabledHold
  readonly next: PreviewSample
  readonly on: boolean
  readonly push: (sample: PreviewSample) => void
  readonly setEnabled: (keys: ReadonlySet<SampleLabelKey>) => void
}

interface SampleToggleProps {
  readonly enabled: ReadonlySet<SampleLabelKey>
  readonly onToggle: (sample: PreviewSample, on: boolean) => void
  readonly sample: PreviewSample
  readonly t: Translate
}

interface PreviewStageProps {
  readonly fontFamily: string
  readonly host: (element: HTMLElement | null) => (() => void) | undefined
  readonly light: boolean
}

const toggleSample = ({ enabled, hold, next, on, push, setEnabled }: ToggleSample): void => {
  const keys = new Set(enabled)
  if (on) {
    keys.add(next.labelKey)
    push(next)
  } else {
    keys.delete(next.labelKey)
  }
  hold.current = keys
  setEnabled(keys)
}

const PreviewStage = ({ fontFamily, host, light }: PreviewStageProps): ReactElement => (
  <div
    className={light ? 'preview is-light' : 'preview'}
    data-font={fontFamily}
    key={fontFamily}
    ref={host}
  />
)

const SampleToggle = ({ enabled, onToggle, sample, t }: SampleToggleProps): ReactElement => (
  <div className="preview-sample">
    <Checkbox.Root
      checked={enabled.has(sample.labelKey)}
      className="fc-checkbox fc-sample"
      onCheckedChange={(checked) => {
        onToggle(sample, checked === true)
      }}
    >
      <Checkbox.Indicator className="fc-check-indicator" />
    </Checkbox.Root>
    <span>{t(sample.labelKey)}</span>
  </div>
)

export const PreviewPanel = ({ formatLabel, settings, t }: PreviewPanelProps): ReactElement => {
  const [light, setLight] = useState(true)
  const [enabled, setEnabled] = useState<ReadonlySet<SampleLabelKey>>(ALL_SAMPLE_KEYS)
  const enabledHold = useRef(enabled)
  const { host, push, samples } = usePreview({
    enabled: enabledHold,
    formatLabel,
    settings,
  })
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
          <SampleToggle
            enabled={enabled}
            key={sample.labelKey}
            onToggle={(next, on) => {
              toggleSample({ enabled, hold: enabledHold, next, on, push, setEnabled })
            }}
            sample={sample}
            t={t}
          />
        ))}
      </p>
      <PreviewStage fontFamily={settings.fontFamily} host={host} light={light} />
    </section>
  )
}
