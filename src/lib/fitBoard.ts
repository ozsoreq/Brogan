import type { CSSProperties } from 'react'

/**
 * Caps a game board so it fits the screen's height as well as its width.
 * `reserved` is everything else stacked above and below the board (header,
 * score line, controls, padding) as a CSS length; `ratio` is width / height.
 */
export function fitBoard(reserved: string, ratio = 1): CSSProperties {
  return { maxWidth: `max(220px, calc((100dvh - ${reserved}) * ${ratio}))`, marginInline: 'auto' }
}
