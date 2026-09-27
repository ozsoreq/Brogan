import { describe, expect, it } from 'vitest'
import {
  BONUS_EVERY,
  BONUS_POINTS,
  BONUS_TICKS,
  DIFFICULTIES,
  initialState,
  tick,
  tickInterval,
  turn,
  type SnakeState,
} from './snakeLogic'

const easy = DIFFICULTIES.easy
const hard = DIFFICULTIES.hard

// A deterministic board: snake at (6,6),(5,6),(4,6) heading right.
function board(overrides: Partial<SnakeState> = {}): SnakeState {
  return { ...initialState(12, () => 0), food: { x: 0, y: 0 }, ...overrides }
}

describe('moving and turning', () => {
  it('moves one cell forward per tick without growing', () => {
    const s = tick(board(), easy)
    expect(s.snake).toEqual([
      { x: 7, y: 6 },
      { x: 6, y: 6 },
      { x: 5, y: 6 },
    ])
  })

  it('turns, but ignores a direct reverse into its own body', () => {
    expect(turn(board(), 'left').queue).toEqual([])
    const s = tick(turn(board(), 'up'), easy)
    expect(s.snake[0]).toEqual({ x: 6, y: 5 })
    expect(s.dir).toBe('up')
  })

  it('remembers two quick turns so a fast U-turn works', () => {
    let s = turn(turn(board(), 'up'), 'left')
    s = tick(tick(s, easy), easy)
    expect(s.snake[0]).toEqual({ x: 5, y: 5 })
    expect(s.over).toBe(false)
  })
})

describe('walls', () => {
  const atEdge = board({ snake: [{ x: 11, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 6 }] })

  it('easy wraps around to the other side', () => {
    const s = tick(atEdge, easy)
    expect(s.over).toBe(false)
    expect(s.snake[0]).toEqual({ x: 0, y: 6 })
  })

  it('hard ends the game at the wall', () => {
    expect(tick(atEdge, hard).over).toBe(true)
  })
})

describe('eating', () => {
  it('grows by one and scores when eating an apple', () => {
    const s = tick(board({ food: { x: 7, y: 6 } }), easy)
    expect(s.snake).toHaveLength(4)
    expect(s.score).toBe(1)
    expect(s.apples).toBe(1)
    expect(s.snake.some((p) => p.x === s.food.x && p.y === s.food.y)).toBe(false)
  })

  it(`offers a bonus star every ${BONUS_EVERY} apples, worth ${BONUS_POINTS}`, () => {
    let s = tick(board({ food: { x: 7, y: 6 }, apples: BONUS_EVERY - 1 }), easy)
    expect(s.bonus?.ticksLeft).toBe(BONUS_TICKS)
    const at = s.bonus!.at
    s = tick({ ...s, snake: [{ x: at.x - 1 < 0 ? at.x + 1 : at.x - 1, y: at.y }, ...s.snake.slice(1)], dir: at.x - 1 < 0 ? 'left' : 'right', queue: [] }, easy)
    expect(s.bonus).toBeNull()
    expect(s.score).toBe(1 + BONUS_POINTS)
  })

  it('the bonus disappears if not eaten in time', () => {
    let s = board({ bonus: { at: { x: 0, y: 11 }, ticksLeft: 2 } })
    s = tick(s, easy)
    expect(s.bonus).not.toBeNull()
    s = tick(s, easy)
    expect(s.bonus).toBeNull()
  })
})

describe('collisions and speed', () => {
  it('biting its own body ends the game', () => {
    const coiled = board({
      snake: [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 6, y: 5 }, { x: 6, y: 4 }],
      dir: 'up',
      queue: ['right'],
    })
    expect(tick(coiled, easy).over).toBe(true)
  })

  it('may move into the cell the tail is leaving', () => {
    const loop = board({ snake: [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 6, y: 5 }], dir: 'up', queue: ['right'] })
    expect(tick(loop, easy).over).toBe(false)
  })

  it('easy never speeds up; harder levels speed up with apples down to a floor', () => {
    expect(tickInterval(board({ apples: 50 }), easy)).toBe(easy.tickMs)
    expect(tickInterval(board({ apples: 5 }), hard)).toBeLessThan(hard.tickMs)
    expect(tickInterval(board({ apples: 500 }), hard)).toBe(hard.minTickMs)
  })

  it('food never spawns on the snake', () => {
    for (let i = 0; i < 200; i++) {
      const s = initialState(12)
      expect(s.snake.some((p) => p.x === s.food.x && p.y === s.food.y)).toBe(false)
    }
  })
})
