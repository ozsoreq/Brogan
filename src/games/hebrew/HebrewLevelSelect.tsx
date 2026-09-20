import { motion } from 'framer-motion'
import { Lock, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { TOTAL_LEVELS } from './levels'
import { useHebrewProgress } from './useHebrewProgress'

export function HebrewLevelSelect() {
  const navigate = useNavigate()
  const { unlockedLevel, resetProgress } = useHebrewProgress()
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1)

  const handleReset = () => {
    if (unlockedLevel <= 1) return
    if (window.confirm('לאפס את ההתקדמות ולהתחיל משלב 1?')) resetProgress()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      <AppHeader title="עברית · בחירת שלב" onBack={() => navigate('/learning')} />

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
        <p className="text-center text-sm text-slate-500">
          קראו את הסיפור וענו על השאלות. עברו שלב כדי לפתוח את השלב הבא.
        </p>

        <div className="grid grid-cols-5 gap-3">
          {levels.map((level) => {
            const isUnlocked = level <= unlockedLevel
            const isCompleted = level < unlockedLevel
            const isNext = level === unlockedLevel

            let tileStyle = 'bg-slate-100 text-slate-300'
            if (isCompleted) tileStyle = 'bg-emerald-500 text-white shadow-sm'
            else if (isNext) tileStyle = 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300'

            return (
              <motion.button
                key={level}
                type="button"
                disabled={!isUnlocked}
                onClick={() => navigate(`/learning/hebrew/${level}`)}
                whileTap={isUnlocked ? { scale: 0.92 } : {}}
                whileHover={isUnlocked ? { scale: 1.05 } : {}}
                className={`flex aspect-square items-center justify-center rounded-xl text-lg font-bold transition-colors duration-200 ${tileStyle} disabled:cursor-default`}
              >
                {isUnlocked ? level : <Lock className="h-4 w-4" />}
              </motion.button>
            )
          })}
        </div>

        {unlockedLevel > 1 && (
          <button
            type="button"
            onClick={handleReset}
            className="mx-auto flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <RotateCcw className="h-4 w-4" />
            איפוס התקדמות
          </button>
        )}
      </main>
    </div>
  )
}
