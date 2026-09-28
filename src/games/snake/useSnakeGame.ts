import { useCallback, useEffect, useRef, useState } from 'react'
import { usePause } from '../../lib/usePause'
import { DIFFICULTIES, initialState, tick, tickInterval, turn, type Difficulty, type Direction } from './snakeLogic'

export type Phase = 'ready' | 'playing' | 'over'

const KEY_TO_DIR: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

function bestKey(difficulty: Difficulty) {
  return `brogan-snake-best-${difficulty}`
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

export function useSnakeGame(difficulty: Difficulty) {
  const cfg = DIFFICULTIES[difficulty]
  const [state, setState] = useState(() => initialState(cfg.size))
  const [phase, setPhase] = useState<Phase>('ready')
  const [bestAtStart, setBestAtStart] = useState(() => loadBest(difficulty))
  const stateRef = useRef(state)
  const { paused, pause, resume } = usePause(phase === 'playing')

  const update = useCallback((next: typeof state) => {
    stateRef.current = next
    setState(next)
  }, [])

  useEffect(() => {
    if (phase !== 'playing' || paused) return
    let timer: ReturnType<typeof setTimeout>
    const loop = () => {
      const next = tick(stateRef.current, cfg)
      update(next)
      if (next.over) {
        setPhase('over')
        return
      }
      timer = setTimeout(loop, tickInterval(next, cfg))
    }
    timer = setTimeout(loop, tickInterval(stateRef.current, cfg))
    return () => clearTimeout(timer)
  }, [phase, paused, cfg, update])

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
    update(initialState(cfg.size))
    setBestAtStart(loadBest(difficulty))
    setPhase('ready')
  }, [cfg.size, difficulty, update])

  // The first direction pressed also starts the game.
  const steer = useCallback(
    (dir: Direction) => {
      if (phase === 'over' || paused) return
      update(turn(stateRef.current, dir))
      if (phase === 'ready') setPhase('playing')
    },
    [phase, paused, update],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIR[e.key]
      if (!dir) return
      e.preventDefault()
      steer(dir)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [steer])

  return { cfg, state, phase, best, isNewRecord, steer, restart, paused, pause, resume }
}
