import { describe, expect, it } from 'vitest'
import fixture from './plainText.fixture.json'
import { buildLevel } from './levels'
import { NIKUD, stripNikud } from './nikud'

// Consonant skeleton: no nikud, and no ו/י, whose use as vowel letters
// legitimately differs between plain and vocalized spelling (אדום / אָדֹם).
const skeleton = (s: string) => stripNikud(s).replace(/[וי]/g, '')

function levelTexts(level: number) {
  const l = buildLevel(level)
  return [l.title, l.story, ...l.questions.flatMap((q) => [q.prompt, ...q.options])]
}

describe('nikud for levels 1-20', () => {
  it('the plain texts of levels 1-20 are unchanged', () => {
    for (let level = 1; level <= 20; level++) {
      const f = fixture[level - 1]
      const l = buildLevel(level)
      expect(l.title).toBe(f.title)
      expect(l.story).toBe(f.story)
      expect(l.questions.map((q) => q.prompt)).toEqual(f.questions.map((q) => q.prompt))
    }
  })

  it('every text in levels 1-20 has a vocalized version', () => {
    for (let level = 1; level <= 20; level++) {
      for (const text of levelTexts(level)) expect(NIKUD[text], `missing nikud for "${text}"`).toBeDefined()
    }
  })

  it('each vocalized text has exactly the same letters as its plain text (apart from ו/י)', () => {
    for (const [plain, vocalized] of Object.entries(NIKUD)) {
      expect(skeleton(vocalized), `"${vocalized}"`).toBe(skeleton(plain))
    }
  })

  it('is actually vocalized: letters carry marks', () => {
    for (const vocalized of Object.values(NIKUD)) {
      const letters = [...stripNikud(vocalized)].filter((c) => /[א-ת]/.test(c)).length
      const marks = (vocalized.match(/[ְ-ׇּׁׂ]/g) ?? []).length
      expect(marks, `"${vocalized}"`).toBeGreaterThanOrEqual(Math.max(1, letters * 0.3))
    }
  })

  it('stays within levels 1-20', () => {
    const early = new Set(Array.from({ length: 20 }, (_, i) => levelTexts(i + 1)).flat())
    for (const key of Object.keys(NIKUD)) expect(early.has(key), key).toBe(true)
  })
})
