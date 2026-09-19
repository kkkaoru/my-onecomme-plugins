// Runs with bun.
// 数値の項目。つまみを動かしている間も現在値が見えるようになっている。
import { Slider } from '@base-ui/react/slider'
import type { ReactElement } from 'react'

import type { ControlProps } from './types'

export const RangeControl = ({ disabled, onInput, spec, t, value }: ControlProps): ReactElement => (
  <Slider.Root
    className={disabled ? 'field is-disabled' : 'field'}
    data-group={spec.group}
    disabled={disabled}
    max={spec.max}
    min={spec.min}
    onValueChange={(next) => {
      onInput(typeof next === 'number' ? next : value)
    }}
    step={spec.step}
    value={Number(value)}
  >
    <Slider.Label className="field-label">{t(spec.labelKey)}</Slider.Label>
    <Slider.Value className="fc-readout" />
    <Slider.Control className="fc-slider">
      <Slider.Track className="fc-track">
        <Slider.Indicator className="fc-indicator" />
        <Slider.Thumb className="fc-thumb" />
      </Slider.Track>
    </Slider.Control>
  </Slider.Root>
)
