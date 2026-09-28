import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import type { ReactNode } from 'react'

export type Direction = 'up' | 'down' | 'left' | 'right'

function ArrowButton({
  label,
  onPress,
  color,
  className = '',
  children,
}: {
  label: string
  onPress: () => void
  color: string
  className?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault()
        onPress()
      }}
      className={`flex h-16 w-16 touch-manipulation select-none items-center justify-center rounded-2xl text-white shadow-md active:scale-90 short:h-14 short:w-14 ${color} ${className}`}
    >
      {children}
    </button>
  )
}

interface DirectionPadProps {
  onPress: (dir: Direction) => void
  /** Tailwind background classes for the buttons, e.g. "bg-emerald-500 active:bg-emerald-600". */
  color: string
}

/**
 * Big on-screen arrow keys, laid out like a cross - or, on short screens, in a
 * single row (◀ ▲ ▼ ▶) so the game board above keeps its size. Fires on
 * touch-down for instant response. Its height is mirrored in the --pad-h CSS
 * variable, which the game boards use to fit the screen.
 */
export function DirectionPad({ onPress, color }: DirectionPadProps) {
  return (
    <div dir="ltr" className="grid grid-cols-3 place-items-center gap-2 self-center short:flex short:gap-3">
      <span className="short:hidden" />
      <ArrowButton label="למעלה" color={color} className="short:order-2" onPress={() => onPress('up')}>
        <ArrowUp className="h-8 w-8" />
      </ArrowButton>
      <span className="short:hidden" />
      <ArrowButton label="שמאלה" color={color} className="short:order-1" onPress={() => onPress('left')}>
        <ArrowLeft className="h-8 w-8" />
      </ArrowButton>
      <span className="short:hidden" />
      <ArrowButton label="ימינה" color={color} className="short:order-4" onPress={() => onPress('right')}>
        <ArrowRight className="h-8 w-8" />
      </ArrowButton>
      <span className="short:hidden" />
      <ArrowButton label="למטה" color={color} className="short:order-3" onPress={() => onPress('down')}>
        <ArrowDown className="h-8 w-8" />
      </ArrowButton>
      <span className="short:hidden" />
    </div>
  )
}
