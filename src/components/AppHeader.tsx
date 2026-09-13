import { ArrowRight } from 'lucide-react'

interface AppHeaderProps {
  title: string
  onBack?: () => void
}

export function AppHeader({ title, onBack }: AppHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-4 py-4 sm:px-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="חזרה"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      )}
      <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">{title}</h1>
    </header>
  )
}
