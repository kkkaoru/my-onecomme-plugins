// Runs with bun.
// The panels around the form. Wired through one call so the screen does not
// need to know how many of them there are.
import type { FlowController } from '@my-onecomme-plugins/flow-comment-core/flow'

import type { JsonIoWiring } from './json-io'
import { wireJsonIo } from './json-io'
import { wireModelContext } from './model-tools'
import { wirePresets } from './presets'
import { startPreview, wirePreviewSamples, wirePreviewTheme } from './preview'

interface PanelWiring extends JsonIoWiring {
  readonly flow: FlowController
  readonly preview: HTMLElement
}

export const wirePanels = ({ flow, preview, ...wiring }: PanelWiring): void => {
  startPreview(flow)
  wirePreviewSamples(flow)
  wirePreviewTheme(preview)
  wirePresets(wiring)
  wireJsonIo(wiring)
  wireModelContext(wiring)
}
