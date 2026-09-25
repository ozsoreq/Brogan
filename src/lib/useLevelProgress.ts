import { useCallback, useState } from 'react'

// unlockedLevel === totalLevels + 1 means every level has been completed.
function clampLevel(level: number, totalLevels: number): number {
  return Math.min(Math.max(Math.round(level), 1), totalLevels + 1)
}

function loadUnlockedLevel(storageKey: string, totalLevels: number): number {
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed = raw ? Number(raw) : NaN
    return Number.isFinite(parsed) ? clampLevel(parsed, totalLevels) : 1
  } catch {
    return 1
  }
}

function saveUnlockedLevel(storageKey: string, level: number) {
  try {
    localStorage.setItem(storageKey, String(level))
  } catch {
    // localStorage unavailable (private mode, etc.) - progress just won't persist.
  }
}

export function useLevelProgress(storageKey: string, totalLevels: number) {
  const [unlockedLevel, setUnlockedLevel] = useState(() =>
    loadUnlockedLevel(storageKey, totalLevels),
  )

  const unlockUpTo = useCallback(
    (level: number) => {
      setUnlockedLevel((prev) => {
        const next = clampLevel(Math.max(prev, level), totalLevels)
        saveUnlockedLevel(storageKey, next)
        return next
      })
    },
    [storageKey, totalLevels],
  )

  const resetProgress = useCallback(() => {
    setUnlockedLevel(1)
    saveUnlockedLevel(storageKey, 1)
  }, [storageKey])

  return { unlockedLevel, unlockUpTo, resetProgress }
}
