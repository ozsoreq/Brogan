import { describe, expect, it } from 'vitest'
import {
  DIFFICULTIES,
  drop,
  GROW_AFTER_STREAK,
  initialState,
  PERFECT_POINTS,
  slideBounds,
  speedForLevel,
  step,
  WORLD_WIDTH,
  type StackState,
} from './stackLogic'

const easy = DIFFICULTIES.easy
const hard = DIFFICULTIES.hard

function withMovingAt(state: StackState, left: number): StackState {
  return { ...state, moving: { ...state.moving, left } }
}

function perfectDrop(state: StackState, cfg = easy) {
  return drop(withMovingAt(state, state.placed[state.placed.length - 1].left), cfg)
}

describe('sliding', () => {
  it('slides and bounces back at the edges, staying in its lane', () => {
    let s = initialState(easy)
    const { min, max } = slideBounds(s.moving.width)
    expect(s.moving.left).toBe(min)
    let turnedBack = false
    for (let i = 0; i < 600; i++) {
      s = step(s, 1 / 60, easy)
      expect(s.moving.left).toBeGreaterThanOrEqual(min)
      expect(s.moving.left).toBeLessThanOrEqual(max)
      if (s.moving.dir === -1) turnedBack = true
    }
    expect(turnedBack).toBe(true)
  })

  it('gets faster as the tower grows, up to a limit', () => {
    expect(speedForLevel(10, hard)).toBeGreaterThan(speedForLevel(1, hard))
    expect(speedForLevel(1000, hard)).toBe(hard.maxSpeed)
    expect(speedForLevel(1, easy)).toBeLessThan(speedForLevel(1, hard))
  })
})

describe('dropping', () => {
  it('a perfect drop keeps the full width and scores the bonus', () => {
    const s = drop(withMovingAt(initialState(easy), initialState(easy).placed[0].left + easy.tolerance - 0.5), easy)
    expect(s.placed).toHaveLength(2)
    expect(s.placed[1].width).toBe(easy.width)
    expect(s.placed[1].left).toBe(s.placed[0].left)
    expect(s.score).toBe(PERFECT_POINTS)
    expect(s.perfects).toBe(1)
    expect(s.chunks).toHaveLength(0)
    expect(s.popups).toHaveLength(1)
  })

  it('an off-centre drop trims the overhang, which falls off the correct side', () => {
    const start = initialState(easy)
    const base = start.placed[0]
    const s = drop(withMovingAt(start, base.left + 10), easy)
    expect(s.placed[1]).toMatchObject({ left: base.left + 10, width: easy.width - 10 })
    expect(s.score).toBe(1)
    expect(s.streak).toBe(0)
    expect(s.chunks).toEqual([expect.objectContaining({ left: base.left + easy.width, width: 10, side: 'right' })])

    const t = drop(withMovingAt(start, base.left - 12), easy)
    expect(t.placed[1]).toMatchObject({ left: base.left, width: easy.width - 12 })
    expect(t.chunks[0]).toMatchObject({ left: base.left - 12, width: 12, side: 'left' })
  })

  it('the next block has the new width and comes from the other side', () => {
    const start = initialState(easy)
    const s = drop(withMovingAt(start, start.placed[0].left + 10), easy)
    expect(s.moving.width).toBe(s.placed[1].width)
    expect(s.moving.dir).toBe(-1)
    expect(s.moving.left).toBe(slideBounds(s.moving.width).max)
  })

  it('missing the tower completely ends the game', () => {
    const start = initialState(easy)
    const s = drop(withMovingAt(start, start.placed[0].left + easy.width + 1), easy)
    expect(s.over).toBe(true)
    expect(s.placed).toHaveLength(1)
    expect(s.chunks[0].width).toBe(easy.width)
    expect(drop(s, easy)).toBe(s)
  })

  it(`after ${GROW_AFTER_STREAK} perfects in a row the tower grows back, never past the start width`, () => {
    const start = initialState(easy)
    let s = drop(withMovingAt(start, start.placed[0].left + 20), easy)
    const narrow = s.placed[1].width
    for (let i = 0; i < GROW_AFTER_STREAK; i++) s = perfectDrop(s)
    expect(s.placed[s.placed.length - 1].width).toBe(narrow)
    s = perfectDrop(s)
    expect(s.placed[s.placed.length - 1].width).toBeGreaterThan(narrow)
    for (let i = 0; i < 20; i++) s = perfectDrop(s)
    const top = s.placed[s.placed.length - 1]
    expect(top.width).toBe(easy.width)
    expect(top.left).toBeGreaterThanOrEqual(0)
    expect(top.left + top.width).toBeLessThanOrEqual(WORLD_WIDTH)
  })
})

describe('effects', () => {
  it('falling pieces and popups disappear after a moment', () => {
    const start = initialState(easy)
    let s = drop(withMovingAt(start, start.placed[0].left + 10), easy)
    s = perfectDrop(s)
    expect(s.chunks.length + s.popups.length).toBe(2)
    for (let i = 0; i < 90; i++) s = step(s, 1 / 60, easy)
    expect(s.chunks).toHaveLength(0)
    expect(s.popups).toHaveLength(0)
  })

  it('a steady player on easy can build a tall tower', () => {
    let s = initialState(easy)
    for (let i = 0; i < 40; i++) s = drop(withMovingAt(s, s.placed[s.placed.length - 1].left + (i % 2 ? 2 : -2)), easy)
    expect(s.over).toBe(false)
    expect(s.placed).toHaveLength(41)
  })
})
