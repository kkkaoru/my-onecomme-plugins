// Runs with bun.
// Overlay HUD is opt-in. Production builds stay off unless ?hud=1.
export const HUD_PARAM = 'hud'

export const metricsWanted = (search: string): boolean => new URLSearchParams(search).has(HUD_PARAM)
