import { describe, expect, it } from 'vitest'
import {
  chooseMove,
  COLS,
  COMPUTER,
  emptyBoard,
  findWin,
  isFull,
  landingRow,
  play,
  PLAYER,
  ROWS,
  validCols,
  type Board,
  type Cell,
  type Difficulty,
  type Side,
} from './connect4Logic'

function build(moves: [number, Side][]): Board {
  return moves.reduce((b, [col, side]) => play(b, col, side), emptyBoard())
}

// Seeded generator so the simulated games are repeatable.
function seeded(seed: number) {
  // mulberry32
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('dropping discs', () => {
  it('stacks discs from the bottom up and refuses a full column', () => {
    let b = emptyBoard()
    for (let i = 0; i < ROWS; i++) {
      expect(landingRow(b, 2)).toBe(ROWS - 1 - i)
      b = play(b, 2, i % 2 ? COMPUTER : PLAYER)
    }
    expect(landingRow(b, 2)).toBe(-1)
    expect(validCols(b)).not.toContain(2)
    expect(() => play(b, 2, PLAYER)).toThrow()
  })

  it('does not change the old board', () => {
    const b = emptyBoard()
    play(b, 0, PLAYER)
    expect(b.flat().every((c) => c === 0)).toBe(true)
  })
})

describe('winning', () => {
  it('finds four in a row across, up, and on both diagonals', () => {
    expect(findWin(build([[0, PLAYER], [1, PLAYER], [2, PLAYER], [3, PLAYER]]))?.side).toBe(PLAYER)
    expect(findWin(build([[4, COMPUTER], [4, COMPUTER], [4, COMPUTER], [4, COMPUTER]]))?.side).toBe(COMPUTER)
    const up = build([
      [0, PLAYER],
      [1, COMPUTER], [1, PLAYER],
      [2, COMPUTER], [2, COMPUTER], [2, PLAYER],
      [3, COMPUTER], [3, COMPUTER], [3, COMPUTER], [3, PLAYER],
    ])
    expect(findWin(up)).toEqual({ side: PLAYER, cells: expect.arrayContaining([[5, 0], [4, 1], [3, 2], [2, 3]]) })
    const down = build([
      [6, PLAYER],
      [5, COMPUTER], [5, PLAYER],
      [4, COMPUTER], [4, COMPUTER], [4, PLAYER],
      [3, COMPUTER], [3, COMPUTER], [3, COMPUTER], [3, PLAYER],
    ])
    expect(findWin(down)?.side).toBe(PLAYER)
    expect(findWin(down)?.cells).toHaveLength(4)
  })

  it('three in a row is not a win', () => {
    expect(findWin(build([[0, PLAYER], [1, PLAYER], [2, PLAYER]]))).toBeNull()
  })

  it('a full board with no line of four is a draw', () => {
    const b: Board = Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => (((c >> 1) + r) % 2 === 0 ? PLAYER : COMPUTER) as Cell),
    )
    expect(isFull(b)).toBe(true)
    expect(findWin(b)).toBeNull()
  })
})

describe('computer player', () => {
  const threeAcross = build([[0, PLAYER], [0, COMPUTER], [1, PLAYER], [1, COMPUTER], [2, PLAYER], [2, COMPUTER]])

  it('medium and hard always take a win', () => {
    // Computer to move with three on row 4 (cols 0-2): column 3 wins.
    for (const d of ['medium', 'hard'] as Difficulty[]) expect(chooseMove(threeAcross, d, seeded(1))).toBe(3)
  })

  it('medium and hard always block the player', () => {
    const threat = build([[0, PLAYER], [6, COMPUTER], [1, PLAYER], [6, COMPUTER], [2, PLAYER]])
    for (const d of ['medium', 'hard'] as Difficulty[]) expect(chooseMove(threat, d, seeded(2))).toBe(3)
  })

  it('easy sometimes misses a win, so little kids can beat it', () => {
    const picks = new Set(Array.from({ length: 40 }, (_, i) => chooseMove(threeAcross, 'easy', seeded(i + 10))))
    expect(picks.has(3)).toBe(true)
    expect(picks.size).toBeGreaterThan(1)
  })

  it('always picks a legal column, even on an almost full board', () => {
    let b = emptyBoard()
    const rng = seeded(7)
    let side: Side = PLAYER
    while (!isFull(b) && !findWin(b)) {
      const col = chooseMove(b, 'hard', rng, side)
      expect(validCols(b)).toContain(col)
      b = play(b, col, side)
      side = side === PLAYER ? COMPUTER : PLAYER
    }
  })

  function playOut(red: Difficulty | 'random', yellow: Difficulty, seed: number) {
    const rng = seeded(seed)
    let b = emptyBoard()
    let side: Side = seed % 2 ? PLAYER : COMPUTER
    for (;;) {
      const cols = validCols(b)
      const col =
        side === PLAYER
          ? red === 'random'
            ? cols[Math.floor(rng() * cols.length)]
            : chooseMove(b, red, rng, PLAYER)
          : chooseMove(b, yellow, rng, COMPUTER)
      b = play(b, col, side)
      const win = findWin(b)
      if (win) return win.side
      if (isFull(b)) return 0
      side = side === PLAYER ? COMPUTER : PLAYER
    }
  }

  it('each level is stronger than the one below it', () => {
    const games = 12
    const wins = (red: Difficulty | 'random', yellow: Difficulty) =>
      Array.from({ length: games }, (_, i) => playOut(red, yellow, i + 1)).filter((w) => w === COMPUTER).length
    expect(wins('random', 'easy')).toBeGreaterThanOrEqual(games * 0.6)
    expect(wins('easy', 'medium')).toBeGreaterThanOrEqual(games * 0.6)
    expect(wins('medium', 'hard')).toBeGreaterThanOrEqual(games * 0.6)
  })
})
