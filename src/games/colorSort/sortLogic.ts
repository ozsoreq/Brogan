export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  label: string
  grades: string
  detail: string
  /** Balls per tube. */
  capacity: number
  /** Number of colours in each of the stages, in order. */
  colors: number[]
  /** Empty tubes to move balls around with. */
  empty: number
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { label: 'קל', grades: 'כיתות א׳-ב׳', detail: '2-4 צבעים', capacity: 3, colors: [2, 3, 3, 4, 4], empty: 2 },
  medium: { label: 'בינוני', grades: 'כיתות ב׳-ג׳', detail: '3-6 צבעים', capacity: 4, colors: [3, 4, 5, 5, 6], empty: 2 },
  hard: { label: 'קשה', grades: 'כיתות ג׳-ד׳', detail: '5-8 צבעים', capacity: 4, colors: [5, 6, 7, 7, 8], empty: 2 },
}

/** The most colours any stage uses (the board has a colour and a shape for each). */
export const MAX_COLORS = 8

/**
 * A ball keeps its own id so the board can animate it from tube to tube; its
 * colour is `id >> 4`.
 */
export type Ball = number
/** Each tube lists its balls bottom to top. */
export type Tubes = Ball[][]
export interface Move {
  from: number
  to: number
}

type Rng = () => number

export const colorOf = (ball: Ball) => ball >> 4
const top = (tube: Ball[]) => tube[tube.length - 1]

export function isTubeDone(tube: Ball[], capacity: number) {
  return tube.length === capacity && tube.every((b) => colorOf(b) === colorOf(tube[0]))
}

export function isSolved(tubes: Tubes, capacity: number) {
  return tubes.every((t) => t.length === 0 || isTubeDone(t, capacity))
}

export function canMove(tubes: Tubes, { from, to }: Move, capacity: number) {
  const src = tubes[from]
  const dst = tubes[to]
  if (!src || !dst || from === to || src.length === 0 || dst.length >= capacity) return false
  return dst.length === 0 || colorOf(top(dst)) === colorOf(top(src))
}

/** Moves the top ball of one tube onto another (the caller checks `canMove`). */
export function applyMove(tubes: Tubes, { from, to }: Move): Tubes {
  const next = tubes.slice()
  next[from] = tubes[from].slice(0, -1)
  next[to] = [...tubes[to], top(tubes[from])]
  return next
}

/** Positions that differ only in tube order or ball ids are the same puzzle. */
function stateKey(tubes: Tubes) {
  return tubes
    .map((t) => t.map(colorOf).join(','))
    .sort()
    .join('|')
}

/**
 * Finds a way to sort the tubes (not necessarily the shortest), or null if
 * there is none within `budget` explored positions.
 */
export function solve(tubes: Tubes, capacity: number, budget = 60000): Move[] | null {
  const seen = new Set<string>()
  const path: Move[] = []

  const candidates = (t: Tubes): Move[] => {
    const onto: Move[] = []
    const intoEmpty: Move[] = []
    for (let from = 0; from < t.length; from++) {
      const src = t[from]
      if (src.length === 0 || isTubeDone(src, capacity)) continue
      const uniform = src.every((b) => colorOf(b) === colorOf(src[0]))
      let triedEmpty = false
      for (let to = 0; to < t.length; to++) {
        if (!canMove(t, { from, to }, capacity)) continue
        if (t[to].length === 0) {
          // Moving a one-colour tube into an empty one changes nothing, and all empty tubes are alike.
          if (uniform || triedEmpty) continue
          triedEmpty = true
          intoEmpty.push({ from, to })
        } else {
          onto.push({ from, to })
        }
      }
    }
    return [...onto, ...intoEmpty]
  }

  const dfs = (t: Tubes): boolean => {
    if (isSolved(t, capacity)) return true
    const key = stateKey(t)
    if (seen.has(key) || seen.size >= budget) return false
    seen.add(key)
    for (const m of candidates(t)) {
      path.push(m)
      if (dfs(applyMove(t, m))) return true
      path.pop()
    }
    return false
  }

  return dfs(tubes) ? path.slice() : null
}

export function makeLevel(cfg: DifficultyConfig, stage: number, rng: Rng = Math.random): Tubes {
  const colors = cfg.colors[Math.min(stage, cfg.colors.length - 1)]
  for (;;) {
    const balls: Ball[] = []
    for (let c = 0; c < colors; c++) for (let k = 0; k < cfg.capacity; k++) balls.push((c << 4) | k)
    for (let i = balls.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[balls[i], balls[j]] = [balls[j], balls[i]]
    }
    const tubes: Tubes = []
    for (let c = 0; c < colors; c++) tubes.push(balls.slice(c * cfg.capacity, (c + 1) * cfg.capacity))
    for (let e = 0; e < cfg.empty; e++) tubes.push([])
    // A tube that starts already sorted is too easy a start.
    const tooEasy = tubes.some((t) => t.length > 0 && t.every((b) => colorOf(b) === colorOf(t[0])))
    if (!tooEasy && solve(tubes, cfg.capacity)) return tubes
  }
}
