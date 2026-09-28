import { useCallback, useEffect, useRef, useState } from 'react'
import { play, playNote } from '../../lib/sound'
import { DIFFICULTIES, initialState, PADS, press, stepDuration, type Difficulty } from './simonLogic'

// ready: waiting for "start" · showing: the sequence plays · input: the child repeats it
// between: a short pause after a round or a mistake · over: out of lives
export type Phase = 'ready' | 'showing' | 'input' | 'between' | 'over'
export type Mood = 'success' | 'mistake' | null

const FIRST_STEP_DELAY_MS = 700
const TAP_LIGHT_MS = 250
const AFTER_ROUND_MS = 900
const AFTER_MISTAKE_MS = 1300

function bestKey(difficulty: Difficulty) {
  return `brogan-simon-best-${difficulty}`
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

export function useSimonGame(difficulty: Difficulty) {
  const cfg = DIFFICULTIES[difficulty]
  const [game, setGame] = useState(() => initialState(cfg))
  const [phase, setPhase] = useState<Phase>('ready')
  const [lit, setLit] = useState<number | null>(null)
  const [mood, setMood] = useState<Mood>(null)
  const [bestAtStart, setBestAtStart] = useState(() => loadBest(difficulty))
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])
  useEffect(() => clearTimers, [clearTimers])

  // Play the sequence: each animal lights up with its own note.
  useEffect(() => {
    if (phase !== 'showing') return
    const step = stepDuration(game.sequence.length, cfg)
    game.sequence.forEach((pad, i) => {
      const at = FIRST_STEP_DELAY_MS + i * step
      later(() => {
        setLit(pad)
        playNote(PADS[pad].note, (step * 0.65) / 1000)
      }, at)
      later(() => setLit(null), at + step * 0.65)
    })
    later(() => setPhase('input'), FIRST_STEP_DELAY_MS + game.sequence.length * step)
    return clearTimers
  }, [phase, game.sequence, cfg, later, clearTimers])

  // If the app goes to the background mid-round, the round is replayed on return.
  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) return
      clearTimers()
      setLit(null)
      setGame((g) => ({ ...g, inputIndex: 0 }))
      setPhase((p) => (p === 'showing' || p === 'input' || p === 'between' ? 'ready' : p))
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [clearTimers])

  const start = useCallback(() => {
    if (phase === 'ready') setPhase('showing')
  }, [phase])

  const pressPad = useCallback(
    (pad: number) => {
      if (phase !== 'input') return
      setLit(pad)
      playNote(PADS[pad].note, 0.25)
      later(() => setLit((l) => (l === pad ? null : l)), TAP_LIGHT_MS)

      const { state, result } = press(game, pad, cfg)
      setGame(state)
      if (result === 'roundComplete') {
        setPhase('between')
        setMood('success')
        later(() => play('correct'), 200)
        later(() => {
          setMood(null)
          setPhase('showing')
        }, AFTER_ROUND_MS)
      } else if (result === 'mistake') {
        play('wrong')
        setPhase('between')
        setMood('mistake')
        later(() => {
          setMood(null)
          setPhase('showing')
        }, AFTER_MISTAKE_MS)
      } else if (result === 'gameOver') {
        play('lose')
        setPhase('over')
      }
    },
    [phase, game, cfg, later],
  )

  const isNewRecord = phase === 'over' && game.best > 0 && (bestAtStart === null || game.best > bestAtStart)
  const best = isNewRecord ? game.best : bestAtStart

  useEffect(() => {
    if (!isNewRecord) return
    try {
      localStorage.setItem(bestKey(difficulty), String(game.best))
    } catch {
      // storage unavailable - record just isn't kept
    }
  }, [isNewRecord, game.best, difficulty])

  const restart = useCallback(() => {
    clearTimers()
    setGame(initialState(cfg))
    setLit(null)
    setMood(null)
    setBestAtStart(loadBest(difficulty))
    setPhase('ready')
  }, [cfg, difficulty, clearTimers])

  // Number keys 1-6 press the pads on a keyboard; Space/Enter starts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key)
      if (n >= 1 && n <= cfg.pads) pressPad(n - 1)
      else if ((e.key === ' ' || e.key === 'Enter') && phase === 'ready') {
        e.preventDefault()
        start()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cfg.pads, pressPad, phase, start])

  return { cfg, game, phase, lit, mood, best, isNewRecord, start, pressPad, restart }
}
