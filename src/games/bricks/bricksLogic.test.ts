import { describe, expect, it } from 'vitest'
import {
  BALL_RADIUS,
  ballSpeed,
  brickRect,
  buildStage,
  DIFFICULTIES,
  initialState,
  launch,
  movePaddle,
  PADDLE_Y,
  STAGE_BONUS,
  STAR_POINTS,
  step,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  type Brick,
  type BricksState,
} from './bricksLogic'

const easy = DIFFICULTIES.easy
const hard = DIFFICULTIES.hard
const noStars = () => 0.99

// A far-away brick keeps the stage from being cleared by accident.
const farBrick: Brick = { id: 999, row: 0, col: 0, hits: 1, strong: false, star: false }

function flying(ball: BricksState['ball'], overrides: Partial<BricksState> = {}): BricksState {
  return { ...initialState(easy, noStars), stuck: false, ball, bricks: [farBrick], ...overrides }
}

function runFor(state: BricksState, seconds: number, cfg = easy) {
  let s = state
  for (let t = 0; t < seconds; t += 1 / 60) s = step(s, 1 / 60, cfg, noStars)
  return s
}

describe('paddle and launch', () => {
  it('the resting ball rides on the paddle, which stays on the board', () => {
    let s = movePaddle(initialState(easy, noStars), 20, easy)
    expect(s.ball.x).toBe(20)
    s = movePaddle(s, -50, easy)
    expect(s.paddleX).toBe(easy.paddleWidth / 2)
    s = movePaddle(s, 500, easy)
    expect(s.paddleX).toBe(WORLD_WIDTH - easy.paddleWidth / 2)
  })

  it('does not move before launch, then flies up at the stage speed', () => {
    let s = runFor(initialState(easy, noStars), 1)
    expect(s.ball.y).toBe(PADDLE_Y - BALL_RADIUS)
    s = launch(s, easy)
    expect(s.stuck).toBe(false)
    expect(s.ball.vy).toBeLessThan(0)
    expect(Math.hypot(s.ball.vx, s.ball.vy)).toBeCloseTo(ballSpeed(1, easy))
  })
})

describe('bouncing', () => {
  it('bounces off the side walls and the ceiling', () => {
    expect(step(flying({ x: 1, y: 80, vx: -50, vy: -10 }), 1 / 60, easy).ball.vx).toBeGreaterThan(0)
    expect(step(flying({ x: 99, y: 80, vx: 50, vy: -10 }), 1 / 60, easy).ball.vx).toBeLessThan(0)
    const s = step(flying({ x: 80, y: 1, vx: 0, vy: -50 }, { bricks: [{ ...farBrick, col: 0 }] }), 1 / 60, easy)
    expect(s.ball.vy).toBeGreaterThan(0)
  })

  it('bounces up off the paddle, angled by where it lands', () => {
    const centre = step(flying({ x: 50, y: PADDLE_Y - 3, vx: 0, vy: 50 }), 1 / 30, easy)
    expect(centre.ball.vy).toBeLessThan(0)
    expect(Math.abs(centre.ball.vx)).toBeLessThan(1)

    const leftEdge = step(flying({ x: 50 - easy.paddleWidth / 2 + 1, y: PADDLE_Y - 3, vx: 0, vy: 50 }), 1 / 30, easy)
    expect(leftEdge.ball.vx).toBeLessThan(0)
    // Never flatter than 60° so the ball always climbs back to the bricks.
    expect(-leftEdge.ball.vy).toBeGreaterThanOrEqual(ballSpeed(1, easy) * 0.5 - 1e-9)
  })

  it('missing the ball costs a life; losing the last one ends the game', () => {
    let s = flying({ x: 5, y: WORLD_HEIGHT - 1, vx: 0, vy: 80 }, { paddleX: 80 })
    s = runFor(s, 0.2)
    expect(s.lives).toBe(easy.lives - 1)
    expect(s.stuck).toBe(true)
    expect(s.over).toBe(false)

    const last = runFor(flying({ x: 5, y: WORLD_HEIGHT - 1, vx: 0, vy: 80 }, { paddleX: 80, lives: 1 }), 0.2)
    expect(last.over).toBe(true)
  })
})

describe('bricks', () => {
  const target: Brick = { id: 1, row: 2, col: 3, hits: 1, strong: false, star: false }
  const r = brickRect(target)
  const below = { x: r.x + r.w / 2, y: r.y + r.h + BALL_RADIUS + 0.5, vx: 0, vy: -60 }

  it('a hit breaks the brick, scores and bounces the ball back', () => {
    const s = runFor(flying(below, { bricks: [target, farBrick] }), 0.1)
    expect(s.bricks.map((b) => b.id)).toEqual([farBrick.id])
    expect(s.score).toBe(1)
    expect(s.ball.vy).toBeGreaterThan(0)
  })

  it('an iron brick needs two hits and is worth 2', () => {
    const iron = { ...target, strong: true, hits: 2 }
    let s = runFor(flying(below, { bricks: [iron, farBrick] }), 0.1)
    expect(s.bricks).toHaveLength(2)
    expect(s.score).toBe(0)
    s = runFor({ ...s, ball: below }, 0.1)
    expect(s.bricks).toHaveLength(1)
    expect(s.score).toBe(2)
  })

  it('a fast ball on a slow frame still cannot pass through a brick', () => {
    const s = step(flying({ ...below, y: below.y + 3, vy: -200 }, { bricks: [target, farBrick] }), 0.05, easy)
    expect(s.bricks).toHaveLength(1)
  })

  it('a star brick drops a star; catching it is worth bonus points', () => {
    let s = runFor(flying(below, { bricks: [{ ...target, star: true }, farBrick], paddleX: r.x + r.w / 2 }), 0.1)
    expect(s.stars).toHaveLength(1)
    s = { ...s, ball: { x: 95, y: 40, vx: 0, vy: 0 } }
    s = runFor(s, 4)
    expect(s.stars).toHaveLength(0)
    expect(s.score).toBe(1 + STAR_POINTS)
  })

  it('a missed star just falls away', () => {
    let s = runFor(flying(below, { bricks: [{ ...target, star: true }, farBrick], paddleX: 90 }), 0.1)
    s = runFor({ ...s, ball: { x: 5, y: 40, vx: 0, vy: 0 } }, 4)
    expect(s.stars).toHaveLength(0)
    expect(s.score).toBe(1)
  })
})

describe('stages', () => {
  it('clearing the wall gives a bonus and builds the next, faster stage', () => {
    const target: Brick = { id: 1, row: 2, col: 3, hits: 1, strong: false, star: false }
    const r = brickRect(target)
    const s = runFor(flying({ x: r.x + r.w / 2, y: r.y + r.h + 3, vx: 0, vy: -60 }, { bricks: [target] }), 0.1)
    expect(s.stage).toBe(2)
    expect(s.score).toBe(1 + STAGE_BONUS)
    expect(s.stuck).toBe(true)
    expect(s.bricks.length).toBeGreaterThan(0)
    expect(ballSpeed(2, easy)).toBeGreaterThan(ballSpeed(1, easy))
    expect(ballSpeed(50, hard)).toBe(hard.maxSpeed)
  })

  it('every stage has bricks that fit on the board with unique ids', () => {
    for (const cfg of Object.values(DIFFICULTIES)) {
      for (let stage = 1; stage <= 12; stage++) {
        const bricks = buildStage(stage, cfg, 100, Math.random)
        expect(bricks.length).toBeGreaterThanOrEqual(6)
        expect(new Set(bricks.map((b) => b.id)).size).toBe(bricks.length)
        for (const b of bricks) {
          const r = brickRect(b)
          expect(r.x).toBeGreaterThanOrEqual(0)
          expect(r.x + r.w).toBeLessThanOrEqual(WORLD_WIDTH + 1e-9)
          expect(r.y + r.h).toBeLessThan(PADDLE_Y - 40)
        }
      }
    }
  })

  it('iron bricks only on the harder levels', () => {
    expect(buildStage(3, easy, 0, Math.random).some((b) => b.strong)).toBe(false)
    expect(buildStage(1, DIFFICULTIES.medium, 0, Math.random).some((b) => b.strong)).toBe(false)
    expect(buildStage(2, DIFFICULTIES.medium, 0, Math.random).some((b) => b.strong)).toBe(true)
    expect(buildStage(1, hard, 0, Math.random).some((b) => b.strong)).toBe(true)
  })
})
