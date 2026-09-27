// World units: 100 wide, WORLD_HEIGHT tall, y grows upwards from the bottom edge.
export const WORLD_WIDTH = 100
export const WORLD_HEIGHT = 133
export const ROUND_SECONDS = 60
export const START_LIVES = 3
export const OBJECT_RADIUS = 7

const FRUITS = ['🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🍑', '🍍', '🥝', '🥭', '🍐', '🍌']
const POPUP_SECONDS = 0.7

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  label: string
  grades: string
  detail: string
  gravity: number
  waveEvery: number
  maxWave: number
  bombChance: number
  bombsAfter: number
  missCostsLife: boolean
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'קל',
    grades: 'כיתות א׳-ב׳',
    detail: 'רגוע 🙂',
    gravity: 85,
    waveEvery: 1.6,
    maxWave: 2,
    bombChance: 0.08,
    bombsAfter: 15,
    missCostsLife: false,
  },
  medium: {
    label: 'בינוני',
    grades: 'כיתות ב׳-ג׳',
    detail: 'אל תפספסו! 🍉',
    gravity: 105,
    waveEvery: 1.3,
    maxWave: 3,
    bombChance: 0.14,
    bombsAfter: 8,
    missCostsLife: true,
  },
  hard: {
    label: 'קשה',
    grades: 'כיתות ג׳-ד׳',
    detail: 'מהיר ומסוכן 💣',
    gravity: 125,
    waveEvery: 1.0,
    maxWave: 4,
    bombChance: 0.2,
    bombsAfter: 4,
    missCostsLife: true,
  },
}

export interface Flying {
  id: number
  kind: 'fruit' | 'bomb'
  emoji: string
  x: number
  y: number
  vx: number
  vy: number
}

export interface Piece {
  id: number
  emoji: string
  side: 'left' | 'right'
  x: number
  y: number
  vx: number
  vy: number
  spin: number
}

export interface Popup {
  id: number
  x: number
  y: number
  text: string
  until: number
}

export interface FruitState {
  objects: Flying[]
  pieces: Piece[]
  popups: Popup[]
  score: number
  sliced: number
  lives: number
  elapsed: number
  nextWaveIn: number
  strokeHits: number
  nextId: number
  over: boolean
}

export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
}

export function initialState(): FruitState {
  return {
    objects: [],
    pieces: [],
    popups: [],
    score: 0,
    sliced: 0,
    lives: START_LIVES,
    elapsed: 0,
    nextWaveIn: 0.6,
    strokeHits: 0,
    nextId: 1,
    over: false,
  }
}

export const timeLeft = (s: FruitState) => Math.max(0, Math.ceil(ROUND_SECONDS - s.elapsed))

function launch(id: number, cfg: DifficultyConfig, elapsed: number, rng: () => number): Flying {
  const x = 15 + rng() * 70
  const apex = 70 + rng() * 40
  const isBomb = elapsed >= cfg.bombsAfter && rng() < cfg.bombChance
  return {
    id,
    kind: isBomb ? 'bomb' : 'fruit',
    emoji: isBomb ? '💣' : FRUITS[Math.floor(rng() * FRUITS.length)],
    x,
    y: -OBJECT_RADIUS,
    // Drift toward the middle so nothing flies off the side.
    vx: (50 - x) * (0.25 + rng() * 0.3),
    vy: Math.sqrt(2 * cfg.gravity * apex),
  }
}

function waveSize(cfg: DifficultyConfig, elapsed: number, rng: () => number): number {
  const cap = Math.min(cfg.maxWave, 1 + Math.floor(elapsed / 12))
  return 1 + Math.floor(rng() * cap)
}

export function step(state: FruitState, dt: number, cfg: DifficultyConfig, rng = Math.random): FruitState {
  if (state.over) return state
  dt = Math.min(dt, 0.05)
  const elapsed = state.elapsed + dt
  let { lives, nextWaveIn, nextId } = state

  const objects: Flying[] = []
  for (const o of state.objects) {
    const moved = { ...o, x: o.x + o.vx * dt, y: o.y + o.vy * dt, vy: o.vy - cfg.gravity * dt }
    const fellOut = moved.vy < 0 && moved.y < -OBJECT_RADIUS * 2
    if (!fellOut) objects.push(moved)
    else if (o.kind === 'fruit' && cfg.missCostsLife) lives -= 1
  }

  nextWaveIn -= dt
  if (nextWaveIn <= 0 && elapsed < ROUND_SECONDS) {
    const count = waveSize(cfg, elapsed, rng)
    for (let i = 0; i < count; i++) objects.push(launch(nextId++, cfg, elapsed, rng))
    nextWaveIn = cfg.waveEvery * (0.8 + rng() * 0.4)
  }

  const pieces = state.pieces
    .map((p) => ({ ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt, vy: p.vy - cfg.gravity * 1.3 * dt, spin: p.spin + (p.side === 'left' ? -300 : 300) * dt }))
    .filter((p) => p.y > -OBJECT_RADIUS * 3)

  const popups = state.popups.filter((p) => p.until > elapsed)
  const over = lives <= 0 || elapsed >= ROUND_SECONDS

  return { ...state, objects, pieces, popups, lives: Math.max(0, lives), elapsed, nextWaveIn, nextId, over }
}

function distanceToSegment(px: number, py: number, s: Segment): number {
  const dx = s.x2 - s.x1
  const dy = s.y2 - s.y1
  const lenSq = dx * dx + dy * dy
  const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - s.x1) * dx + (py - s.y1) * dy) / lenSq))
  return Math.hypot(px - (s.x1 + t * dx), py - (s.y1 + t * dy))
}

// Everything the finger passes over is cut. A tap is a zero-length segment,
// so the youngest players can also just tap fruit.
export function slice(state: FruitState, seg: Segment): FruitState {
  if (state.over) return state
  const hit = state.objects.filter((o) => distanceToSegment(o.x, o.y, seg) <= OBJECT_RADIUS)
  if (hit.length === 0) return state

  let { score, sliced, lives, strokeHits, nextId } = state
  const pieces = [...state.pieces]
  const popups = [...state.popups]
  const until = state.elapsed + POPUP_SECONDS

  for (const o of hit) {
    if (o.kind === 'bomb') {
      lives -= 1
      popups.push({ id: nextId++, x: o.x, y: o.y, text: '💥', until })
      continue
    }
    strokeHits += 1
    sliced += 1
    // The third fruit in one swipe and beyond is worth double.
    const points = strokeHits >= 3 ? 2 : 1
    score += points
    popups.push({ id: nextId++, x: o.x, y: o.y, text: points === 2 ? '+2 🔥' : '+1', until })
    for (const side of ['left', 'right'] as const) {
      pieces.push({
        id: nextId++,
        emoji: o.emoji,
        side,
        x: o.x,
        y: o.y,
        vx: o.vx + (side === 'left' ? -18 : 18),
        vy: Math.max(o.vy, 10),
        spin: 0,
      })
    }
  }

  const hitIds = new Set(hit.map((o) => o.id))
  return {
    ...state,
    objects: state.objects.filter((o) => !hitIds.has(o.id)),
    pieces,
    popups,
    score,
    sliced,
    lives: Math.max(0, lives),
    strokeHits,
    nextId,
    over: lives <= 0,
  }
}

export function endStroke(state: FruitState): FruitState {
  return state.strokeHits === 0 ? state : { ...state, strokeHits: 0 }
}
