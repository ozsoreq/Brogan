import { useCallback, useEffect, useRef, useState } from 'react'
import { DIFFICULTIES, initialState, ROUND_SECONDS, tick, whack, type Difficulty } from './whackLogic'

const TICK_MS = 50
const COUNTDOWN_STEP_MS = 800

export type Phase = 'countdown' | 'playing' | 'over'

function bestKey(difficulty: Difficulty) {
  return `brogan-whack-best-${difficulty}`
}

function loadBest(difficulty: Difficulty): number | null {
  try {
    const raw = localStorage.getItem(bestKey(difficulty))
    const n = raw === null ? NaN : Number(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export function useWhackGame(difficulty: Difficulty) {
  const cfg = DIFFICULTIES[difficulty]
  const [phase, setPhase] = useState<Phase>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [state, setState] = useState(() => initialState(Date.now()))
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [bestAtStart, setBestAtStart] = useState(() => loadBest(difficulty))
  const endAt = useRef(0)

  useEffect(() => {
    if (phase !== 'countdown') return
    const t = setTimeout(() => {
      if (countdown > 1) {
        setCountdown((c) => c - 1)
        return
      }
      const now = Date.now()
      endAt.current = now + ROUND_SECONDS * 1000
      setState(initialState(now))
      setTimeLeft(ROUND_SECONDS)
      setPhase('playing')
    }, COUNTDOWN_STEP_MS)
    return () => clearTimeout(t)
  }, [phase, countdown])

  useEffect(() => {
    if (phase !== 'playing') return
    const t = setInterval(() => {
      const now = Date.now()
      if (now >= endAt.current) {
        setTimeLeft(0)
        setState((s) => ({ ...s, holes: s.holes.map(() => null) }))
        setPhase('over')
        return
      }
      setTimeLeft(Math.ceil((endAt.current - now) / 1000))
      setState((s) => tick(s, now, cfg))
    }, TICK_MS)
    return () => clearInterval(t)
  }, [phase, cfg])

  const isNewRecord = phase === 'over' && state.score > 0 && (bestAtStart === null || state.score > bestAtStart)
  const best = isNewRecord ? state.score : bestAtStart

  useEffect(() => {
    if (!isNewRecord) return
    try {
      localStorage.setItem(bestKey(difficulty), String(state.score))
    } catch {
      // storage unavailable - record just isn't kept
    }
  }, [isNewRecord, state.score, difficulty])

  const whackAt = useCallback(
    (index: number) => {
      if (phase !== 'playing') return
      setState((s) => whack(s, index, Date.now()))
    },
    [phase],
  )

  const restart = useCallback(() => {
    setBestAtStart(loadBest(difficulty))
    setState(initialState(Date.now()))
    setTimeLeft(ROUND_SECONDS)
    setCountdown(3)
    setPhase('countdown')
  }, [difficulty])

  return { cfg, phase, countdown, timeLeft, ...state, best, isNewRecord, whackAt, restart }
}
