import { useCallback, useEffect, useRef, useState } from 'react'
import { usePause } from '../../lib/usePause'
import { DIFFICULTIES, endStroke, initialState, slice, step, type Difficulty, type Segment } from './fruitLogic'

const TRAIL_MS = 140

export type Phase = 'ready' | 'playing' | 'over'
export interface TrailPoint {
  x: number
  y: number
  t: number
}

function bestKey(difficulty: Difficulty) {
  return `brogan-fruit-best-${difficulty}`
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

export function useFruitGame(difficulty: Difficulty) {
  const cfg = DIFFICULTIES[difficulty]
  const [state, setState] = useState(initialState)
  const [phase, setPhase] = useState<Phase>('ready')
  const [trail, setTrail] = useState<TrailPoint[]>([])
  const [bestAtStart, setBestAtStart] = useState(() => loadBest(difficulty))

  const stateRef = useRef(state)
  const pendingSegments = useRef<Segment[]>([])
  const pendingEndStroke = useRef(false)
  const trailRef = useRef<TrailPoint[]>([])
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const { paused, pause, resume } = usePause(phase === 'playing')

  useEffect(() => {
    if (phase !== 'playing' || paused) return
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      let s = step(stateRef.current, (now - last) / 1000, cfg)
      last = now
      for (const seg of pendingSegments.current) s = slice(s, seg)
      pendingSegments.current = []
      if (pendingEndStroke.current) {
        s = endStroke(s)
        pendingEndStroke.current = false
      }
      stateRef.current = s
      setState(s)
      trailRef.current = trailRef.current.filter((p) => now - p.t < TRAIL_MS)
      setTrail(trailRef.current)
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

  const start = useCallback(() => {
    const fresh = initialState()
    stateRef.current = fresh
    pendingSegments.current = []
    trailRef.current = []
    setState(fresh)
    setTrail([])
    setBestAtStart(loadBest(difficulty))
    setPhase('playing')
  }, [difficulty])

  // Pointer input arrives in world units from the board.
  const pointerDown = useCallback(
    (x: number, y: number) => {
      if (phase === 'ready') {
        start()
        return
      }
      if (phase !== 'playing' || paused) return
      lastPoint.current = { x, y }
      pendingSegments.current.push({ x1: x, y1: y, x2: x, y2: y })
      trailRef.current = [{ x, y, t: performance.now() }]
    },
    [phase, paused, start],
  )

  const pointerMove = useCallback((x: number, y: number) => {
    const prev = lastPoint.current
    if (!prev) return
    pendingSegments.current.push({ x1: prev.x, y1: prev.y, x2: x, y2: y })
    lastPoint.current = { x, y }
    trailRef.current.push({ x, y, t: performance.now() })
  }, [])

  const pointerUp = useCallback(() => {
    lastPoint.current = null
    pendingEndStroke.current = true
  }, [])

  return { cfg, state, phase, trail, best, isNewRecord, pointerDown, pointerMove, pointerUp, restart: start, paused, pause, resume }
}
