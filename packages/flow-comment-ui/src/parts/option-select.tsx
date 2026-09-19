// Runs with bun.
// 選択肢を1つ選ぶコントロール。設定項目とプリセットの両方で使う。
import { Select } from '@base-ui/react/select'
import type { ReactElement } from 'react'

interface SelectOption {
  readonly label: string
  readonly value: string
}

export interface OptionSelectProps {
  readonly disabled?: boolean
  readonly label: string
  readonly onSelect: (value: string) => void
  readonly options: readonly SelectOption[]
  readonly value: string
}

export const OptionSelect = ({
  disabled = false,
  label,
  onSelect,
  options,
  value,
}: OptionSelectProps): ReactElement => (
  <Select.Root
    disabled={disabled}
    items={options.map((option) => ({ label: option.label, value: option.value }))}
    onValueChange={(next) => {
      onSelect(String(next))
    }}
    value={value}
  >
    <Select.Trigger aria-label={label} className="fc-select" disabled={disabled}>
      <Select.Value />
      <Select.Icon className="fc-select-icon" />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup className="fc-popup">
          {options.map((option) => (
            <Select.Item className="fc-option" key={option.value} value={option.value}>
              <Select.ItemText>{option.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
)
