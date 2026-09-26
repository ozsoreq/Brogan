import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { buildDeck, DIFFICULTIES, initialState, memoryReducer, type Difficulty } from './memoryLogic'

const MISMATCH_DELAY_MS = 900

function bestKey(difficulty: Difficulty) {
  return `brogan-memory-best-${difficulty}`
}

function loadBest(difficulty: Difficulty): number | null {
  try {
    const n = Number(localStorage.getItem(bestKey(difficulty)))
    return Number.isFinite(n) && n > 0 ? n : null
  } catch {
    return null
  }
}

export function useMemoryGame(difficulty: Difficulty) {
  const { pairs } = DIFFICULTIES[difficulty]
  const [state, dispatch] = useReducer(memoryReducer, pairs, (p) => initialState(buildDeck(p)))
  // Best score as it was when this game started, so the win screen can
  // compare against it.
  const [bestAtStart, setBestAtStart] = useState(() => loadBest(difficulty))

  const startedAt = useRef<number | null>(null)
  const [seconds, setSeconds] = useState(0)

  // Show a wrong pair briefly, then flip it back.
  useEffect(() => {
    if (state.flipped.length !== 2) return
    const t = setTimeout(() => dispatch({ type: 'hideMismatch' }), MISMATCH_DELAY_MS)
    return () => clearTimeout(t)
  }, [state.flipped])

  // Clock starts on the first flip and stops on win.
  useEffect(() => {
    if (state.won) return
    const t = setInterval(() => {
      if (startedAt.current) setSeconds(Math.floor((Date.now() - startedAt.current) / 1000))
    }, 250)
    return () => clearInterval(t)
  }, [state.won])

  const isNewRecord = state.won && (bestAtStart === null || state.moves < bestAtStart)
  const best = isNewRecord ? state.moves : bestAtStart

  useEffect(() => {
    if (!isNewRecord) return
    try {
      localStorage.setItem(bestKey(difficulty), String(state.moves))
    } catch {
      // storage unavailable - record just isn't kept
    }
  }, [isNewRecord, state.moves, difficulty])

  const flip = useCallback((index: number) => {
    if (startedAt.current === null) startedAt.current = Date.now()
    dispatch({ type: 'flip', index })
  }, [])

  const restart = useCallback(() => {
    startedAt.current = null
    setSeconds(0)
    setBestAtStart(loadBest(difficulty))
    dispatch({ type: 'reset', cards: buildDeck(pairs) })
  }, [pairs, difficulty])

  return { ...state, pairs, seconds, best, isNewRecord, flip, restart }
}
