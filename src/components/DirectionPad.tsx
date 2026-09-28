import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import type { ReactNode } from 'react'

export type Direction = 'up' | 'down' | 'left' | 'right'

function ArrowButton({ label, onPress, color, children }: { label: string; onPress: () => void; color: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault()
        onPress()
      }}
      className={`flex h-16 w-16 touch-manipulation select-none items-center justify-center rounded-2xl text-white shadow-md active:scale-90 ${color}`}
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

/** Big on-screen arrow keys, laid out like a cross. Fires on touch-down for instant response. */
export function DirectionPad({ onPress, color }: DirectionPadProps) {
  return (
    <div dir="ltr" className="grid grid-cols-3 place-items-center gap-2 self-center">
      <span />
      <ArrowButton label="למעלה" color={color} onPress={() => onPress('up')}>
        <ArrowUp className="h-8 w-8" />
      </ArrowButton>
      <span />
      <ArrowButton label="שמאלה" color={color} onPress={() => onPress('left')}>
        <ArrowLeft className="h-8 w-8" />
      </ArrowButton>
      <span />
      <ArrowButton label="ימינה" color={color} onPress={() => onPress('right')}>
        <ArrowRight className="h-8 w-8" />
      </ArrowButton>
      <span />
      <ArrowButton label="למטה" color={color} onPress={() => onPress('down')}>
        <ArrowDown className="h-8 w-8" />
      </ArrowButton>
      <span />
    </div>
  )
}
