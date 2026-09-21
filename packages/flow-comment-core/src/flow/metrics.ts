// Runs with bun.
// OBS: subpixel blur, short jank, and stalls (~100ms freezes).
const JANK_MS = 20
const STALL_MS = 50
const WINDOW_MS = 1000
const SUBPIXEL = 0.01
const MATRIX_MIN_PARTS = 5
const MATRIX_TX_INDEX = 4
const MS_PER_S = 1000
const UNSET = -1

export interface FlowTick {
  readonly fps: number
  readonly frameMs: number
  readonly items: number
  readonly jank: number
  readonly stall: number
  readonly subpixel: number
}

interface MetricsLoop {
  readonly hostsOf: () => readonly HTMLElement[]
  readonly isAlive: () => boolean
  readonly onTick: (now: number) => void
  readonly root: HTMLElement
}

interface Sampler {
  fps: number
  frameMs: number
  frames: number
  jank: number
  last: number
  stall: number
  windowStart: number
}

const txOf = (transform: string): number => {
  const translate = /translate(?:3d)?\((?<tx>-?[\d.]+)/u.exec(transform)
  if (translate !== null) {
    return Number.parseFloat(translate.groups?.['tx'] ?? '0')
  }
  const matrix = transform.split(',')
  return matrix.length < MATRIX_MIN_PARTS ? 0 : Number.parseFloat(matrix[MATRIX_TX_INDEX] ?? '0')
}

export const countSubpixel = (hosts: readonly HTMLElement[]): number =>
  hosts.filter((host) => {
    const tx = txOf(host.style.transform)
    return Math.abs(tx - Math.round(tx)) > SUBPIXEL
  }).length

export const createSampler = (): {
  readonly frame: (now: number) => void
  readonly read: () => Omit<FlowTick, 'items' | 'subpixel'>
} => {
  const tick: Sampler = {
    fps: 0,
    frameMs: 0,
    frames: 0,
    jank: 0,
    last: UNSET,
    stall: 0,
    windowStart: UNSET,
  }
  return {
    frame: (now: number): void => {
      const frameMs = tick.last < 0 ? 0 : now - tick.last
      const rolled = tick.windowStart < 0 || now - tick.windowStart >= WINDOW_MS
      tick.frameMs = frameMs
      tick.frames = rolled ? 1 : tick.frames + 1
      tick.jank = rolled ? 0 : tick.jank
      tick.jank = frameMs > JANK_MS ? tick.jank + 1 : tick.jank
      tick.stall = rolled ? 0 : tick.stall
      tick.stall = frameMs >= STALL_MS ? tick.stall + 1 : tick.stall
      tick.windowStart = rolled ? now : tick.windowStart
      tick.last = now
      const elapsed = now - tick.windowStart
      tick.fps = elapsed === 0 ? tick.fps : Math.round((tick.frames * MS_PER_S) / elapsed)
    },
    read: () => ({
      fps: tick.fps,
      frameMs: Math.round(tick.frameMs),
      jank: tick.jank,
      stall: tick.stall,
    }),
  }
}

const lineOf = (tick: FlowTick): string => {
  const instant = tick.frameMs === 0 ? 0 : Math.round(MS_PER_S / tick.frameMs)
  return `1f=${String(tick.frameMs)}ms=${String(instant)}fps  avg ${String(tick.fps)}  stall ${String(tick.stall)}  jank ${String(tick.jank)}  subpx ${String(tick.subpixel)}/${String(tick.items)}`
}

export const startMetricsLoop = ({ hostsOf, isAlive, onTick, root }: MetricsLoop): void => {
  const hud = document.createElement('div')
  hud.className = 'fc-metrics'
  root.append(hud)
  const sampler = createSampler()
  const loop = (now: number): void => {
    if (!isAlive()) {
      return
    }
    onTick(now)
    const hosts = hostsOf()
    sampler.frame(now)
    const tick = sampler.read()
    hud.textContent = lineOf({
      ...tick,
      items: hosts.length,
      subpixel: countSubpixel(hosts),
    })
    globalThis.requestAnimationFrame(loop)
  }
  globalThis.requestAnimationFrame(loop)
}
