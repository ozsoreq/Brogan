export type Difficulty = 'easy' | 'medium' | 'hard'

export const DIFFICULTIES: Record<Difficulty, { label: string; grades: string; pairs: number; columns: number }> = {
  easy: { label: 'קל', grades: 'כיתות א׳-ב׳', pairs: 6, columns: 3 },
  medium: { label: 'בינוני', grades: 'כיתות ב׳-ג׳', pairs: 8, columns: 4 },
  hard: { label: 'קשה', grades: 'כיתות ג׳-ד׳', pairs: 10, columns: 4 },
}

// Visually distinct, easily recognizable pictures - no two look alike.
const EMOJI_POOL = [
  '🐶', '🐱', '🦁', '🐸', '🐵', '🐼', '🦊', '🐷', '🐙', '🦋',
  '🐢', '🦄', '🍎', '🍌', '🍓', '🍉', '🍕', '🍦', '⚽', '🎈',
  '🚗', '🚀', '🌈', '⭐', '🌻', '🎸', '🏠', '👑', '🎁', '☂️',
]

export interface Card {
  id: number
  emoji: string
}

export interface MemoryState {
  cards: Card[]
  flipped: number[]
  matched: string[]
  moves: number
  won: boolean
}

export type MemoryAction = { type: 'flip'; index: number } | { type: 'hideMismatch' } | { type: 'reset'; cards: Card[] }

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function buildDeck(pairs: number): Card[] {
  const emojis = shuffle(EMOJI_POOL).slice(0, pairs)
  return shuffle([...emojis, ...emojis]).map((emoji, id) => ({ id, emoji }))
}

export function initialState(cards: Card[]): MemoryState {
  return { cards, flipped: [], matched: [], moves: 0, won: false }
}

export function memoryReducer(state: MemoryState, action: MemoryAction): MemoryState {
  switch (action.type) {
    case 'reset':
      return initialState(action.cards)

    case 'hideMismatch':
      return state.flipped.length === 2 ? { ...state, flipped: [] } : state

    case 'flip': {
      const { index } = action
      const card = state.cards[index]
      if (
        state.won ||
        !card ||
        state.flipped.length === 2 ||
        state.flipped.includes(index) ||
        state.matched.includes(card.emoji)
      ) {
        return state
      }

      const flipped = [...state.flipped, index]
      if (flipped.length < 2) return { ...state, flipped }

      const moves = state.moves + 1
      const [first, second] = flipped.map((i) => state.cards[i])
      if (first.emoji !== second.emoji) return { ...state, flipped, moves }

      const matched = [...state.matched, first.emoji]
      return { ...state, flipped: [], matched, moves, won: matched.length * 2 === state.cards.length }
    }
  }
}

// Perfect play needs `pairs` moves; stars loosen from there.
export function starsFor(moves: number, pairs: number): 1 | 2 | 3 {
  if (moves <= Math.ceil(pairs * 1.5)) return 3
  if (moves <= Math.ceil(pairs * 2.2)) return 2
  return 1
}
