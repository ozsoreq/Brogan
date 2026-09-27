import { describe, expect, it } from 'vitest'
import {
  DIFFICULTIES,
  endStroke,
  initialState,
  OBJECT_RADIUS,
  ROUND_SECONDS,
  slice,
  START_LIVES,
  step,
  timeLeft,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  type Flying,
  type FruitState,
} from './fruitLogic'

const DT = 1 / 60
const easy = DIFFICULTIES.easy
const medium = DIFFICULTIES.medium

const fruit = (id: number, x: number, y: number): Flying => ({ id, kind: 'fruit', emoji: '🍎', x, y, vx: 0, vy: 0 })
const bomb = (id: number, x: number, y: number): Flying => ({ id, kind: 'bomb', emoji: '💣', x, y, vx: 0, vy: 0 })
const withObjects = (objects: Flying[]): FruitState => ({ ...initialState(), objects, nextId: 100 })

function simulate(cfg = medium, seconds = 30) {
  let s = initialState()
  const seen: FruitState[] = []
  for (let t = 0; t < seconds && !s.over; t += DT) {
    s = step(s, DT, cfg)
    seen.push(s)
  }
  return { final: s, seen }
}

describe('launching', () => {
  it('launches fruit that stays on screen and reaches a sliceable height', () => {
    const { seen } = simulate(easy, 20)
    const all = seen.flatMap((s) => s.objects)
    expect(all.length).toBeGreaterThan(0)
    for (const o of all) {
      expect(o.x).toBeGreaterThan(0)
      expect(o.x).toBeLessThan(WORLD_WIDTH)
      expect(o.y).toBeLessThan(WORLD_HEIGHT)
    }
    const peak = Math.max(...all.map((o) => o.y))
    expect(peak).toBeGreaterThan(60)
  })

  it('never sends bombs before the difficulty allows', () => {
    for (const cfg of Object.values(DIFFICULTIES)) {
      let s = initialState()
      for (let t = 0; t < cfg.bombsAfter - 0.1; t += DT) {
        s = step(s, DT, cfg)
        expect(s.objects.some((o) => o.kind === 'bomb')).toBe(false)
      }
    }
  })
})

describe('slicing', () => {
  it('cuts a fruit the swipe passes through, into two halves', () => {
    const s = slice(withObjects([fruit(1, 50, 50)]), { x1: 40, y1: 45, x2: 60, y2: 55 })
    expect(s.score).toBe(1)
    expect(s.objects).toHaveLength(0)
    expect(s.pieces.map((p) => p.side).sort()).toEqual(['left', 'right'])
  })

  it('ignores fruit the swipe misses', () => {
    const s0 = withObjects([fruit(1, 50, 50)])
    expect(slice(s0, { x1: 0, y1: 0, x2: 20, y2: 0 })).toBe(s0)
  })

  it('a tap directly on a fruit also cuts it', () => {
    const s = slice(withObjects([fruit(1, 30, 30)]), { x1: 31, y1: 31, x2: 31, y2: 31 })
    expect(s.score).toBe(1)
  })

  it('gives a combo bonus from the third fruit in one swipe, reset between swipes', () => {
    let s = withObjects([fruit(1, 20, 50), fruit(2, 40, 50), fruit(3, 60, 50), fruit(4, 80, 50)])
    s = slice(s, { x1: 10, y1: 50, x2: 90, y2: 50 })
    expect(s.score).toBe(1 + 1 + 2 + 2)
    s = endStroke(s)
    s = slice({ ...s, objects: [fruit(5, 50, 20)] }, { x1: 50, y1: 20, x2: 50, y2: 20 })
    expect(s.score).toBe(6 + 1)
  })

  it('cutting a bomb costs a life, and the last life ends the game', () => {
    let s = slice(withObjects([bomb(1, 50, 50)]), { x1: 50, y1: 50, x2: 50, y2: 50 })
    expect(s.lives).toBe(START_LIVES - 1)
    expect(s.score).toBe(0)
    s = slice({ ...s, lives: 1, objects: [bomb(2, 50, 50)] }, { x1: 50, y1: 50, x2: 50, y2: 50 })
    expect(s.lives).toBe(0)
    expect(s.over).toBe(true)
  })
})

describe('missing and ending', () => {
  const falling: Flying = { id: 1, kind: 'fruit', emoji: '🍎', x: 50, y: -OBJECT_RADIUS * 2 + 0.1, vx: 0, vy: -40 }

  it('on easy, a dropped fruit costs nothing', () => {
    const s = step({ ...initialState(), objects: [falling], nextWaveIn: 99 }, DT, easy)
    expect(s.objects).toHaveLength(0)
    expect(s.lives).toBe(START_LIVES)
  })

  it('on medium, a dropped fruit costs a life', () => {
    const s = step({ ...initialState(), objects: [falling], nextWaveIn: 99 }, DT, medium)
    expect(s.lives).toBe(START_LIVES - 1)
  })

  it('a dropped bomb costs nothing', () => {
    const s = step({ ...initialState(), objects: [{ ...falling, kind: 'bomb' }], nextWaveIn: 99 }, DT, medium)
    expect(s.lives).toBe(START_LIVES)
  })

  it('ends when the time runs out', () => {
    const { final } = simulate(easy, ROUND_SECONDS + 1)
    expect(final.over).toBe(true)
    expect(timeLeft(final)).toBe(0)
  })
})
