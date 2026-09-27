// World units: 100 wide, y grows upwards from the ground. Block n sits at y = n * BLOCK_HEIGHT.
export const WORLD_WIDTH = 100
export const BLOCK_HEIGHT = 8
export const SLIDE_MARGIN = 8
export const PERFECT_POINTS = 2
export const GROW_AFTER_STREAK = 3
export const GROW_BY = 4
const EFFECT_SECONDS = 1

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  label: string
  grades: string
  detail: string
  width: number
  speed: number
  speedUp: number
  maxSpeed: number
  tolerance: number
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'קל',
    grades: 'כיתות א׳-ב׳',
    detail: 'איטי ורחב 🐢',
    width: 70,
    speed: 32,
    speedUp: 0.6,
    maxSpeed: 55,
    tolerance: 4,
  },
  medium: {
    label: 'בינוני',
    grades: 'כיתות ב׳-ג׳',
    detail: 'מאיץ עם הגובה',
    width: 60,
    speed: 42,
    speedUp: 1.2,
    maxSpeed: 80,
    tolerance: 3,
  },
  hard: {
    label: 'קשה',
    grades: 'כיתות ג׳-ד׳',
    detail: 'מהיר וצר 🚀',
    width: 50,
    speed: 55,
    speedUp: 1.6,
    maxSpeed: 105,
    tolerance: 2,
  },
}

export interface Block {
  left: number
  width: number
  hue: number
}

export interface MovingBlock extends Block {
  dir: 1 | -1
}

// A piece that was cut off (or a whole missed block) and is falling away.
export interface Chunk extends Block {
  id: number
  level: number
  side: 'left' | 'right'
  age: number
}

export interface Popup {
  id: number
  level: number
  x: number
  text: string
  age: number
}

export interface StackState {
  placed: Block[]
  moving: MovingBlock
  chunks: Chunk[]
  popups: Popup[]
  score: number
  perfects: number
  streak: number
  nextId: number
  over: boolean
}

export function hueForLevel(level: number) {
  return (200 + level * 13) % 360
}

export function speedForLevel(level: number, cfg: DifficultyConfig) {
  return Math.min(cfg.maxSpeed, cfg.speed + level * cfg.speedUp)
}

export function slideBounds(width: number) {
  return { min: -SLIDE_MARGIN, max: WORLD_WIDTH - width + SLIDE_MARGIN }
}

// Blocks come in from alternating sides.
function newMoving(level: number, width: number): MovingBlock {
  const { min, max } = slideBounds(width)
  const fromLeft = level % 2 === 1
  return { left: fromLeft ? min : max, width, hue: hueForLevel(level), dir: fromLeft ? 1 : -1 }
}

export function initialState(cfg: DifficultyConfig): StackState {
  const base: Block = { left: (WORLD_WIDTH - cfg.width) / 2, width: cfg.width, hue: hueForLevel(0) }
  return {
    placed: [base],
    moving: newMoving(1, cfg.width),
    chunks: [],
    popups: [],
    score: 0,
    perfects: 0,
    streak: 0,
    nextId: 0,
    over: false,
  }
}

export function step(state: StackState, dtRaw: number, cfg: DifficultyConfig): StackState {
  const dt = Math.min(dtRaw, 0.05)
  const chunks = state.chunks.map((c) => ({ ...c, age: c.age + dt })).filter((c) => c.age < EFFECT_SECONDS)
  const popups = state.popups.map((p) => ({ ...p, age: p.age + dt })).filter((p) => p.age < EFFECT_SECONDS)
  if (state.over) return { ...state, chunks, popups }

  const { min, max } = slideBounds(state.moving.width)
  let left = state.moving.left + state.moving.dir * speedForLevel(state.placed.length, cfg) * dt
  let dir = state.moving.dir
  if (left > max) {
    left = max - (left - max)
    dir = -1
  } else if (left < min) {
    left = min + (min - left)
    dir = 1
  }
  return { ...state, moving: { ...state.moving, left, dir }, chunks, popups }
}

export function drop(state: StackState, cfg: DifficultyConfig): StackState {
  if (state.over) return state
  const level = state.placed.length
  const below = state.placed[level - 1]
  const m = state.moving
  let nextId = state.nextId

  const overlapLeft = Math.max(m.left, below.left)
  const overlapRight = Math.min(m.left + m.width, below.left + below.width)

  if (overlapRight - overlapLeft <= 0) {
    const side = m.left < below.left ? 'left' : 'right'
    return {
      ...state,
      chunks: [...state.chunks, { id: nextId++, level, left: m.left, width: m.width, hue: m.hue, side, age: 0 }],
      nextId,
      streak: 0,
      over: true,
    }
  }

  const chunks = [...state.chunks]
  const popups = [...state.popups]
  let block: Block
  let { score, perfects, streak } = state

  if (Math.abs(m.left - below.left) <= cfg.tolerance) {
    // Perfect: snaps onto the block below, and a streak grows the tower back.
    streak++
    perfects++
    score += PERFECT_POINTS
    let width = below.width
    let left = below.left
    if (streak > GROW_AFTER_STREAK && width < cfg.width) {
      width = Math.min(cfg.width, width + GROW_BY)
      left = Math.max(0, Math.min(WORLD_WIDTH - width, below.left - (width - below.width) / 2))
    }
    block = { left, width, hue: m.hue }
    popups.push({ id: nextId++, level, x: left + width / 2, text: `מושלם! +${PERFECT_POINTS}`, age: 0 })
  } else {
    streak = 0
    score += 1
    block = { left: overlapLeft, width: overlapRight - overlapLeft, hue: m.hue }
    const cutLeft = m.left < overlapLeft
    chunks.push({
      id: nextId++,
      level,
      left: cutLeft ? m.left : overlapRight,
      width: m.width - block.width,
      hue: m.hue,
      side: cutLeft ? 'left' : 'right',
      age: 0,
    })
  }

  return {
    placed: [...state.placed, block],
    moving: newMoving(level + 1, block.width),
    chunks,
    popups,
    score,
    perfects,
    streak,
    nextId,
    over: false,
  }
}
