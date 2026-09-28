import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { ConfirmDialog } from './ConfirmDialog'
import { LevelGrid } from './LevelGrid'

interface LevelSelectPageProps {
  title: string
  intro: string
  backgroundClass: string
  nextTileClass: string
  routePrefix: string
  totalLevels: number
  unlockedLevel: number
  resetProgress: () => void
}

export function LevelSelectPage({
  title,
  intro,
  backgroundClass,
  nextTileClass,
  routePrefix,
  totalLevels,
  unlockedLevel,
  resetProgress,
}: LevelSelectPageProps) {
  const navigate = useNavigate()
  const allDone = unlockedLevel > totalLevels

  const [confirmingReset, setConfirmingReset] = useState(false)

  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      <AppHeader title={title} onBack={() => navigate('/learning')} />

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
        <p className="text-center text-sm text-slate-500">
          {allDone ? '🏆 סיימתם את כל השלבים! אפשר לשחקו שוב בכל שלב.' : intro}
        </p>

        <LevelGrid
          totalLevels={totalLevels}
          unlockedLevel={unlockedLevel}
          nextTileClass={nextTileClass}
          onSelect={(level) => navigate(`${routePrefix}/${level}`)}
        />

        {unlockedLevel > 1 && (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="mx-auto flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            איפוס התקדמות
          </button>
        )}
      </main>

      <ConfirmDialog
        open={confirmingReset}
        title="לאפס את ההתקדמות?"
        message="כל השלבים יינעלו שוב, ומתחילים משלב 1."
        confirmLabel="כן, לאפס"
        onConfirm={() => {
          resetProgress()
          setConfirmingReset(false)
        }}
        onCancel={() => setConfirmingReset(false)}
      />
    </div>
  )
}
