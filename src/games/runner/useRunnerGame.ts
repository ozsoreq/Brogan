import { useCallback, useEffect, useRef, useState } from 'react'
import { DIFFICULTIES, initialState, isGrounded, score, step, type Difficulty } from './runnerLogic'

// A tap slightly before landing still counts, so jumps don't feel "eaten".
const JUMP_BUFFER_MS = 150

export type Phase = 'ready' | 'playing' | 'over'

function bestKey(difficulty: Difficulty) {
  return `brogan-runner-best-${difficulty}`
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

export function useRunnerGame(difficulty: Difficulty) {
  const cfg = DIFFICULTIES[difficulty]
  const [state, setState] = useState(() => initialState(cfg))
  const [phase, setPhase] = useState<Phase>('ready')
  const [bestAtStart, setBestAtStart] = useState(() => loadBest(difficulty))
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
      const next = step(prev, dt, wantsJump, Math.random, cfg)
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
  }, [phase, cfg])

  const finalScore = score(state)
  const isNewRecord = phase === 'over' && finalScore > 0 && (bestAtStart === null || finalScore > bestAtStart)
  const best = isNewRecord ? finalScore : bestAtStart

  useEffect(() => {
    if (!isNewRecord) return
    try {
      localStorage.setItem(bestKey(difficulty), String(finalScore))
    } catch {
      // storage unavailable - record just isn't kept
    }
  }, [isNewRecord, finalScore, difficulty])

  const start = useCallback(() => {
    const fresh = initialState(cfg)
    stateRef.current = fresh
    jumpRequestedAt.current = -Infinity
    setState(fresh)
    setBestAtStart(loadBest(difficulty))
    setPhase('playing')
  }, [cfg, difficulty])

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

  return { cfg, state, phase, score: finalScore, best, isNewRecord, press, restart: start }
}
