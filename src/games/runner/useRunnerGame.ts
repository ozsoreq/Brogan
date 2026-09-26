import { useCallback, useEffect, useRef, useState } from 'react'
import { initialState, isGrounded, score, step } from './runnerLogic'

// A tap slightly before landing still counts, so jumps don't feel "eaten".
const JUMP_BUFFER_MS = 150
const BEST_KEY = 'brogan-runner-best'

export type Phase = 'ready' | 'playing' | 'over'

function loadBest(): number | null {
  try {
    const raw = localStorage.getItem(BEST_KEY)
    const n = raw === null ? NaN : Number(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export function useRunnerGame() {
  const [state, setState] = useState(initialState)
  const [phase, setPhase] = useState<Phase>('ready')
  const [bestAtStart, setBestAtStart] = useState(loadBest)
  const stateRef = useRef(state)
  const jumpRequestedAt = useRef(-Infinity)

  useEffect(() => {
    if (phase !== 'playing') return
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      const prev = stateRef.current
      const wantsJump = now - jumpRequestedAt.current < JUMP_BUFFER_MS
      const next = step(prev, dt, wantsJump)
      if (wantsJump && isGrounded(prev) && !isGrounded(next)) jumpRequestedAt.current = -Infinity
      stateRef.current = next
      setState(next)
      if (next.over) {
        setPhase('over')
        return
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [phase])

  const finalScore = score(state)
  const isNewRecord = phase === 'over' && finalScore > 0 && (bestAtStart === null || finalScore > bestAtStart)
  const best = isNewRecord ? finalScore : bestAtStart

  useEffect(() => {
    if (!isNewRecord) return
    try {
      localStorage.setItem(BEST_KEY, String(finalScore))
    } catch {
      // storage unavailable - record just isn't kept
    }
  }, [isNewRecord, finalScore])

  const start = useCallback(() => {
    const fresh = initialState()
    stateRef.current = fresh
    jumpRequestedAt.current = -Infinity
    setState(fresh)
    setBestAtStart(loadBest())
    setPhase('playing')
  }, [])

  // One control for everything: tap to start, tap to jump.
  const press = useCallback(() => {
    if (phase === 'ready') start()
    else if (phase === 'playing') jumpRequestedAt.current = performance.now()
  }, [phase, start])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        press()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press])

  return { state, phase, score: finalScore, best, isNewRecord, press, restart: start }
}
