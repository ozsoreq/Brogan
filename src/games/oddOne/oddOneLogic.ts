export type Difficulty = 'easy' | 'medium' | 'hard'

export const ROUND_SECONDS = 60
// The grid grows after this many finds.
export const FINDS_PER_SIZE = 3

// Pairs of pictures: one fills the grid, the other hides in it once.
// All are long-established emoji, so every phone can draw them.
const EASY_PAIRS: [string, string][] = [
  ['🍎', '🍌'], ['🐶', '🐱'], ['⭐', '🌙'], ['🚗', '🚲'], ['⚽', '🏀'], ['🌸', '🍀'],
  ['🐟', '🐦'], ['🍦', '🍕'], ['🎈', '🎁'], ['🐸', '🐷'], ['🍓', '🥕'], ['🐝', '🦋'],
]
const MEDIUM_PAIRS: [string, string][] = [
  ['🍎', '🍅'], ['🐶', '🐺'], ['🍊', '🍑'], ['🐸', '🐢'], ['🚗', '🚕'], ['⚽', '🏐'],
  ['🌻', '🌼'], ['🐝', '🐞'], ['🍇', '🍒'], ['🐯', '🦁'], ['🌲', '🌳'], ['🍋', '🍌'],
]
const HARD_PAIRS: [string, string][] = [
  ['😀', '😃'], ['🙂', '😊'], ['😺', '😸'], ['🌕', '🌝'], ['🐻', '🐨'], ['🐭', '🐹'],
  ['🍏', '🍎'], ['🕐', '🕑'], ['🚙', '🚗'], ['🐳', '🐋'], ['😐', '😑'], ['🌑', '🌚'],
]

export interface DifficultyConfig {
  label: string
  grades: string
  detail: string
  /** Grid size (cells per side) as finds pile up; the last one repeats. */
  sizes: number[]
  pairs: [string, string][]
  /** Seconds lost on a wrong tap. */
  penalty: number
  /** On easy, the odd picture starts to wiggle after this long. */
  hintAfter: number | null
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'קל',
    grades: 'כיתות א׳-ב׳',
    detail: 'תמונות שונות מאוד',
    sizes: [3, 3, 4, 4, 5],
    pairs: EASY_PAIRS,
    penalty: 1,
    hintAfter: 5,
  },
  medium: {
    label: 'בינוני',
    grades: 'כיתות ב׳-ג׳',
    detail: 'תמונות דומות',
    sizes: [4, 5, 5, 6],
    pairs: MEDIUM_PAIRS,
    penalty: 2,
    hintAfter: null,
  },
  hard: {
    label: 'קשה',
    grades: 'כיתות ג׳-ד׳',
    detail: 'כמעט זהות! 🔍',
    sizes: [5, 6, 6, 7],
    pairs: HARD_PAIRS,
    penalty: 3,
    hintAfter: null,
  },
}

export interface Round {
  size: number
  base: string
  odd: string
  oddIndex: number
  pairIndex: number
  /** Game time (seconds) when this round appeared, for the easy-level hint. */
  startedAt: number
}

export interface OddOneState {
  round: Round
  found: number
  mistakes: number
  /** Game time elapsed, in seconds. */
  elapsed: number
  over: boolean
}

export type TapResult = 'found' | 'miss' | 'ignored'

type Rng = () => number

export function sizeFor(found: number, cfg: DifficultyConfig) {
  return cfg.sizes[Math.min(cfg.sizes.length - 1, Math.floor(found / FINDS_PER_SIZE))]
}

export function makeRound(cfg: DifficultyConfig, found: number, startedAt: number, rng: Rng = Math.random, previousPair = -1): Round {
  let pairIndex = Math.floor(rng() * cfg.pairs.length)
  if (pairIndex === previousPair) pairIndex = (pairIndex + 1) % cfg.pairs.length
  // Either picture of the pair may be the one that hides.
  const [a, b] = cfg.pairs[pairIndex]
  const [base, odd] = rng() < 0.5 ? [a, b] : [b, a]
  const size = sizeFor(found, cfg)
  return { size, base, odd, oddIndex: Math.floor(rng() * size * size), pairIndex, startedAt }
}

export function initialState(cfg: DifficultyConfig, rng: Rng = Math.random): OddOneState {
  return { round: makeRound(cfg, 0, 0, rng), found: 0, mistakes: 0, elapsed: 0, over: false }
}

export function timeLeft(state: OddOneState) {
  return Math.max(0, ROUND_SECONDS - state.elapsed)
}

export function tick(state: OddOneState, dtSeconds: number): OddOneState {
  if (state.over) return state
  const elapsed = state.elapsed + Math.min(dtSeconds, 0.25)
  return { ...state, elapsed, over: elapsed >= ROUND_SECONDS }
}

export function tapCell(
  state: OddOneState,
  index: number,
  cfg: DifficultyConfig,
  rng: Rng = Math.random,
): { state: OddOneState; result: TapResult } {
  const { round } = state
  if (state.over || index < 0 || index >= round.size * round.size) return { state, result: 'ignored' }

  if (index === round.oddIndex) {
    const found = state.found + 1
    return {
      state: { ...state, found, round: makeRound(cfg, found, state.elapsed, rng, round.pairIndex) },
      result: 'found',
    }
  }

  const elapsed = state.elapsed + cfg.penalty
  return { state: { ...state, mistakes: state.mistakes + 1, elapsed, over: elapsed >= ROUND_SECONDS }, result: 'miss' }
}

/** On easy, the odd picture wiggles once the child has been looking for a while. */
export function showHint(state: OddOneState, cfg: DifficultyConfig) {
  return cfg.hintAfter !== null && state.elapsed - state.round.startedAt >= cfg.hintAfter
}
