import { useCallback, useEffect, useRef, useState } from 'react'
import { usePause } from '../../lib/usePause'
import { DIFFICULTIES, initialState, launch, movePaddle, step, type Difficulty } from './bricksLogic'

const KEYBOARD_PADDLE_SPEED = 90

export type Phase = 'playing' | 'over'

function bestKey(difficulty: Difficulty) {
  return `brogan-bricks-best-${difficulty}`
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

export function useBricksGame(difficulty: Difficulty) {
  const cfg = DIFFICULTIES[difficulty]
  const [state, setState] = useState(() => initialState(cfg))
  const [phase, setPhase] = useState<Phase>('playing')
  const [bestAtStart, setBestAtStart] = useState(() => loadBest(difficulty))

  const stateRef = useRef(state)
  const targetX = useRef<number | null>(null)
  const pendingLaunch = useRef(false)
  const keys = useRef({ left: false, right: false })
  const { paused, pause, resume } = usePause(phase === 'playing')

  // The ball rests on the paddle until launched, so the loop can run from the start.
  useEffect(() => {
    if (phase !== 'playing' || paused) return
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      let s = stateRef.current
      const keyDir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0)
      if (keyDir !== 0) targetX.current = s.paddleX + keyDir * KEYBOARD_PADDLE_SPEED * Math.min(dt, 0.05)
      if (targetX.current !== null) s = movePaddle(s, targetX.current, cfg)
      if (pendingLaunch.current) {
        s = launch(s, cfg)
        pendingLaunch.current = false
      }
      s = step(s, dt, cfg)
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
  }, [phase, paused, cfg])

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
    targetX.current = null
    pendingLaunch.current = false
    setState(fresh)
    setBestAtStart(loadBest(difficulty))
    setPhase('playing')
  }, [cfg, difficulty])

  // Pointer input arrives in world units from the board: touching launches, dragging steers.
  const pointerDown = useCallback(
    (x: number) => {
      if (paused) return
      targetX.current = x
      pendingLaunch.current = true
    },
    [paused],
  )

  const pointerMove = useCallback(
    (x: number) => {
      if (!paused) targetX.current = x
    },
    [paused],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const down = e.type === 'keydown'
      if (e.key === 'ArrowLeft') keys.current.left = down
      else if (e.key === 'ArrowRight') keys.current.right = down
      else if (down && (e.key === ' ' || e.key === 'ArrowUp')) pendingLaunch.current = true
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
    }
  }, [])

  return { cfg, state, phase, best, isNewRecord, pointerDown, pointerMove, restart, paused, pause, resume }
}
