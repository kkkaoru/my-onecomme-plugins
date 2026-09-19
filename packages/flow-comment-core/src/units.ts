// Runs with bun.
// CSS length helpers. Keeping the unit here stops 'px' from being spelled out
// across the code, so the unit is changed in one place if it ever needs to be.

const PX = 'px'

export const px = (value: number): string => `${value}${PX}`

export { PX }
