export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  label: string
  grades: string
  upTimeMs: number
  spawnEveryMs: number
  maxActive: number
  bombChance: number
  starScores: [two: number, three: number]
}

export const ROUND_SECONDS = 30
export const HOLE_COUNT = 9
export const BOMB_PENALTY = 2
const HIT_FLASH_MS = 350

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'קל',
    grades: 'כיתות א׳-ב׳',
    upTimeMs: 1500,
    spawnEveryMs: 1000,
    maxActive: 1,
    bombChance: 0,
    starScores: [12, 20],
  },
  medium: {
    label: 'בינוני',
    grades: 'כיתות ב׳-ג׳',
    upTimeMs: 1150,
    spawnEveryMs: 800,
    maxActive: 2,
    bombChance: 0.15,
    starScores: [14, 24],
  },
  hard: {
    label: 'קשה',
    grades: 'כיתות ג׳-ד׳',
    upTimeMs: 850,
    spawnEveryMs: 600,
    maxActive: 3,
    bombChance: 0.25,
    starScores: [16, 28],
  },
}

export type HoleKind = 'mole' | 'bomb' | 'hit' | 'boom'

export interface Hole {
  id: number
  kind: HoleKind
  until: number
}

export interface WhackState {
  holes: (Hole | null)[]
  score: number
  hits: number
  bombsHit: number
  nextSpawnAt: number
  nextId: number
}

export function initialState(now: number): WhackState {
  return {
    holes: Array.from({ length: HOLE_COUNT }, () => null),
    score: 0,
    hits: 0,
    bombsHit: 0,
    nextSpawnAt: now + 400,
    nextId: 1,
  }
}

const isTarget = (h: Hole | null) => h !== null && (h.kind === 'mole' || h.kind === 'bomb')

// Advance time: hide expired holes and pop up a new hamster/bomb when due.
export function tick(state: WhackState, now: number, cfg: DifficultyConfig, rng = Math.random): WhackState {
  let changed = false
  let holes = state.holes.map((h) => {
    if (h && h.until <= now) {
      changed = true
      return null
    }
    return h
  })
  let { nextSpawnAt, nextId } = state

  if (now >= nextSpawnAt) {
    const empty = holes.flatMap((h, i) => (h === null ? [i] : []))
    const active = holes.filter(isTarget).length
    if (empty.length > 0 && active < cfg.maxActive) {
      const index = empty[Math.floor(rng() * empty.length)]
      const kind: HoleKind = rng() < cfg.bombChance ? 'bomb' : 'mole'
      holes = holes.map((h, i) => (i === index ? { id: nextId, kind, until: now + cfg.upTimeMs } : h))
      nextId += 1
      changed = true
    }
    nextSpawnAt = now + cfg.spawnEveryMs
  }

  if (!changed && nextSpawnAt === state.nextSpawnAt) return state
  return { ...state, holes, nextSpawnAt, nextId }
}

export function whack(state: WhackState, index: number, now: number): WhackState {
  const hole = state.holes[index]
  if (!hole || hole.until <= now) return state

  if (hole.kind === 'mole') {
    return {
      ...state,
      score: state.score + 1,
      hits: state.hits + 1,
      holes: state.holes.map((h, i) => (i === index ? { id: hole.id, kind: 'hit', until: now + HIT_FLASH_MS } : h)),
    }
  }
  if (hole.kind === 'bomb') {
    return {
      ...state,
      score: Math.max(0, state.score - BOMB_PENALTY),
      bombsHit: state.bombsHit + 1,
      holes: state.holes.map((h, i) => (i === index ? { id: hole.id, kind: 'boom', until: now + HIT_FLASH_MS } : h)),
    }
  }
  return state
}

export function starsFor(score: number, cfg: DifficultyConfig): 1 | 2 | 3 {
  const [two, three] = cfg.starScores
  if (score >= three) return 3
  if (score >= two) return 2
  return 1
}
