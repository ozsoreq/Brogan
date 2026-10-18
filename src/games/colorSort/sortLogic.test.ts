import { describe, expect, it } from 'vitest'
import {
  applyMove,
  canMove,
  colorOf,
  DIFFICULTIES,
  isSolved,
  isTubeDone,
  makeLevel,
  MAX_COLORS,
  solve,
  type Tubes,
} from './sortLogic'

// Small deterministic RNG so generated stages are repeatable.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ball = (color: number, k = 0) => (color << 4) | k

describe('moves', () => {
  const tubes: Tubes = [[ball(0), ball(1)], [ball(1, 1)], [], [ball(0, 1), ball(0, 2), ball(0, 3)]]

  it('allows a ball onto the same colour or into an empty tube', () => {
    expect(canMove(tubes, { from: 0, to: 1 }, 3)).toBe(true)
    expect(canMove(tubes, { from: 0, to: 2 }, 3)).toBe(true)
  })

  it('refuses a different colour, a full tube, an empty source and the same tube', () => {
    expect(canMove(tubes, { from: 1, to: 3 }, 4)).toBe(false)
    expect(canMove(tubes, { from: 1, to: 3 }, 3)).toBe(false)
    expect(canMove(tubes, { from: 2, to: 0 }, 3)).toBe(false)
    expect(canMove(tubes, { from: 0, to: 0 }, 3)).toBe(false)
  })

  it('moves only the top ball and leaves the original untouched', () => {
    const next = applyMove(tubes, { from: 0, to: 1 })
    expect(next[0]).toEqual([ball(0)])
    expect(next[1]).toEqual([ball(1, 1), ball(1)])
    expect(tubes[0]).toEqual([ball(0), ball(1)])
  })

  it('knows a full one-colour tube and a solved board', () => {
    expect(isTubeDone([ball(2), ball(2, 1), ball(2, 2)], 3)).toBe(true)
    expect(isTubeDone([ball(2), ball(2, 1)], 3)).toBe(false)
    expect(isSolved([[ball(0), ball(0, 1)], [], [ball(1), ball(1, 1)]], 2)).toBe(true)
    expect(isSolved([[ball(0), ball(1)], [ball(1, 1), ball(0, 1)], []], 2)).toBe(false)
  })
})

describe('solver', () => {
  it('solves a small puzzle, and every move it gives is legal', () => {
    let t: Tubes = [[ball(0), ball(1), ball(0, 1)], [ball(1, 1), ball(0, 2), ball(1, 2)], [], []]
    const moves = solve(t, 3)
    expect(moves).not.toBeNull()
    for (const m of moves!) {
      expect(canMove(t, m, 3)).toBe(true)
      t = applyMove(t, m)
    }
    expect(isSolved(t, 3)).toBe(true)
  })

  it('reports a dead end as unsolvable', () => {
    expect(solve([[ball(0), ball(1)], [ball(1, 1), ball(0, 1)]], 2)).toBeNull()
  })
})

describe('stages', () => {
  it('every stage of every level is solvable, uses the right colours, and does not start sorted', () => {
    const rng = mulberry32(7)
    for (const cfg of Object.values(DIFFICULTIES)) {
      cfg.colors.forEach((colors, stage) => {
        expect(colors).toBeLessThanOrEqual(MAX_COLORS)
        const tubes = makeLevel(cfg, stage, rng)
        expect(tubes).toHaveLength(colors + cfg.empty)
        const all = tubes.flat()
        expect(all).toHaveLength(colors * cfg.capacity)
        expect(new Set(all).size).toBe(all.length)
        for (let c = 0; c < colors; c++) expect(all.filter((b) => colorOf(b) === c)).toHaveLength(cfg.capacity)
        expect(tubes.some((t) => isTubeDone(t, cfg.capacity))).toBe(false)
        expect(solve(tubes, cfg.capacity)).not.toBeNull()
      })
    }
  })
})
