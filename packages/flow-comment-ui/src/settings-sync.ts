// Runs with bun.
// Settings UI and the OBS template share this channel when they are same-origin.
import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'

export const SETTINGS_CHANNEL = 'flow-comment-settings'

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null

const noop = (): boolean => false

export const publishSettings = (settings: FlowConfig): void => {
  if (typeof BroadcastChannel === 'undefined') {
    return
  }
  const channel = new BroadcastChannel(SETTINGS_CHANNEL)
  // BroadcastChannel.postMessage has no target origin.
  // oxlint-disable-next-line unicorn/require-post-message-target-origin -- BroadcastChannel
  channel.postMessage(settings)
  channel.close()
}

export const subscribeSettings = (onSettings: (settings: FlowConfig) => void): (() => void) => {
  if (typeof BroadcastChannel === 'undefined') {
    return noop
  }
  const channel = new BroadcastChannel(SETTINGS_CHANNEL)
  channel.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (!isRecord(event.data)) {
      return
    }
    onSettings(sanitizeConfig(event.data))
  })
  return () => {
    channel.close()
  }
}
