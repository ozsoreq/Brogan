import { describe, expect, it } from 'vitest'
import { buildLevel, TOTAL_LEVELS } from './levels'

function expectedShape(level: number): { questions: number; options: number } {
  if (level <= 10) return { questions: 2, options: 2 }
  if (level <= 20) return { questions: 3, options: 3 }
  if (level <= 30) return { questions: 4, options: 3 }
  if (level <= 40) return { questions: 4, options: 4 }
  return { questions: 5, options: 4 }
}

describe('hebrew story levels', () => {
  it('has exactly 50 levels with distinct titles and stories', () => {
    const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => buildLevel(i + 1))
    expect(levels).toHaveLength(50)
    expect(new Set(levels.map((l) => l.title)).size).toBe(50)
    expect(new Set(levels.map((l) => l.story)).size).toBe(50)
  })

  for (let level = 1; level <= TOTAL_LEVELS; level++) {
    it(`level ${level} follows its difficulty tier and is answerable`, () => {
      const { questions, options } = expectedShape(level)
      const built = buildLevel(level)
      expect(built.story.trim().length).toBeGreaterThan(0)
      expect(built.questions).toHaveLength(questions)

      for (const q of built.questions) {
        expect(q.prompt.trim()).toMatch(/\?$/)
        expect(q.options).toHaveLength(options)
        expect(new Set(q.options).size).toBe(options)
        expect(q.correctIndex).toBeGreaterThanOrEqual(0)
        expect(q.options.every((o) => o.trim().length > 0)).toBe(true)
      }
    })
  }

  it('stories grow longer across tiers', () => {
    const avgWords = (from: number, to: number) => {
      const counts = []
      for (let l = from; l <= to; l++) counts.push(buildLevel(l).story.split(/\s+/).length)
      return counts.reduce((a, b) => a + b, 0) / counts.length
    }
    const tiers = [avgWords(1, 10), avgWords(11, 20), avgWords(21, 30), avgWords(31, 40), avgWords(41, 50)]
    for (let i = 1; i < tiers.length; i++) expect(tiers[i]).toBeGreaterThan(tiers[i - 1])
  })
})
