import { describe, expect, it } from 'vitest'
import { initialState, isGrounded, PLAYER_X, score, STAR_BONUS, step, type RunnerState } from './runnerLogic'

const DT = 1 / 60

function run(state: RunnerState, seconds: number, jumpWhen: (s: RunnerState) => boolean = () => false) {
  let s = state
  for (let t = 0; t < seconds && !s.over; t += DT) s = step(s, DT, jumpWhen(s))
  return s
}

// A perfect player: jump when the next obstacle is just ahead.
const autopilot = (s: RunnerState) =>
  s.obstacles.some((o) => o.x - PLAYER_X > 4 && o.x - PLAYER_X < 4 + s.speed * 0.2)

describe('jumping', () => {
  it('leaves the ground, peaks, and lands again', () => {
    let s = step(initialState(), DT, true)
    expect(s.playerY).toBeGreaterThan(0)
    let peak = 0
    for (let i = 0; i < 120; i++) {
      s = step(s, DT, false)
      peak = Math.max(peak, s.playerY)
    }
    expect(peak).toBeGreaterThan(15)
    expect(isGrounded(s)).toBe(true)
  })

  it('cannot double-jump in the air', () => {
    const up = run(step(initialState(), DT, true), 0.2)
    const again = step(up, DT, true)
    expect(again.playerVy).toBeLessThan(up.playerVy)
  })
})

describe('obstacles', () => {
  it('ends the game if the player never jumps', () => {
    expect(run(initialState(), 20).over).toBe(true)
  })

  it('a well-timed jumper survives a long run (every obstacle is jumpable)', () => {
    for (let trial = 0; trial < 20; trial++) {
      const s = run(initialState(), 90, autopilot)
      expect(s.over).toBe(false)
      expect(s.distance).toBeGreaterThan(3000)
    }
  })

  it('speeds up over time but stays capped', () => {
    const s = run(initialState(), 120, autopilot)
    expect(s.speed).toBeGreaterThan(initialState().speed)
    expect(s.speed).toBeLessThanOrEqual(72)
  })
})

describe('score', () => {
  it('counts distance plus a bonus per star', () => {
    const s = { ...initialState(), distance: 250, starsCollected: 3 }
    expect(score(s)).toBe(25 + 3 * STAR_BONUS)
  })

  it('stars can be collected by jumping', () => {
    let collected = 0
    for (let trial = 0; trial < 10; trial++) {
      const jumpForStars = (s: RunnerState) => autopilot(s) || s.stars.some((st) => st.x - PLAYER_X > 3 && st.x - PLAYER_X < 12)
      collected += run(initialState(), 60, jumpForStars).starsCollected
    }
    expect(collected).toBeGreaterThan(0)
  })

  it('does nothing after game over', () => {
    const over = { ...initialState(), over: true }
    expect(step(over, DT, true)).toBe(over)
  })
})

describe('fairness for young kids', () => {
  it('gives at least 0.4s to time a jump at the starting speed', () => {
    const start = initialState()
    let survivable = 0
    for (let lead = 0; lead <= 60; lead += 0.25) {
      let s: RunnerState = {
        ...start,
        obstacles: [{ id: 1, x: PLAYER_X + lead, kind: 'cactus' }],
        nextObstacleIn: 1e9,
        nextStarIn: 1e9,
      }
      s = step(s, DT, true)
      s = run(s, 2)
      if (!s.over) survivable += 0.25
    }
    expect(survivable / start.speed).toBeGreaterThanOrEqual(0.4)
  })
})
