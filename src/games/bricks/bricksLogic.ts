// World units: 100 wide, WORLD_HEIGHT tall, y grows downwards from the top edge.
export const WORLD_WIDTH = 100
export const WORLD_HEIGHT = 140

export const COLS = 8
export const BRICK_TOP = 12
export const BRICK_HEIGHT = 5
export const BRICK_GAP = 1.2
const SIDE_MARGIN = 3
export const BRICK_WIDTH = (WORLD_WIDTH - 2 * SIDE_MARGIN - (COLS - 1) * BRICK_GAP) / COLS
const MAX_ROWS = 8

export const PADDLE_Y = 128
export const PADDLE_HEIGHT = 3
export const BALL_RADIUS = 2.2
export const STAR_RADIUS = 3
export const STAR_POINTS = 3
export const STAGE_BONUS = 10
const STAR_CHANCE = 0.15
const STAR_FALL_SPEED = 32
const MAX_BOUNCE_ANGLE = Math.PI / 3
const LAUNCH_ANGLE = 0.35
const POPUP_SECONDS = 0.7
const MAX_DT = 0.05
const MAX_SUBSTEP = 1
// With only a few bricks left, an upward ball curves gently toward the nearest
// one, so the last bricks don't turn into a long, frustrating hunt.
export const ENDGAME_BRICKS = 3
const HOMING_RAD_PER_SEC = 0.6

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  label: string
  grades: string
  detail: string
  lives: number
  paddleWidth: number
  speed: number
  speedPerStage: number
  maxSpeed: number
  rows: number
  strongRows: number
  strongFromStage: number
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'קל',
    grades: 'כיתות א׳-ב׳',
    detail: 'מחבט רחב, 5 לבבות',
    lives: 5,
    paddleWidth: 30,
    speed: 55,
    speedPerStage: 4,
    maxSpeed: 75,
    rows: 3,
    strongRows: 0,
    strongFromStage: Infinity,
  },
  medium: {
    label: 'בינוני',
    grades: 'כיתות ב׳-ג׳',
    detail: 'יותר לבנים 🧱',
    lives: 3,
    paddleWidth: 24,
    speed: 66,
    speedPerStage: 6,
    maxSpeed: 95,
    rows: 4,
    strongRows: 1,
    strongFromStage: 2,
  },
  hard: {
    label: 'קשה',
    grades: 'כיתות ג׳-ד׳',
    detail: 'מהיר, לבני ברזל',
    lives: 3,
    paddleWidth: 19,
    speed: 78,
    speedPerStage: 7,
    maxSpeed: 110,
    rows: 5,
    strongRows: 2,
    strongFromStage: 1,
  },
}

export interface Brick {
  id: number
  row: number
  col: number
  hits: number
  strong: boolean
  star: boolean
}

export interface Ball {
  x: number
  y: number
  vx: number
  vy: number
}

export interface FallingStar {
  id: number
  x: number
  y: number
}

export interface Popup {
  id: number
  x: number
  y: number
  text: string
  age: number
}

export interface BricksState {
  paddleX: number
  ball: Ball
  stuck: boolean
  bricks: Brick[]
  stars: FallingStar[]
  popups: Popup[]
  score: number
  lives: number
  stage: number
  broken: number
  nextId: number
  over: boolean
}

type Rng = () => number

// Each stage cycles through a few shapes so the wall looks different every time.
const PATTERNS: ((row: number, col: number, rows: number) => boolean)[] = [
  () => true,
  (row, col, rows) => Math.abs(col - (COLS - 1) / 2) <= 0.5 + (row * (COLS / 2 - 1)) / Math.max(1, rows - 1),
  (row, col) => (row + col) % 2 === 0,
  (_row, col) => col % 3 !== 2,
]

export function brickRect(b: Pick<Brick, 'row' | 'col'>) {
  return {
    x: SIDE_MARGIN + b.col * (BRICK_WIDTH + BRICK_GAP),
    y: BRICK_TOP + b.row * (BRICK_HEIGHT + BRICK_GAP),
    w: BRICK_WIDTH,
    h: BRICK_HEIGHT,
  }
}

export function rowsForStage(stage: number, cfg: DifficultyConfig) {
  return Math.min(MAX_ROWS, cfg.rows + Math.floor((stage - 1) / 2))
}

export function ballSpeed(stage: number, cfg: DifficultyConfig) {
  return Math.min(cfg.maxSpeed, cfg.speed + (stage - 1) * cfg.speedPerStage)
}

export function buildStage(stage: number, cfg: DifficultyConfig, firstId: number, rng: Rng): Brick[] {
  const rows = rowsForStage(stage, cfg)
  const pattern = PATTERNS[(stage - 1) % PATTERNS.length]
  const strongRows = stage >= cfg.strongFromStage ? cfg.strongRows : 0
  const bricks: Brick[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!pattern(row, col, rows)) continue
      const strong = row < strongRows
      bricks.push({ id: firstId + bricks.length, row, col, strong, hits: strong ? 2 : 1, star: rng() < STAR_CHANCE })
    }
  }
  return bricks
}

function restingBall(paddleX: number): Ball {
  return { x: paddleX, y: PADDLE_Y - BALL_RADIUS, vx: 0, vy: 0 }
}

export function initialState(cfg: DifficultyConfig, rng: Rng = Math.random): BricksState {
  const bricks = buildStage(1, cfg, 0, rng)
  const paddleX = WORLD_WIDTH / 2
  return {
    paddleX,
    ball: restingBall(paddleX),
    stuck: true,
    bricks,
    stars: [],
    popups: [],
    score: 0,
    lives: cfg.lives,
    stage: 1,
    broken: 0,
    nextId: bricks.length,
    over: false,
  }
}

export function movePaddle(state: BricksState, x: number, cfg: DifficultyConfig): BricksState {
  const half = cfg.paddleWidth / 2
  const paddleX = Math.min(WORLD_WIDTH - half, Math.max(half, x))
  if (paddleX === state.paddleX) return state
  return { ...state, paddleX, ball: state.stuck ? restingBall(paddleX) : state.ball }
}

// Sends a resting ball up, angled away from the nearer wall.
export function launch(state: BricksState, cfg: DifficultyConfig): BricksState {
  if (!state.stuck || state.over) return state
  const speed = ballSpeed(state.stage, cfg)
  const angle = state.paddleX < WORLD_WIDTH / 2 ? LAUNCH_ANGLE : -LAUNCH_ANGLE
  return {
    ...state,
    stuck: false,
    ball: { ...state.ball, vx: speed * Math.sin(angle), vy: -speed * Math.cos(angle) },
  }
}

function overlapsPaddle(x: number, y: number, r: number, paddleX: number, cfg: DifficultyConfig) {
  return (
    y + r >= PADDLE_Y &&
    y - r <= PADDLE_Y + PADDLE_HEIGHT &&
    x + r >= paddleX - cfg.paddleWidth / 2 &&
    x - r <= paddleX + cfg.paddleWidth / 2
  )
}

function nearestBrickCenter(bricks: Brick[], x: number, y: number) {
  let best = { x: 0, y: 0 }
  let bestDist = Infinity
  for (const b of bricks) {
    const r = brickRect(b)
    const c = { x: r.x + r.w / 2, y: r.y + r.h / 2 }
    const d = (c.x - x) ** 2 + (c.y - y) ** 2
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }
  return best
}

/** Rotates the velocity toward `target` by at most `maxTurn` radians, keeping its speed. */
function steerToward(x: number, y: number, vx: number, vy: number, target: { x: number; y: number }, maxTurn: number) {
  const current = Math.atan2(vy, vx)
  let diff = Math.atan2(target.y - y, target.x - x) - current
  diff = Math.atan2(Math.sin(diff), Math.cos(diff))
  const angle = current + Math.max(-maxTurn, Math.min(maxTurn, diff))
  const speed = Math.hypot(vx, vy)
  return [speed * Math.cos(angle), speed * Math.sin(angle)] as const
}

export function step(state: BricksState, dtRaw: number, cfg: DifficultyConfig, rng: Rng = Math.random): BricksState {
  if (state.over) return state
  const dt = Math.min(dtRaw, MAX_DT)
  let { score, nextId, broken } = state
  const popups = state.popups.map((p) => ({ ...p, age: p.age + dt })).filter((p) => p.age < POPUP_SECONDS)

  const stars: FallingStar[] = []
  for (const s of state.stars) {
    const y = s.y + STAR_FALL_SPEED * dt
    if (overlapsPaddle(s.x, y, STAR_RADIUS, state.paddleX, cfg)) {
      score += STAR_POINTS
      popups.push({ id: nextId++, x: s.x, y: PADDLE_Y - 6, text: `+${STAR_POINTS}`, age: 0 })
    } else if (y - STAR_RADIUS < WORLD_HEIGHT) {
      stars.push({ ...s, y })
    }
  }

  if (state.stuck) return { ...state, score, nextId, popups, stars }

  let bricks = state.bricks
  let { x, y, vx, vy } = state.ball
  const speed = Math.hypot(vx, vy)
  const substeps = Math.max(1, Math.ceil((speed * dt) / MAX_SUBSTEP))
  const h = dt / substeps

  for (let i = 0; i < substeps; i++) {
    if (bricks.length <= ENDGAME_BRICKS && vy < 0) {
      ;[vx, vy] = steerToward(x, y, vx, vy, nearestBrickCenter(bricks, x, y), HOMING_RAD_PER_SEC * h)
    }
    x += vx * h
    y += vy * h

    if (x < BALL_RADIUS) {
      x = BALL_RADIUS
      vx = Math.abs(vx)
    } else if (x > WORLD_WIDTH - BALL_RADIUS) {
      x = WORLD_WIDTH - BALL_RADIUS
      vx = -Math.abs(vx)
    }
    if (y < BALL_RADIUS) {
      y = BALL_RADIUS
      vy = Math.abs(vy)
    }

    // The bounce angle depends on where the ball lands on the paddle, so kids can aim.
    if (vy > 0 && overlapsPaddle(x, y, BALL_RADIUS, state.paddleX, cfg) && y < PADDLE_Y + PADDLE_HEIGHT / 2) {
      const offset = Math.max(-1, Math.min(1, (x - state.paddleX) / (cfg.paddleWidth / 2)))
      const angle = offset * MAX_BOUNCE_ANGLE
      const s = ballSpeed(state.stage, cfg)
      vx = s * Math.sin(angle)
      vy = -s * Math.cos(angle)
      y = PADDLE_Y - BALL_RADIUS
    }

    for (const b of bricks) {
      const r = brickRect(b)
      const cx = Math.max(r.x, Math.min(x, r.x + r.w))
      const cy = Math.max(r.y, Math.min(y, r.y + r.h))
      if ((x - cx) ** 2 + (y - cy) ** 2 >= BALL_RADIUS ** 2) continue

      const overlapX = Math.min(x + BALL_RADIUS - r.x, r.x + r.w - (x - BALL_RADIUS))
      const overlapY = Math.min(y + BALL_RADIUS - r.y, r.y + r.h - (y - BALL_RADIUS))
      if (overlapX < overlapY) vx = x < r.x + r.w / 2 ? -Math.abs(vx) : Math.abs(vx)
      else vy = y < r.y + r.h / 2 ? -Math.abs(vy) : Math.abs(vy)

      if (b.hits > 1) {
        bricks = bricks.map((o) => (o.id === b.id ? { ...o, hits: o.hits - 1 } : o))
      } else {
        bricks = bricks.filter((o) => o.id !== b.id)
        broken++
        score += b.strong ? 2 : 1
        if (b.star) stars.push({ id: nextId++, x: r.x + r.w / 2, y: r.y + r.h / 2 })
      }
      break
    }
  }

  let next: BricksState = { ...state, ball: { x, y, vx, vy }, bricks, stars, popups, score, nextId, broken }

  if (bricks.length === 0) {
    const stage = state.stage + 1
    const fresh = buildStage(stage, cfg, next.nextId, rng)
    popups.push({ id: next.nextId + fresh.length, x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2, text: `+${STAGE_BONUS} 🎉`, age: 0 })
    next = {
      ...next,
      stage,
      bricks: fresh,
      stars: [],
      nextId: next.nextId + fresh.length + 1,
      score: score + STAGE_BONUS,
      stuck: true,
      ball: restingBall(state.paddleX),
    }
  } else if (y - BALL_RADIUS > WORLD_HEIGHT) {
    const lives = state.lives - 1
    next = { ...next, lives, over: lives === 0, stuck: true, ball: restingBall(state.paddleX) }
  }

  return next
}
