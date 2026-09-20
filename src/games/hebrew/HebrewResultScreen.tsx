import { motion } from 'framer-motion'
import { ArrowLeft, Home, RotateCcw } from 'lucide-react'
import { TOTAL_LEVELS } from './levels'

interface HebrewResultScreenProps {
  level: number
  score: number
  total: number
  passed: boolean
  onRetry: () => void
  onNextLevel: () => void
  onBackToLevels: () => void
}

export function HebrewResultScreen({
  level,
  score,
  total,
  passed,
  onRetry,
  onNextLevel,
  onBackToLevels,
}: HebrewResultScreenProps) {
  const hasNextLevel = passed && level < TOTAL_LEVELS

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl bg-white p-8 text-center shadow-xl"
    >
      <div className="text-6xl">{passed ? '📚' : '🧐'}</div>
      <div>
        <p className="text-lg font-medium text-slate-500">שלב {level}</p>
        <p className="mt-1 text-2xl font-extrabold text-slate-800">
          {passed ? 'עברת את השלב!' : 'כמעט הצלחת!'}
        </p>
      </div>
      <p className="text-slate-600">
        ענית נכון על {score} מתוך {total} שאלות
      </p>
      {!passed && (
        <p className="font-semibold text-slate-800">
          צריך {total} מתוך {total} (הכל נכון!) כדי לעבור שלב. אפשר להסתכל שוב בסיפור!
        </p>
      )}

      <div className="mt-2 flex w-full flex-col gap-3">
        {hasNextLevel && (
          <button
            type="button"
            onClick={onNextLevel}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-600 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
            שלב {level + 1}
          </button>
        )}
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-amber-600 active:scale-95"
        >
          <RotateCcw className="h-5 w-5" />
          נסה שוב
        </button>
        <button
          type="button"
          onClick={onBackToLevels}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
        >
          <Home className="h-5 w-5" />
          בחירת שלב
        </button>
      </div>
    </motion.div>
  )
}
