// World is measured in abstract units: 100 wide, WORLD_HEIGHT tall, y=0 is the ground.
export const WORLD_WIDTH = 100
export const WORLD_HEIGHT = 56
export const PLAYER_X = 12
export const PLAYER_SIZE = 11

const GRAVITY = 260 // units/s²
const JUMP_VELOCITY = 110 // units/s -> ~23 units high, ~0.85s in the air
const START_SPEED = 36 // units/s
const MAX_SPEED = 72
const ACCELERATION = 1.1 // speed gained per second
const OBSTACLE_SIZE = 8
const STAR_SIZE = 7
export const STAR_BONUS = 5

export type ObstacleKind = 'cactus' | 'rock'

export interface Obstacle {
  id: number
  x: number
  kind: ObstacleKind
}

export interface Star {
  id: number
  x: number
  y: number
}

export interface RunnerState {
  playerY: number
  playerVy: number
  obstacles: Obstacle[]
  stars: Star[]
  speed: number
  distance: number
  starsCollected: number
  nextObstacleIn: number
  nextStarIn: number
  nextId: number
  over: boolean
}

export function initialState(): RunnerState {
  return {
    playerY: 0,
    playerVy: 0,
    obstacles: [],
    stars: [],
    speed: START_SPEED,
    distance: 0,
    starsCollected: 0,
    nextObstacleIn: 45,
    nextStarIn: 70,
    nextId: 1,
    over: false,
  }
}

export function score(state: RunnerState): number {
  return Math.floor(state.distance / 10) + state.starsCollected * STAR_BONUS
}

export const isGrounded = (state: RunnerState) => state.playerY <= 0 && state.playerVy <= 0

// Gap between obstacles, in units: always at least one full jump's width of
// clear ground so two obstacles can never force an impossible double jump.
function obstacleGap(speed: number, rng: () => number): number {
  const airDistance = ((2 * JUMP_VELOCITY) / GRAVITY) * speed
  return airDistance * 1.35 + rng() * speed * 1.4
}

interface Box {
  left: number
  right: number
  bottom: number
  top: number
}

const overlaps = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom

// Hitboxes are smaller than the drawn emoji so near misses feel fair.
function playerBox(y: number): Box {
  return { left: PLAYER_X + 3, right: PLAYER_X + PLAYER_SIZE - 3, bottom: y + 1, top: y + PLAYER_SIZE - 2 }
}

function obstacleBox(o: Obstacle): Box {
  const height = o.kind === 'rock' ? OBSTACLE_SIZE * 0.7 : OBSTACLE_SIZE
  return { left: o.x + 2, right: o.x + OBSTACLE_SIZE - 2, bottom: 0, top: height - 1 }
}

function starBox(s: Star): Box {
  return { left: s.x, right: s.x + STAR_SIZE, bottom: s.y, top: s.y + STAR_SIZE }
}

export function step(state: RunnerState, dtSeconds: number, jump: boolean, rng = Math.random): RunnerState {
  if (state.over) return state
  const dt = Math.min(dtSeconds, 0.05)

  let { playerY, playerVy, nextObstacleIn, nextStarIn, nextId, starsCollected } = state
  if (jump && isGrounded(state)) playerVy = JUMP_VELOCITY

  playerVy -= GRAVITY * dt
  playerY += playerVy * dt
  if (playerY <= 0) {
    playerY = 0
    playerVy = 0
  }

  const move = state.speed * dt
  const obstacles = state.obstacles.map((o) => ({ ...o, x: o.x - move })).filter((o) => o.x > -OBSTACLE_SIZE)
  let stars = state.stars.map((s) => ({ ...s, x: s.x - move })).filter((s) => s.x > -STAR_SIZE)

  nextObstacleIn -= move
  if (nextObstacleIn <= 0) {
    obstacles.push({ id: nextId++, x: WORLD_WIDTH + 2, kind: rng() < 0.35 ? 'rock' : 'cactus' })
    nextObstacleIn = obstacleGap(state.speed, rng)
  }

  nextStarIn -= move
  if (nextStarIn <= 0) {
    stars.push({ id: nextId++, x: WORLD_WIDTH + 2, y: 11 + rng() * 6 })
    nextStarIn = 60 + rng() * 80
  }

  const player = playerBox(playerY)
  const before = stars.length
  stars = stars.filter((s) => !overlaps(player, starBox(s)))
  starsCollected += before - stars.length

  const over = obstacles.some((o) => overlaps(player, obstacleBox(o)))

  return {
    playerY,
    playerVy,
    obstacles,
    stars,
    speed: Math.min(MAX_SPEED, state.speed + ACCELERATION * dt),
    distance: state.distance + move,
    starsCollected,
    nextObstacleIn,
    nextStarIn,
    nextId,
    over,
  }
}
