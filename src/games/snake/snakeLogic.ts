export type Direction = 'up' | 'down' | 'left' | 'right'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Point {
  x: number
  y: number
}

export interface DifficultyConfig {
  label: string
  grades: string
  detail: string
  size: number
  tickMs: number
  minTickMs: number
  speedUpPerApple: number
  wrap: boolean
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'קל',
    grades: 'כיתות א׳-ב׳',
    detail: 'איטי, בלי קירות',
    size: 12,
    tickMs: 280,
    minTickMs: 280,
    speedUpPerApple: 0,
    wrap: true,
  },
  medium: {
    label: 'בינוני',
    grades: 'כיתות ב׳-ג׳',
    detail: 'מאיץ עם כל תפוח',
    size: 14,
    tickMs: 220,
    minTickMs: 140,
    speedUpPerApple: 4,
    wrap: true,
  },
  hard: {
    label: 'קשה',
    grades: 'כיתות ג׳-ד׳',
    detail: 'מהיר, קירות מסוכנים',
    size: 16,
    tickMs: 160,
    minTickMs: 90,
    speedUpPerApple: 4,
    wrap: false,
  },
}

export const BONUS_EVERY = 5
export const BONUS_POINTS = 3
export const BONUS_TICKS = 30
const MAX_QUEUED_TURNS = 2

const DELTA: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}
const OPPOSITE: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' }

export interface SnakeState {
  size: number
  snake: Point[] // head first
  dir: Direction
  queue: Direction[]
  food: Point
  bonus: { at: Point; ticksLeft: number } | null
  score: number
  apples: number
  over: boolean
  won: boolean
}

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y

function freeCell(size: number, taken: Point[], rng: () => number): Point | null {
  const free: Point[] = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!taken.some((p) => p.x === x && p.y === y)) free.push({ x, y })
    }
  }
  return free.length ? free[Math.floor(rng() * free.length)] : null
}

export function initialState(size: number, rng = Math.random): SnakeState {
  const mid = Math.floor(size / 2)
  const snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ]
  return {
    size,
    snake,
    dir: 'right',
    queue: [],
    food: freeCell(size, snake, rng)!,
    bonus: null,
    score: 0,
    apples: 0,
    over: false,
    won: false,
  }
}

export function tickInterval(state: SnakeState, cfg: DifficultyConfig): number {
  return Math.max(cfg.minTickMs, cfg.tickMs - state.apples * cfg.speedUpPerApple)
}

// Queue a turn. Reversing straight into your own body is ignored.
export function turn(state: SnakeState, dir: Direction): SnakeState {
  const last = state.queue.length ? state.queue[state.queue.length - 1] : state.dir
  if (state.over || dir === last || dir === OPPOSITE[last] || state.queue.length >= MAX_QUEUED_TURNS) {
    return state
  }
  return { ...state, queue: [...state.queue, dir] }
}

export function tick(state: SnakeState, cfg: DifficultyConfig, rng = Math.random): SnakeState {
  if (state.over) return state
  const [nextDir, ...queue] = state.queue.length ? state.queue : [state.dir]
  const head = state.snake[0]
  const d = DELTA[nextDir]
  let nx = head.x + d.x
  let ny = head.y + d.y

  if (cfg.wrap) {
    nx = (nx + state.size) % state.size
    ny = (ny + state.size) % state.size
  } else if (nx < 0 || ny < 0 || nx >= state.size || ny >= state.size) {
    return { ...state, dir: nextDir, queue, over: true }
  }

  const newHead = { x: nx, y: ny }
  const eatsFood = same(newHead, state.food)
  const eatsBonus = state.bonus !== null && same(newHead, state.bonus.at)
  const grows = eatsFood || eatsBonus

  // The tail moves out of the way this tick unless the snake is growing.
  const body = grows ? state.snake : state.snake.slice(0, -1)
  if (body.some((p) => same(p, newHead))) {
    return { ...state, dir: nextDir, queue, over: true }
  }

  const snake = [newHead, ...body]
  let { score, apples, food } = state
  let bonus = state.bonus ? { ...state.bonus, ticksLeft: state.bonus.ticksLeft - 1 } : null

  if (eatsBonus) {
    score += BONUS_POINTS
    bonus = null
  } else if (bonus && bonus.ticksLeft <= 0) {
    bonus = null
  }

  if (eatsFood) {
    score += 1
    apples += 1
    const next = freeCell(state.size, [...snake, ...(bonus ? [bonus.at] : [])], rng)
    if (!next) return { ...state, snake, score, apples, dir: nextDir, queue, bonus, over: true, won: true }
    food = next
    if (apples % BONUS_EVERY === 0 && !bonus) {
      const at = freeCell(state.size, [...snake, food], rng)
      if (at) bonus = { at, ticksLeft: BONUS_TICKS }
    }
  }

  return { ...state, snake, dir: nextDir, queue, food, bonus, score, apples }
}
