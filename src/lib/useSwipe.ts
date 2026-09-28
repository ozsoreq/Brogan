import { useRef, type PointerEvent } from 'react'
import type { Direction } from '../components/DirectionPad'

const SWIPE_MIN_PX = 24

/**
 * Pointer handlers that turn drags into directions. Every drag of at least SWIPE_MIN_PX counts,
 * and the start point then resets, so one long drag can steer through several turns.
 * The element should also have `touchAction: 'none'` so the page doesn't scroll.
 */
export function useSwipe(onSwipe: (dir: Direction) => void) {
  const start = useRef<{ x: number; y: number } | null>(null)

  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      start.current = { x: e.clientX, y: e.clientY }
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const s = start.current
      if (!s) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return
      onSwipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
      start.current = { x: e.clientX, y: e.clientY }
    },
    onPointerUp: () => {
      start.current = null
    },
    onPointerCancel: () => {
      start.current = null
    },
  }
}
