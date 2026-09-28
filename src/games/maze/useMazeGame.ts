import { useCallback, useEffect, useRef, useState } from 'react'
import type { Direction } from '../../components/DirectionPad'
import {
  DIFFICULTIES,
  goalOf,
  HINT_LENGTH,
  HINT_PENALTY_SECONDS,
  makeLevel,
  samePoint,
  shortestPath,
  slide,
  type Difficulty,
  type Level,
  type Point,
} from './mazeLogic'

const STEP_MS = 55
const HINT_SHOW_MS = 2000

const KEY_TO_DIR: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

export type Phase = 'playing' | 'levelDone' | 'finished'

interface Run {
  levelIndex: number
  level: Level
  pos: Point
  visited: Set<string>
  starsLeft: Point[]
  starsCollected: number
  hints: number
  /** Time of finished stages plus hint penalties. */
  elapsedMs: number
  /** When the current stage's clock started - on its first move. */
  levelStart: number | null
  phase: Phase
}

const cellKey = (p: Point) => `${p.x},${p.y}`

function startLevel(difficulty: Difficulty, levelIndex: number, prev?: Run): Run {
  const level = makeLevel(difficulty, levelIndex)
  return {
    levelIndex,
    level,
    pos: { x: 0, y: 0 },
    visited: new Set(['0,0']),
    starsLeft: level.stars,
    starsCollected: prev?.starsCollected ?? 0,
    hints: prev?.hints ?? 0,
    elapsedMs: prev?.elapsedMs ?? 0,
    levelStart: null,
    phase: 'playing',
  }
}

function bestKey(difficulty: Difficulty) {
  return `brogan-maze-best-${difficulty}`
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

export function useMazeGame(difficulty: Difficulty) {
  const cfg = DIFFICULTIES[difficulty]
  const [run, setRun] = useState(() => startLevel(difficulty, 0))
  const [animating, setAnimating] = useState(false)
  const [hintCells, setHintCells] = useState<Point[]>([])
  const [now, setNow] = useState(() => performance.now())
  const [bestAtStart, setBestAtStart] = useState(() => loadBest(difficulty))

  const runRef = useRef(run)
  const path = useRef<Point[]>([])
  const queued = useRef<Direction | null>(null)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const update = useCallback((next: Run) => {
    runRef.current = next
    setRun(next)
  }, [])

  // One cell per tick, so the mouse visibly runs along the corridor (and around its corners).
  useEffect(() => {
    if (!animating) return
    const id = setInterval(() => {
      const next = path.current.shift()
      let r = runRef.current
      if (next) {
        const star = r.starsLeft.find((s) => samePoint(s, next))
        r = {
          ...r,
          pos: next,
          visited: new Set(r.visited).add(cellKey(next)),
          starsLeft: star ? r.starsLeft.filter((s) => s !== star) : r.starsLeft,
          starsCollected: r.starsCollected + (star ? 1 : 0),
        }
        if (samePoint(next, goalOf(r.level.maze))) {
          path.current = []
          queued.current = null
          const t = performance.now()
          const last = r.levelIndex === cfg.sizes.length - 1
          r = { ...r, elapsedMs: r.elapsedMs + (t - (r.levelStart ?? t)), levelStart: null, phase: last ? 'finished' : 'levelDone' }
          setNow(t)
        }
        update(r)
      }
      if (path.current.length > 0) return
      const q = queued.current
      queued.current = null
      if (q && r.phase === 'playing') {
        path.current = slide(r.level.maze, r.pos, q)
        if (path.current.length > 0) return
      }
      setAnimating(false)
    }, STEP_MS)
    return () => clearInterval(id)
  }, [animating, cfg.sizes.length, update])

  const clockRunning = run.phase === 'playing' && run.levelStart !== null
  useEffect(() => {
    if (!clockRunning) return
    const id = setInterval(() => setNow(performance.now()), 250)
    return () => clearInterval(id)
  }, [clockRunning])

  useEffect(() => () => clearTimeout(hintTimer.current), [])

  const move = useCallback(
    (dir: Direction) => {
      const r = runRef.current
      if (r.phase !== 'playing') return
      if (path.current.length > 0) {
        queued.current = dir
        return
      }
      const route = slide(r.level.maze, r.pos, dir)
      if (route.length === 0) return
      path.current = route
      if (r.levelStart === null) {
        const t = performance.now()
        setNow(t)
        update({ ...r, levelStart: t })
      }
      setAnimating(true)
    },
    [update],
  )

  const hint = useCallback(() => {
    const r = runRef.current
    if (r.phase !== 'playing') return
    setHintCells(shortestPath(r.level.maze, r.pos, goalOf(r.level.maze)).slice(0, HINT_LENGTH))
    update({ ...r, hints: r.hints + 1, elapsedMs: r.elapsedMs + HINT_PENALTY_SECONDS * 1000 })
    clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => setHintCells([]), HINT_SHOW_MS)
  }, [update])

  const nextLevel = useCallback(() => {
    const r = runRef.current
    if (r.phase !== 'levelDone') return
    setHintCells([])
    update(startLevel(difficulty, r.levelIndex + 1, r))
  }, [difficulty, update])

  const restart = useCallback(() => {
    path.current = []
    queued.current = null
    setAnimating(false)
    setHintCells([])
    setBestAtStart(loadBest(difficulty))
    update(startLevel(difficulty, 0))
  }, [difficulty, update])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIR[e.key]
      if (!dir) return
      e.preventDefault()
      move(dir)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  const seconds = Math.floor((run.elapsedMs + (run.levelStart !== null ? Math.max(0, now - run.levelStart) : 0)) / 1000)
  const totalStars = cfg.stars * cfg.sizes.length
  const isNewRecord = run.phase === 'finished' && (bestAtStart === null || seconds < bestAtStart)
  const best = isNewRecord ? seconds : bestAtStart

  useEffect(() => {
    if (!isNewRecord) return
    try {
      localStorage.setItem(bestKey(difficulty), String(seconds))
    } catch {
      // storage unavailable - record just isn't kept
    }
  }, [isNewRecord, seconds, difficulty])

  return { cfg, run, hintCells, seconds, totalStars, best, isNewRecord, move, hint, nextLevel, restart }
}

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
