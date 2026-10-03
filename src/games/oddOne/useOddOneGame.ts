import { useCallback, useEffect, useRef, useState } from 'react'
import { usePause } from '../../lib/usePause'
import { play } from '../../lib/sound'
import { DIFFICULTIES, initialState, tapCell, tick, type Difficulty } from './oddOneLogic'

export type Phase = 'ready' | 'playing' | 'over'

const MISS_FLASH_MS = 400

function bestKey(difficulty: Difficulty) {
  return `brogan-oddone-best-${difficulty}`
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

export function useOddOneGame(difficulty: Difficulty) {
  const cfg = DIFFICULTIES[difficulty]
  const [state, setState] = useState(() => initialState(cfg))
  const [phase, setPhase] = useState<Phase>('ready')
  const [missed, setMissed] = useState<number | null>(null)
  const [bestAtStart, setBestAtStart] = useState(() => loadBest(difficulty))
  const stateRef = useRef(state)
  const missTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { paused, pause, resume } = usePause(phase === 'playing')

  const update = useCallback((next: typeof state) => {
    stateRef.current = next
    setState(next)
  }, [])

  // The clock only runs while playing and not paused.
  useEffect(() => {
    if (phase !== 'playing' || paused) return
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      const next = tick(stateRef.current, (now - last) / 1000)
      last = now
      update(next)
      if (next.over) {
        play('win')
        setPhase('over')
        return
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [phase, paused, update])

  useEffect(() => () => clearTimeout(missTimer.current), [])

  const tap = useCallback(
    (index: number) => {
      if (phase !== 'playing' || paused) return
      const { state: next, result } = tapCell(stateRef.current, index, cfg)
      update(next)
      if (result === 'found') {
        play('correct')
      } else if (result === 'miss') {
        play('wrong')
        setMissed(index)
        clearTimeout(missTimer.current)
        missTimer.current = setTimeout(() => setMissed(null), MISS_FLASH_MS)
        if (next.over) setPhase('over')
      }
    },
    [phase, paused, cfg, update],
  )

  const isNewRecord = phase === 'over' && state.found > 0 && (bestAtStart === null || state.found > bestAtStart)
  const best = isNewRecord ? state.found : bestAtStart

  useEffect(() => {
    if (!isNewRecord) return
    try {
      localStorage.setItem(bestKey(difficulty), String(state.found))
    } catch {
      // storage unavailable - record just isn't kept
    }
  }, [isNewRecord, state.found, difficulty])

  const start = useCallback(() => setPhase('playing'), [])

  const restart = useCallback(() => {
    update(initialState(cfg))
    setMissed(null)
    setBestAtStart(loadBest(difficulty))
    setPhase('ready')
  }, [cfg, difficulty, update])

  return { cfg, state, phase, missed, best, isNewRecord, start, tap, restart, paused, pause, resume }
}
