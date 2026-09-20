import { sanitizeConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import type { FlowConfig } from '@my-onecomme-plugins/flow-comment-core/settings'
import { click, clickAsync, mount, required, translate } from '@testing/react'
// @vitest-environment happy-dom
// Runs with bun.
import type { ReactElement } from 'react'
import { expect, test } from 'vitest'

import type { SettingsApi } from '../api'
import { useSettings } from './use-settings'

const Probe = ({
  api,
  initial,
}: {
  readonly api: SettingsApi
  readonly initial: FlowConfig
}): ReactElement => {
  const { save, status, update, values } = useSettings(api, initial, translate)
  return (
    <div>
      <span className="lanes">{String(values['lanes'])}</span>
      <span className="color">{String(values['textColor'])}</span>
      <span className="status">{status}</span>
      <button
        className="edit"
        onClick={() => {
          update('lanes', 8)
        }}
        type="button"
      >
        edit
      </button>
      <button
        className="save"
        onClick={() => {
          void save()
        }}
        type="button"
      >
        save
      </button>
    </div>
  )
}

const fakeApi = (save: SettingsApi['saveSettings']): SettingsApi => ({
  deletePreset: () => Promise.resolve(true),
  fetchPresets: () => Promise.resolve([]),
  fetchSettings: () => Promise.resolve(null),
  resetSettings: () => Promise.resolve(null),
  savePreset: () => Promise.resolve(true),
  saveSettings: save,
})

test('keeps edited values after save', async () => {
  expect.hasAssertions()
  const initial = sanitizeConfig({ lanes: 3, textColor: '#ff0000' })
  const api = fakeApi((settings) => Promise.resolve(settings))
  const container = mount(<Probe api={api} initial={initial} />)
  click(required(container.querySelector('.edit'), 'edit'))
  await clickAsync(required(container.querySelector('.save'), 'save'))
  expect(container.querySelector('.lanes')?.textContent).toBe('8')
  expect(container.querySelector('.color')?.textContent).toBe('#ff0000')
  expect(container.querySelector('.status')?.textContent).toBe('saveSuccess')
})

test('does not apply defaults when the plugin returns a partial body', async () => {
  expect.hasAssertions()
  const initial = sanitizeConfig({ lanes: 3, textColor: '#ff0000' })
  const api = fakeApi(() => Promise.resolve(sanitizeConfig({ lanes: 8 })))
  const container = mount(<Probe api={api} initial={initial} />)
  click(required(container.querySelector('.edit'), 'edit'))
  await clickAsync(required(container.querySelector('.save'), 'save'))
  expect(container.querySelector('.lanes')?.textContent).toBe('8')
  expect(container.querySelector('.color')?.textContent).toBe('#ff0000')
})

test('leaves the values alone when save fails', async () => {
  expect.hasAssertions()
  const initial = sanitizeConfig({ lanes: 3, textColor: '#ff0000' })
  const api = fakeApi(() => Promise.resolve(null))
  const container = mount(<Probe api={api} initial={initial} />)
  click(required(container.querySelector('.edit'), 'edit'))
  await clickAsync(required(container.querySelector('.save'), 'save'))
  expect(container.querySelector('.lanes')?.textContent).toBe('8')
  expect(container.querySelector('.color')?.textContent).toBe('#ff0000')
  expect(container.querySelector('.status')?.textContent).toBe('saveFailed')
})
