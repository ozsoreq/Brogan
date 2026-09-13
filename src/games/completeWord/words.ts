export interface WordEntry {
  word: string
  emoji: string
  blankIndex: number
}

export interface Round {
  word: string
  emoji: string
  blankIndex: number
  correctLetter: string
  options: string[]
}

const HEBREW_ALPHABET = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
  'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת',
]

const WORD_BANK: WordEntry[] = [
  { word: 'אבא', emoji: '👨', blankIndex: 1 },
  { word: 'אמא', emoji: '👩', blankIndex: 1 },
  { word: 'בית', emoji: '🏠', blankIndex: 0 },
  { word: 'ילד', emoji: '👦', blankIndex: 1 },
  { word: 'ילדה', emoji: '👧', blankIndex: 2 },
  { word: 'כלב', emoji: '🐶', blankIndex: 0 },
  { word: 'חתול', emoji: '🐱', blankIndex: 0 },
  { word: 'שמש', emoji: '☀️', blankIndex: 1 },
  { word: 'ירח', emoji: '🌙', blankIndex: 1 },
  { word: 'ספר', emoji: '📖', blankIndex: 0 },
  { word: 'עץ', emoji: '🌳', blankIndex: 0 },
  { word: 'מים', emoji: '💧', blankIndex: 1 },
  { word: 'דג', emoji: '🐟', blankIndex: 0 },
  { word: 'תפוח', emoji: '🍎', blankIndex: 1 },
  { word: 'פרח', emoji: '🌸', blankIndex: 1 },
]

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const ROUNDS_PER_GAME = 10
const OPTIONS_PER_ROUND = 10

function buildOptions(correctLetter: string): string[] {
  const distractorPool = HEBREW_ALPHABET.filter((letter) => letter !== correctLetter)
  const distractors = shuffle(distractorPool).slice(0, OPTIONS_PER_ROUND - 1)
  return shuffle([correctLetter, ...distractors])
}

export function buildRounds(): Round[] {
  const chosenWords = shuffle(WORD_BANK).slice(0, ROUNDS_PER_GAME)
  return chosenWords.map((entry) => ({
    word: entry.word,
    emoji: entry.emoji,
    blankIndex: entry.blankIndex,
    correctLetter: entry.word[entry.blankIndex],
    options: buildOptions(entry.word[entry.blankIndex]),
  }))
}
