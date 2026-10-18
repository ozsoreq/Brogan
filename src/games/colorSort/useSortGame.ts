import { useCallback, useEffect, useRef, useState } from 'react'
import { play } from '../../lib/sound'
import {
  applyMove,
  canMove,
  DIFFICULTIES,
  isSolved,
  isTubeDone,
  makeLevel,
  solve,
  type Difficulty,
  type Move,
  type Tubes,
} from './sortLogic'

export type Phase = 'playing' | 'levelDone' | 'finished'

/** What the hint button found: the next move, or how far back to undo out of a dead end. */
export type Hint = { kind: 'move'; move: Move } | { kind: 'undo'; steps: number } | { kind: 'restart' }

const HINT_SHOW_MS = 2500

interface Run {
  stage: number
  start: Tubes
  tubes: Tubes
  /** Positions before each move of this stage, for undo. */
  history: Tubes[]
  selected: number | null
  /** Moves made in finished stages. */
  movesBefore: number
  hints: number
  phase: Phase
}

function startStage(difficulty: Difficulty, stage: number, prev?: Run): Run {
  const start = makeLevel(DIFFICULTIES[difficulty], stage)
  return {
    stage,
    start,
    tubes: start,
    history: [],
    selected: null,
    movesBefore: prev ? prev.movesBefore + prev.history.length : 0,
    hints: prev?.hints ?? 0,
    phase: 'playing',
  }
}

function bestKey(difficulty: Difficulty) {
  return `brogan-colorsort-best-${difficulty}`
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

export function useSortGame(difficulty: Difficulty) {
  const cfg = DIFFICULTIES[difficulty]
  const [run, setRun] = useState(() => startStage(difficulty, 0))
  const [hint, setHint] = useState<Hint | null>(null)
  const [bestAtStart, setBestAtStart] = useState(() => loadBest(difficulty))
  const [shake, setShake] = useState<number | null>(null)
  const runRef = useRef(run)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // The solution the hints are following. Hints keep to one plan, because a fresh solve after
  // each move can suggest moving the same ball straight back.
  const plan = useRef<{ tubes: Tubes; moves: Move[] } | null>(null)

  const update = useCallback((next: Run) => {
    runRef.current = next
    setRun(next)
  }, [])

  useEffect(
    () => () => {
      clearTimeout(hintTimer.current)
      clearTimeout(shakeTimer.current)
    },
    [],
  )

  const clearHint = useCallback(() => {
    clearTimeout(hintTimer.current)
    setHint(null)
  }, [])

  const tapTube = useCallback(
    (index: number) => {
      const r = runRef.current
      if (r.phase !== 'playing') return
      const tube = r.tubes[index]
      if (r.selected === null) {
        if (tube.length === 0 || isTubeDone(tube, cfg.capacity)) return
        play('pop')
        update({ ...r, selected: index })
        return
      }
      if (r.selected === index) {
        update({ ...r, selected: null })
        return
      }
      const move = { from: r.selected, to: index }
      if (!canMove(r.tubes, move, cfg.capacity)) {
        // Picking a different ball is fine; anything else is a move that isn't allowed.
        if (tube.length > 0 && !isTubeDone(tube, cfg.capacity)) {
          play('pop')
          update({ ...r, selected: index })
          return
        }
        play('wrong')
        setShake(index)
        clearTimeout(shakeTimer.current)
        shakeTimer.current = setTimeout(() => setShake(null), 400)
        update({ ...r, selected: null })
        return
      }
      clearHint()
      const tubes = applyMove(r.tubes, move)
      const p = plan.current
      const followed = p && p.tubes === r.tubes && p.moves[0]?.from === move.from && p.moves[0]?.to === move.to
      plan.current = followed ? { tubes, moves: p.moves.slice(1) } : null
      const history = [...r.history, r.tubes]
      if (isSolved(tubes, cfg.capacity)) {
        const last = r.stage === cfg.colors.length - 1
        play(last ? 'win' : 'correct')
        update({ ...r, tubes, history, selected: null, phase: last ? 'finished' : 'levelDone' })
        return
      }
      play(isTubeDone(tubes[index], cfg.capacity) ? 'correct' : 'hit')
      update({ ...r, tubes, history, selected: null })
    },
    [cfg, update, clearHint],
  )

  const undo = useCallback(() => {
    const r = runRef.current
    if (r.phase !== 'playing' || r.history.length === 0) return
    clearHint()
    update({ ...r, tubes: r.history[r.history.length - 1], history: r.history.slice(0, -1), selected: null })
  }, [update, clearHint])

  const restartStage = useCallback(() => {
    const r = runRef.current
    if (r.phase !== 'playing') return
    clearHint()
    // Restarting keeps the moves already made on the counter, so it can't wipe out a long attempt.
    update({ ...r, tubes: r.start, history: [], selected: null, movesBefore: r.movesBefore + r.history.length })
  }, [update, clearHint])

  const showHint = useCallback(() => {
    const r = runRef.current
    if (r.phase !== 'playing') return
    let found: Hint = { kind: 'restart' }
    if (plan.current?.tubes !== r.tubes) {
      const solution = solve(r.tubes, cfg.capacity)
      plan.current = solution ? { tubes: r.tubes, moves: solution } : null
    }
    const moves = plan.current?.moves
    if (moves && moves.length > 0) {
      found = { kind: 'move', move: moves[0] }
    } else {
      // A dead end: find the most recent position that can still be sorted.
      for (let steps = 1; steps <= r.history.length; steps++) {
        if (solve(r.history[r.history.length - steps], cfg.capacity, 20000)) {
          found = { kind: 'undo', steps }
          break
        }
      }
    }
    update({ ...r, hints: r.hints + 1, selected: found.kind === 'move' ? found.move.from : null })
    setHint(found)
    clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => setHint(null), HINT_SHOW_MS)
  }, [cfg.capacity, update])

  const nextStage = useCallback(() => {
    const r = runRef.current
    if (r.phase !== 'levelDone') return
    clearHint()
    update(startStage(difficulty, r.stage + 1, r))
  }, [difficulty, update, clearHint])

  const restart = useCallback(() => {
    clearHint()
    setBestAtStart(loadBest(difficulty))
    update(startStage(difficulty, 0))
  }, [difficulty, update, clearHint])

  const moves = run.movesBefore + run.history.length
  const isNewRecord = run.phase === 'finished' && (bestAtStart === null || moves < bestAtStart)
  const best = isNewRecord ? moves : bestAtStart

  useEffect(() => {
    if (!isNewRecord) return
    try {
      localStorage.setItem(bestKey(difficulty), String(moves))
    } catch {
      // storage unavailable - record just isn't kept
    }
  }, [isNewRecord, moves, difficulty])

  return { cfg, run, moves, hint, shake, best, isNewRecord, tapTube, undo, restartStage, showHint, nextStage, restart }
}
