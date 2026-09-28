export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  label: string
  grades: string
  detail: string
  pads: number
  /** How long each step of the sequence is shown, at the start. */
  stepMs: number
  /** The sequence speeds up as it grows, down to this. */
  minStepMs: number
  lives: number
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { label: 'קל', grades: 'כיתות א׳-ב׳', detail: '4 חיות, לאט, 3 ❤️', pads: 4, stepMs: 850, minStepMs: 600, lives: 3 },
  medium: { label: 'בינוני', grades: 'כיתות ב׳-ג׳', detail: '4 חיות, מהר יותר', pads: 4, stepMs: 650, minStepMs: 420, lives: 2 },
  hard: { label: 'קשה', grades: 'כיתות ג׳-ד׳', detail: '6 חיות, מהיר!', pads: 6, stepMs: 520, minStepMs: 320, lives: 1 },
}

// Each pad has its own animal, colour and musical note (a pentatonic scale, so
// any sequence sounds pleasant).
export const PADS = [
  { animal: '🐶', name: 'כלב', color: 'bg-rose-500', lit: 'bg-rose-300', note: 262 },
  { animal: '🐸', name: 'צפרדע', color: 'bg-emerald-500', lit: 'bg-emerald-300', note: 294 },
  { animal: '🐱', name: 'חתול', color: 'bg-sky-500', lit: 'bg-sky-300', note: 330 },
  { animal: '🐵', name: 'קוף', color: 'bg-amber-400', lit: 'bg-amber-200', note: 392 },
  { animal: '🐷', name: 'חזיר', color: 'bg-pink-500', lit: 'bg-pink-300', note: 440 },
  { animal: '🦁', name: 'אריה', color: 'bg-orange-500', lit: 'bg-orange-300', note: 523 },
] as const

export interface SimonState {
  sequence: number[]
  /** How many steps of the current sequence have been repeated so far. */
  inputIndex: number
  lives: number
  /** Length of the longest sequence repeated in full. */
  best: number
  over: boolean
}

export type PressResult = 'correct' | 'roundComplete' | 'mistake' | 'gameOver' | 'ignored'

type Rng = () => number

export function randomPad(cfg: DifficultyConfig, rng: Rng = Math.random) {
  return Math.floor(rng() * cfg.pads)
}

export function initialState(cfg: DifficultyConfig, rng: Rng = Math.random): SimonState {
  return { sequence: [randomPad(cfg, rng)], inputIndex: 0, lives: cfg.lives, best: 0, over: false }
}

/** How long each step is shown: a little quicker as the sequence grows. */
export function stepDuration(length: number, cfg: DifficultyConfig) {
  return Math.max(cfg.minStepMs, cfg.stepMs - (length - 1) * 20)
}

export function press(
  state: SimonState,
  pad: number,
  cfg: DifficultyConfig,
  rng: Rng = Math.random,
): { state: SimonState; result: PressResult } {
  if (state.over || pad < 0 || pad >= cfg.pads) return { state, result: 'ignored' }

  if (pad !== state.sequence[state.inputIndex]) {
    const lives = state.lives - 1
    // A mistake replays the same sequence from the start, while lives last.
    return lives > 0
      ? { state: { ...state, lives, inputIndex: 0 }, result: 'mistake' }
      : { state: { ...state, lives: 0, inputIndex: 0, over: true }, result: 'gameOver' }
  }

  const inputIndex = state.inputIndex + 1
  if (inputIndex < state.sequence.length) return { state: { ...state, inputIndex }, result: 'correct' }

  return {
    state: {
      ...state,
      best: state.sequence.length,
      sequence: [...state.sequence, randomPad(cfg, rng)],
      inputIndex: 0,
    },
    result: 'roundComplete',
  }
}
