import { useCallback, useEffect, useState } from 'react'

const LANDSCAPE_PHONE = '(orientation: landscape) and (max-height: 500px)'

/**
 * Pause state for a real-time game. While `active` (the game is running), the
 * game pauses by itself when the app goes to the background or the phone is
 * turned sideways, and the P / Escape keys toggle it.
 */
export function usePause(active: boolean) {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!active) return
    const onVisibility = () => document.hidden && setPaused(true)
    const landscape = window.matchMedia(LANDSCAPE_PHONE)
    const onRotate = () => landscape.matches && setPaused(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P' || e.key === 'פ') setPaused((p) => !p)
    }
    document.addEventListener('visibilitychange', onVisibility)
    landscape.addEventListener('change', onRotate)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      landscape.removeEventListener('change', onRotate)
      window.removeEventListener('keydown', onKey)
    }
  }, [active])

  const pause = useCallback(() => setPaused(true), [])
  const resume = useCallback(() => setPaused(false), [])

  return { paused: active && paused, pause, resume }
}
