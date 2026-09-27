import { useCallback, useEffect, useRef, useState } from 'react'
import { DIFFICULTIES, drop, initialState, step, type Difficulty } from './stackLogic'

export type Phase = 'ready' | 'playing' | 'over'

function bestKey(difficulty: Difficulty) {
  return `brogan-stack-best-${difficulty}`
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

export function useStackGame(difficulty: Difficulty) {
  const cfg = DIFFICULTIES[difficulty]
  const [state, setState] = useState(() => initialState(cfg))
  const [phase, setPhase] = useState<Phase>('ready')
  const [bestAtStart, setBestAtStart] = useState(() => loadBest(difficulty))

  const stateRef = useRef(state)
  const pendingDrop = useRef(false)

  // Drops are applied inside the loop so they land exactly where the block is drawn.
  useEffect(() => {
    if (phase !== 'playing') return
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      let s = step(stateRef.current, (now - last) / 1000, cfg)
      last = now
      if (pendingDrop.current) {
        s = drop(s, cfg)
        pendingDrop.current = false
      }
      stateRef.current = s
      setState(s)
      if (s.over) {
        setPhase('over')
        return
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
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

  const restart = useCallback(() => {
    const fresh = initialState(cfg)
    stateRef.current = fresh
    pendingDrop.current = false
    setState(fresh)
    setBestAtStart(loadBest(difficulty))
    setPhase('ready')
  }, [cfg, difficulty])

  // One button for everything: the first tap starts, every tap after that drops a block.
  const tap = useCallback(() => {
    if (phase === 'ready') setPhase('playing')
    else if (phase === 'playing') pendingDrop.current = true
  }, [phase])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter' && e.key !== 'ArrowDown') return
      if (e.repeat) return
      e.preventDefault()
      tap()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tap])

  return { cfg, state, phase, best, isNewRecord, tap, restart }
}
