import { Volume2, VolumeX } from 'lucide-react'
import { canSpeak, setMuted, speak, useMuted } from '../lib/sound'

export function SoundToggle() {
  const muted = useMuted()
  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-label={muted ? 'הפעלת צלילים' : 'השתקה'}
      aria-pressed={muted}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95"
    >
      {muted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
    </button>
  )
}

/** A small 🔊 button that reads `text` aloud; hidden when sound is off or unsupported. */
export function SpeakButton({ text, label = 'הקראה' }: { text: string; label?: string }) {
  const muted = useMuted()
  if (muted || !canSpeak()) return null
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        speak(text)
      }}
      aria-label={label}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 shadow-sm transition hover:bg-amber-200 active:scale-95"
    >
      <Volume2 className="h-5 w-5" aria-hidden />
    </button>
  )
}
