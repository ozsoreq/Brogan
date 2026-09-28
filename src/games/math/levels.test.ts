import { describe, expect, it } from 'vitest'
import { buildLevelExercises, EXERCISES_PER_LEVEL, TOTAL_LEVELS, type MathExercise } from './levels'

function evaluate(e: MathExercise): number {
  switch (e.operator) {
    case '+':
      return e.a + e.b
    case '−':
      return e.a - e.b
    case '×':
      return e.a * e.b
    case '÷':
      return e.a / e.b
  }
}

describe('math levels', () => {
  for (let level = 1; level <= TOTAL_LEVELS; level++) {
    it(`level ${level} always produces valid exercises`, () => {
      for (let trial = 0; trial < 40; trial++) {
        const exercises = buildLevelExercises(level)
        expect(exercises).toHaveLength(EXERCISES_PER_LEVEL)

        const keys = exercises.map((e) => `${e.a}${e.operator}${e.b}`)
        expect(new Set(keys).size, 'no repeated exercise in a level').toBe(keys.length)

        for (const e of exercises) {
          expect(evaluate(e)).toBe(e.answer)
          expect(Number.isInteger(e.answer)).toBe(true)
          expect(e.answer).toBeGreaterThanOrEqual(0)
          expect(e.options).toHaveLength(4)
          expect(new Set(e.options).size).toBe(4)
          expect(e.options).toContain(e.answer)
          expect(e.options.every((o) => o >= 0)).toBe(true)
          if (level < 10) expect(e.operator).not.toBe('×')
          if (level < 15) expect(e.operator).not.toBe('÷')
        }
      }
    })
  }

  it('introduces × at level 10 and ÷ at level 15', () => {
    const opsAt = (level: number) =>
      new Set(Array.from({ length: 30 }, () => buildLevelExercises(level)).flat().map((e) => e.operator))
    expect(opsAt(10).has('×')).toBe(true)
    expect(opsAt(15).has('÷')).toBe(true)
  })

  it('from level 5 there are no free exercises (+0, −0, ×1, ÷1)', () => {
    for (let level = 5; level <= TOTAL_LEVELS; level += 5) {
      for (const e of Array.from({ length: 20 }, () => buildLevelExercises(level)).flat()) {
        if (e.operator === '+' || e.operator === '−') expect(e.b).toBeGreaterThan(0)
        if (e.operator === '+') expect(e.a).toBeGreaterThan(0)
        if (e.operator === '×') expect(Math.min(e.a, e.b)).toBeGreaterThan(1)
        if (e.operator === '÷') expect(Math.min(e.b, e.answer)).toBeGreaterThan(1)
      }
    }
  })

  it('wrong options are mostly real mistakes, not random numbers', () => {
    // For ×, a neighbouring times-table entry (a·(b±1) or (a±1)·b) should usually be offered.
    const products = Array.from({ length: 30 }, () => buildLevelExercises(30)).flat().filter((e) => e.operator === '×')
    const withNeighbour = products.filter((e) =>
      e.options.some((o) => o !== e.answer && [e.a * (e.b + 1), e.a * (e.b - 1), (e.a + 1) * e.b, (e.a - 1) * e.b].includes(o)),
    )
    expect(withNeighbour.length / products.length).toBeGreaterThan(0.8)
  })

  it('gets harder: level 50 numbers are larger than level 1 numbers', () => {
    const maxAt = (level: number) =>
      Math.max(...Array.from({ length: 30 }, () => buildLevelExercises(level)).flat().map((e) => e.answer))
    expect(maxAt(50)).toBeGreaterThan(maxAt(1) * 5)
  })
})
