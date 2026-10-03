import { describe, expect, it } from 'vitest'
import { isRecentEmoji } from '../../lib/emojiSupport'
import {
  DIFFICULTIES,
  FINDS_PER_SIZE,
  initialState,
  makeRound,
  ROUND_SECONDS,
  showHint,
  sizeFor,
  tapCell,
  tick,
  timeLeft,
  type OddOneState,
} from './oddOneLogic'

const easy = DIFFICULTIES.easy
const hard = DIFFICULTIES.hard

const findIt = (s: OddOneState, cfg = easy) => tapCell(s, s.round.oddIndex, cfg)
const missIt = (s: OddOneState, cfg = easy) => tapCell(s, (s.round.oddIndex + 1) % (s.round.size * s.round.size), cfg)

describe('rounds', () => {
  it('hides exactly one different picture inside the grid', () => {
    for (let i = 0; i < 200; i++) {
      const r = makeRound(hard, i % 12, 0)
      expect(r.oddIndex).toBeGreaterThanOrEqual(0)
      expect(r.oddIndex).toBeLessThan(r.size * r.size)
      expect(r.odd).not.toBe(r.base)
    }
  })

  it('never shows the same pair twice in a row', () => {
    for (let i = 0; i < 100; i++) {
      const first = makeRound(easy, 0, 0, () => 0.42)
      const next = makeRound(easy, 1, 0, () => 0.42, first.pairIndex)
      expect(next.pairIndex).not.toBe(first.pairIndex)
    }
  })

  it(`the grid grows every ${FINDS_PER_SIZE} finds and stops at the level's largest size`, () => {
    expect(sizeFor(0, easy)).toBe(3)
    expect(sizeFor(FINDS_PER_SIZE * 2, easy)).toBe(4)
    expect(sizeFor(1000, easy)).toBe(5)
    expect(sizeFor(1000, hard)).toBe(7)
  })

  it('every pair uses long-established emoji that all phones can draw', () => {
    for (const cfg of Object.values(DIFFICULTIES)) {
      for (const [a, b] of cfg.pairs) {
        expect(a).not.toBe(b)
        expect(isRecentEmoji(a) || isRecentEmoji(b)).toBe(false)
      }
    }
  })
})

describe('tapping', () => {
  it('finding the odd one scores and starts a new round', () => {
    const s = initialState(easy)
    const r = findIt(s)
    expect(r.result).toBe('found')
    expect(r.state.found).toBe(1)
    expect(r.state.round).not.toBe(s.round)
  })

  it('a wrong tap costs seconds but keeps the same round', () => {
    const s = initialState(hard)
    const r = missIt(s, hard)
    expect(r.result).toBe('miss')
    expect(r.state.mistakes).toBe(1)
    expect(timeLeft(r.state)).toBe(ROUND_SECONDS - hard.penalty)
    expect(r.state.round).toBe(s.round)
  })

  it('taps outside the grid, or after time is up, are ignored', () => {
    const s = initialState(easy)
    expect(tapCell(s, 99, easy).result).toBe('ignored')
    const over = { ...s, over: true }
    expect(tapCell(over, over.round.oddIndex, easy).result).toBe('ignored')
  })
})

describe('the clock', () => {
  it(`the game lasts ${ROUND_SECONDS} seconds`, () => {
    let s = initialState(easy)
    for (let t = 0; t < ROUND_SECONDS - 1; t += 0.1) s = tick(s, 0.1)
    expect(s.over).toBe(false)
    for (let t = 0; t < 2; t += 0.1) s = tick(s, 0.1)
    expect(s.over).toBe(true)
    expect(timeLeft(s)).toBe(0)
  })

  it('a long pause between frames counts only a moment', () => {
    expect(tick(initialState(easy), 30).elapsed).toBeLessThan(1)
  })

  it('wrong taps that use up the time end the game', () => {
    let s = { ...initialState(hard), elapsed: ROUND_SECONDS - 1 }
    s = missIt(s, hard).state
    expect(s.over).toBe(true)
  })

  it('on easy, the odd picture is hinted after a few seconds; never on hard', () => {
    let s = initialState(easy)
    expect(showHint(s, easy)).toBe(false)
    for (let t = 0; t < easy.hintAfter! + 0.5; t += 0.2) s = tick(s, 0.2)
    expect(showHint(s, easy)).toBe(true)
    s = findIt(s).state
    expect(showHint(s, easy)).toBe(false)
    expect(showHint({ ...initialState(hard), elapsed: 50 }, hard)).toBe(false)
  })
})
