import { describe, expect, it } from 'vitest'
import { buildRounds, WORD_BANK_ENTRIES } from './words'

const FINAL_LETTERS = ['ך', 'ם', 'ן', 'ף', 'ץ']

describe('word bank', () => {
  it('has at least 500 unique words', () => {
    const words = WORD_BANK_ENTRIES.map((e) => e.word)
    expect(new Set(words).size).toBe(words.length)
    expect(words.length).toBeGreaterThanOrEqual(500)
  })

  it('never uses one emoji for two different words', () => {
    const byEmoji = new Map<string, string[]>()
    for (const { word, emoji } of WORD_BANK_ENTRIES) {
      byEmoji.set(emoji, [...(byEmoji.get(emoji) ?? []), word])
    }
    const shared = [...byEmoji].filter(([, words]) => words.length > 1)
    expect(shared).toEqual([])
  })

  it('contains only single words with a non-empty emoji', () => {
    for (const { word, emoji } of WORD_BANK_ENTRIES) {
      expect(word, word).not.toMatch(/\s/)
      expect(emoji.trim(), word).not.toBe('')
    }
  })

  it('writes final-form letters only at the end of a word', () => {
    for (const { word } of WORD_BANK_ENTRIES) {
      const inner = [...word].slice(0, -1)
      expect(inner.some((ch) => FINAL_LETTERS.includes(ch)), word).toBe(false)
    }
  })
})

describe('buildRounds', () => {
  const bankWords = new Set(WORD_BANK_ENTRIES.map((e) => e.word))

  it('builds 10 valid, unambiguous rounds every time', () => {
    for (let game = 0; game < 300; game++) {
      const rounds = buildRounds()
      expect(rounds).toHaveLength(10)
      expect(new Set(rounds.map((r) => r.word)).size).toBe(10)

      for (const r of rounds) {
        expect(r.correctLetter).toBe(r.word[r.blankIndex])
        expect(FINAL_LETTERS).not.toContain(r.correctLetter)
        expect(r.options).toHaveLength(10)
        expect(new Set(r.options).size).toBe(10)
        expect(r.options).toContain(r.correctLetter)

        for (const letter of r.options) {
          if (letter === r.correctLetter) continue
          const alt = r.word.slice(0, r.blankIndex) + letter + r.word.slice(r.blankIndex + 1)
          expect(bankWords.has(alt), `${r.word} -> ${alt}`).toBe(false)
        }
      }
    }
  })
})
