import { useCallback, useState } from 'react'
import { TOTAL_LEVELS } from './levels'

const STORAGE_KEY = 'brogan-math-unlocked-level'

function clampLevel(level: number): number {
  return Math.min(Math.max(Math.round(level), 1), TOTAL_LEVELS)
}

function loadUnlockedLevel(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? Number(raw) : NaN
    return Number.isFinite(parsed) ? clampLevel(parsed) : 1
  } catch {
    return 1
  }
}

function saveUnlockedLevel(level: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(level))
  } catch {
    // localStorage unavailable (private mode, etc.) - progress just won't persist.
  }
}

export function useMathProgress() {
  const [unlockedLevel, setUnlockedLevel] = useState(() => loadUnlockedLevel())

  const unlockUpTo = useCallback((level: number) => {
    setUnlockedLevel((prev) => {
      const next = clampLevel(Math.max(prev, level))
      saveUnlockedLevel(next)
      return next
    })
  }, [])

  return { unlockedLevel, unlockUpTo }
}
