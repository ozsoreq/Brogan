import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { TOTAL_LEVELS } from './levels'
import { useMathProgress } from './useMathProgress'

export function MathLevelSelect() {
  const navigate = useNavigate()
  const { unlockedLevel } = useMathProgress()
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1)

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <AppHeader title="חשבון · בחירת שלב" onBack={() => navigate('/learning')} />

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
        <p className="text-center text-sm text-slate-500">
          עברו שלב כדי לפתוח את השלב הבא. אפשר תמיד לחזור על שלבים שכבר עברתם.
        </p>

        <div className="grid grid-cols-5 gap-3">
          {levels.map((level) => {
            const isUnlocked = level <= unlockedLevel
            const isCompleted = level < unlockedLevel
            const isNext = level === unlockedLevel

            let tileStyle = 'bg-slate-100 text-slate-300'
            if (isCompleted) tileStyle = 'bg-emerald-500 text-white shadow-sm'
            else if (isNext) tileStyle = 'bg-violet-600 text-white shadow-md ring-2 ring-violet-300'

            return (
              <motion.button
                key={level}
                type="button"
                disabled={!isUnlocked}
                onClick={() => navigate(`/learning/math/${level}`)}
                whileTap={isUnlocked ? { scale: 0.92 } : {}}
                whileHover={isUnlocked ? { scale: 1.05 } : {}}
                className={`flex aspect-square items-center justify-center rounded-xl text-lg font-bold transition-colors duration-200 ${tileStyle} disabled:cursor-default`}
              >
                {isUnlocked ? level : <Lock className="h-4 w-4" />}
              </motion.button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
