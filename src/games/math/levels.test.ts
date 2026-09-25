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

  it('gets harder: level 50 numbers are larger than level 1 numbers', () => {
    const maxAt = (level: number) =>
      Math.max(...Array.from({ length: 30 }, () => buildLevelExercises(level)).flat().map((e) => e.answer))
    expect(maxAt(50)).toBeGreaterThan(maxAt(1) * 5)
  })
})
