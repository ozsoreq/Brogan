import { describe, expect, it } from 'vitest'
import { canShowEmoji, isRecentEmoji } from './emojiSupport'

describe('emoji support', () => {
  it('knows which emoji are recent enough to need a check', () => {
    for (const e of ['🫏', '🪼', '🩷', '🫘', '🛞', '🪨', '🫐']) expect(isRecentEmoji(e)).toBe(true)
    for (const e of ['🐶', '🍎', '⭐', '🧀', '🐭']) expect(isRecentEmoji(e)).toBe(false)
  })

  it('assumes support where it cannot check (no canvas)', () => {
    expect(canShowEmoji('🫏')).toBe(true)
  })
})
