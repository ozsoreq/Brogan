import { describe, expect, it } from 'vitest'
import {
  BOMB_PENALTY,
  DIFFICULTIES,
  initialState,
  ROUND_SECONDS,
  starsFor,
  tick,
  whack,
  type WhackState,
} from './whackLogic'

const easy = DIFFICULTIES.easy
const hard = DIFFICULTIES.hard

function withHole(state: WhackState, index: number, kind: 'mole' | 'bomb', until: number): WhackState {
  return { ...state, holes: state.holes.map((h, i) => (i === index ? { id: 99, kind, until } : h)) }
}

describe('tick', () => {
  it('pops up a hamster once the spawn time arrives', () => {
    const s0 = initialState(0)
    expect(tick(s0, 100, easy)).toBe(s0)
    const s1 = tick(s0, 400, easy, () => 0)
    expect(s1.holes.filter(Boolean)).toHaveLength(1)
    expect(s1.holes[0]).toMatchObject({ kind: 'mole', until: 400 + easy.upTimeMs })
  })

  it('hides a hamster after its up-time', () => {
    const s = withHole(initialState(0), 3, 'mole', 1000)
    expect(tick({ ...s, nextSpawnAt: 99999 }, 1000, easy).holes[3]).toBeNull()
  })

  it('never shows more targets than the difficulty allows, and easy never shows bombs', () => {
    for (const cfg of Object.values(DIFFICULTIES)) {
      let s = initialState(0)
      for (let t = 0; t <= ROUND_SECONDS * 1000; t += 100) {
        s = tick(s, t, cfg)
        const targets = s.holes.filter((h) => h && (h.kind === 'mole' || h.kind === 'bomb'))
        expect(targets.length).toBeLessThanOrEqual(cfg.maxActive)
        if (cfg.bombChance === 0) expect(targets.some((h) => h!.kind === 'bomb')).toBe(false)
      }
    }
  })

  it('hard is busier than easy over a full round', () => {
    const spawned = (cfg: typeof easy) => {
      let s = initialState(0)
      for (let t = 0; t <= ROUND_SECONDS * 1000; t += 100) s = tick(s, t, cfg)
      return s.nextId - 1
    }
    expect(spawned(hard)).toBeGreaterThan(spawned(easy))
  })
})

describe('whack', () => {
  it('scores a point for a hamster and shows the hit', () => {
    const s = whack(withHole(initialState(0), 2, 'mole', 500), 2, 100)
    expect(s.score).toBe(1)
    expect(s.hits).toBe(1)
    expect(s.holes[2]?.kind).toBe('hit')
  })

  it('cannot score the same hamster twice', () => {
    const once = whack(withHole(initialState(0), 2, 'mole', 500), 2, 100)
    expect(whack(once, 2, 150)).toBe(once)
  })

  it('bombs cost points but never below zero', () => {
    let s = { ...withHole(initialState(0), 4, 'bomb', 500), score: 5 }
    s = whack(s, 4, 100)
    expect(s.score).toBe(5 - BOMB_PENALTY)
    expect(s.bombsHit).toBe(1)
    expect(whack(withHole(initialState(0), 4, 'bomb', 500), 4, 100).score).toBe(0)
  })

  it('ignores empty holes and hamsters that already hid', () => {
    const s = withHole(initialState(0), 1, 'mole', 500)
    expect(whack(s, 0, 100)).toBe(s)
    expect(whack(s, 1, 600)).toBe(s)
  })
})

describe('starsFor', () => {
  it('uses per-difficulty thresholds', () => {
    expect(starsFor(0, easy)).toBe(1)
    expect(starsFor(easy.starScores[0], easy)).toBe(2)
    expect(starsFor(easy.starScores[1], easy)).toBe(3)
  })
})
