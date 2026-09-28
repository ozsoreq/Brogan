import { Pause, Play } from 'lucide-react'

export function PauseButton({ onPause, disabled }: { onPause: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onPause}
      disabled={disabled}
      aria-label="השהיה"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-40"
    >
      <Pause className="h-5 w-5" aria-hidden />
    </button>
  )
}

/** Covers the board while paused; the game resumes from exactly where it stopped. */
export function PauseOverlay({ onResume }: { onResume: () => void }) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/75 backdrop-blur-sm"
      onPointerDown={(e) => e.stopPropagation()}
      dir="rtl"
    >
      <p className="text-3xl font-extrabold text-slate-800">⏸ הפסקה</p>
      <button
        type="button"
        onClick={onResume}
        autoFocus
        className="flex items-center gap-2 rounded-2xl bg-emerald-700 px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-emerald-800 active:scale-95"
      >
        <Play className="h-6 w-6" aria-hidden />
        ממשיכים
      </button>
    </div>
  )
}
