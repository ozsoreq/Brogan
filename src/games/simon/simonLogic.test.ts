import { describe, expect, it } from 'vitest'
import { DIFFICULTIES, initialState, PADS, press, stepDuration, type PressResult, type SimonState } from './simonLogic'

const easy = DIFFICULTIES.easy
const hard = DIFFICULTIES.hard

function withSequence(sequence: number[], overrides: Partial<SimonState> = {}): SimonState {
  return { ...initialState(easy), sequence, ...overrides }
}

// Repeats the whole current sequence correctly.
function repeatAll(state: SimonState, cfg = easy, rng = () => 0) {
  let s = state
  let result: PressResult = 'ignored'
  for (const pad of s.sequence) {
    const r = press(s, pad, cfg, rng)
    s = r.state
    result = r.result
  }
  return { state: s, result }
}

describe('playing the sequence back', () => {
  it('starts with one step and full lives', () => {
    const s = initialState(easy)
    expect(s.sequence).toHaveLength(1)
    expect(s.lives).toBe(easy.lives)
    expect(s.best).toBe(0)
  })

  it('each correct press moves along; finishing the sequence adds one more step', () => {
    let s = withSequence([2, 0, 3])
    let r = press(s, 2, easy)
    expect(r.result).toBe('correct')
    expect(r.state.inputIndex).toBe(1)
    s = r.state
    s = press(s, 0, easy).state
    r = press(s, 3, easy, () => 0.3)
    expect(r.result).toBe('roundComplete')
    expect(r.state.sequence).toEqual([2, 0, 3, 1])
    expect(r.state.inputIndex).toBe(0)
    expect(r.state.best).toBe(3)
  })

  it('the sequence keeps its earlier steps as it grows', () => {
    let s = initialState(easy, () => 0.5)
    const first = s.sequence[0]
    for (let round = 0; round < 5; round++) s = repeatAll(s).state
    expect(s.sequence).toHaveLength(6)
    expect(s.sequence[0]).toBe(first)
    expect(s.best).toBe(5)
  })
})

describe('mistakes', () => {
  it('a wrong press costs a life and replays the same sequence', () => {
    const s = withSequence([1, 2], { inputIndex: 1 })
    const r = press(s, 3, easy)
    expect(r.result).toBe('mistake')
    expect(r.state.lives).toBe(easy.lives - 1)
    expect(r.state.inputIndex).toBe(0)
    expect(r.state.sequence).toEqual([1, 2])
  })

  it('losing the last life ends the game, keeping the best length', () => {
    const s = withSequence([1, 2, 3], { lives: 1, best: 2 })
    const r = press(s, 0, easy)
    expect(r.result).toBe('gameOver')
    expect(r.state.over).toBe(true)
    expect(r.state.best).toBe(2)
    expect(press(r.state, 1, easy).result).toBe('ignored')
  })

  it('ignores pads that do not exist on this level', () => {
    expect(press(withSequence([0]), 5, easy).result).toBe('ignored')
    expect(press({ ...initialState(hard), sequence: [5] }, 5, hard).result).toBe('roundComplete')
  })
})

describe('levels', () => {
  it('uses only pads that exist, on every level', () => {
    for (const cfg of Object.values(DIFFICULTIES)) {
      expect(cfg.pads).toBeLessThanOrEqual(PADS.length)
      let s = initialState(cfg)
      for (let round = 0; round < 30; round++) s = repeatAll(s, cfg, Math.random).state
      expect(s.sequence.every((p) => p >= 0 && p < cfg.pads)).toBe(true)
    }
  })

  it('shows the sequence a little faster as it grows, but never too fast', () => {
    expect(stepDuration(8, easy)).toBeLessThan(stepDuration(1, easy))
    expect(stepDuration(100, easy)).toBe(easy.minStepMs)
    expect(stepDuration(1, easy)).toBeGreaterThan(stepDuration(1, hard))
  })

  it('harder levels have fewer lives', () => {
    expect(DIFFICULTIES.easy.lives).toBeGreaterThan(DIFFICULTIES.medium.lives)
    expect(DIFFICULTIES.medium.lives).toBeGreaterThan(DIFFICULTIES.hard.lives)
  })

  it('every pad has its own note, so the sequence can be followed by ear', () => {
    expect(new Set(PADS.map((p) => p.note)).size).toBe(PADS.length)
  })
})
