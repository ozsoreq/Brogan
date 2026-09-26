import { describe, expect, it } from 'vitest'
import { buildDeck, DIFFICULTIES, initialState, memoryReducer, starsFor, type Card } from './memoryLogic'

const deck: Card[] = ['🐶', '🐱', '🐶', '🐱'].map((emoji, id) => ({ id, emoji }))
const flip = (s: ReturnType<typeof initialState>, index: number) => memoryReducer(s, { type: 'flip', index })

describe('buildDeck', () => {
  for (const [name, { pairs }] of Object.entries(DIFFICULTIES)) {
    it(`${name}: every picture appears exactly twice`, () => {
      for (let i = 0; i < 50; i++) {
        const cards = buildDeck(pairs)
        expect(cards).toHaveLength(pairs * 2)
        const counts = new Map<string, number>()
        cards.forEach((c) => counts.set(c.emoji, (counts.get(c.emoji) ?? 0) + 1))
        expect(counts.size).toBe(pairs)
        expect([...counts.values()].every((n) => n === 2)).toBe(true)
        expect(new Set(cards.map((c) => c.id)).size).toBe(cards.length)
      }
    })
  }
})

describe('memoryReducer', () => {
  it('keeps a matching pair face up and counts one move', () => {
    const s = flip(flip(initialState(deck), 0), 2)
    expect(s.matched).toEqual(['🐶'])
    expect(s.flipped).toEqual([])
    expect(s.moves).toBe(1)
  })

  it('leaves a mismatch visible until hidden, and blocks a third card meanwhile', () => {
    let s = flip(flip(initialState(deck), 0), 1)
    expect(s.flipped).toEqual([0, 1])
    expect(flip(s, 2)).toBe(s)
    s = memoryReducer(s, { type: 'hideMismatch' })
    expect(s.flipped).toEqual([])
    expect(s.moves).toBe(1)
  })

  it('ignores tapping the same card twice or an already matched card', () => {
    let s = flip(initialState(deck), 0)
    expect(flip(s, 0)).toBe(s)
    s = flip(s, 2)
    expect(flip(s, 0)).toBe(s)
  })

  it('wins when all pairs are found', () => {
    let s = initialState(deck)
    for (const i of [0, 2, 1, 3]) s = flip(s, i)
    expect(s.won).toBe(true)
    expect(s.moves).toBe(2)
  })
})

describe('starsFor', () => {
  it('rewards fewer moves', () => {
    expect(starsFor(6, 6)).toBe(3)
    expect(starsFor(13, 6)).toBe(2)
    expect(starsFor(30, 6)).toBe(1)
  })
})
