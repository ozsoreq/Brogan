// Emoji added in Unicode 13-15 (2020-2022). Phones a few years old draw these as
// empty boxes, so anything that depends on them checks first.
const RECENT_RANGES: [number, number][] = [
  [0x1f6d6, 0x1f6d7],
  [0x1f6dc, 0x1f6df],
  [0x1f6fb, 0x1f6fc],
  [0x1f7f0, 0x1f7f0],
  [0x1f90c, 0x1f90c],
  [0x1f972, 0x1f972],
  [0x1f977, 0x1f978],
  [0x1f9a3, 0x1f9a4],
  [0x1f9ab, 0x1f9ad],
  [0x1f9cb, 0x1f9cc],
  [0x1fa74, 0x1fa7c],
  [0x1fa83, 0x1fa88],
  [0x1fa96, 0x1faff],
]

export function isRecentEmoji(emoji: string) {
  return [...emoji].some((ch) => {
    const cp = ch.codePointAt(0)!
    return RECENT_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi)
  })
}

const cache = new Map<string, boolean>()
let ctx: CanvasRenderingContext2D | null | undefined

function draw(emoji: string, colour: string) {
  ctx!.clearRect(0, 0, 32, 32)
  ctx!.fillStyle = colour
  ctx!.fillText(emoji, 2, 2)
  return ctx!.getImageData(0, 0, 32, 32).data
}

/**
 * Whether this device draws `emoji` as a real colour picture. A colour emoji
 * ignores the text colour, while a missing one falls back to a plain glyph (a box,
 * or a black-and-white symbol) painted in the text colour - so draw it in red and
 * in blue and compare. Older emoji are assumed to work.
 */
export function canShowEmoji(emoji: string): boolean {
  if (!isRecentEmoji(emoji) || typeof document === 'undefined') return true
  const known = cache.get(emoji)
  if (known !== undefined) return known
  if (ctx === undefined) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 32
    ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (ctx) {
      ctx.font = '24px sans-serif'
      ctx.textBaseline = 'top'
    }
  }
  if (!ctx) return true
  let ok: boolean
  try {
    const red = draw(emoji, '#f00')
    const blue = draw(emoji, '#00f')
    let ink = 0
    let changed = 0
    for (let i = 0; i < red.length; i += 4) {
      if (red[i + 3] > 50) ink++
      if (Math.abs(red[i] - blue[i]) + Math.abs(red[i + 2] - blue[i + 2]) > 40) changed++
    }
    ok = ink > 0 && changed === 0
  } catch {
    ok = true
  }
  cache.set(emoji, ok)
  return ok
}
