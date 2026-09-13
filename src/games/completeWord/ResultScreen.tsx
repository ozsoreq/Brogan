import { motion } from 'framer-motion'
import { Home, RotateCcw } from 'lucide-react'

interface ResultScreenProps {
  score: number
  total: number
  onReplay: () => void
  onBackToMenu: () => void
}

function getMessage(percentage: number): { text: string; emoji: string } {
  if (percentage === 100) return { text: 'מושלם! כל הכבוד!', emoji: '🏆' }
  if (percentage >= 70) return { text: 'כל הכבוד, עבודה נהדרת!', emoji: '🌟' }
  if (percentage >= 40) return { text: 'התחלה יפה, בואו ננסה שוב!', emoji: '💪' }
  return { text: 'אל דאגה, תרגול עושה מושלם!', emoji: '🙂' }
}

export function ResultScreen({
  score,
  total,
  onReplay,
  onBackToMenu,
}: ResultScreenProps) {
  const percentage = Math.round((score / total) * 100)
  const message = getMessage(percentage)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl bg-white p-8 text-center shadow-xl"
    >
      <div className="text-6xl">{message.emoji}</div>
      <div>
        <p className="text-lg font-medium text-slate-500">הציון שלך</p>
        <motion.p
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
          className="flex items-baseline justify-center gap-1 bg-gradient-to-br from-violet-600 to-fuchsia-500 bg-clip-text text-transparent"
        >
          <span className="text-7xl font-extrabold">{percentage}</span>
          <span className="text-3xl font-bold">/100</span>
        </motion.p>
      </div>
      <p className="text-slate-600">
        ענית נכון על {score} מתוך {total} מילים
      </p>
      <p className="font-semibold text-slate-800">{message.text}</p>

      <div className="mt-2 flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={onReplay}
          className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-violet-700 active:scale-95"
        >
          <RotateCcw className="h-5 w-5" />
          שחק שוב
        </button>
        <button
          type="button"
          onClick={onBackToMenu}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
        >
          <Home className="h-5 w-5" />
          חזרה לתפריט
        </button>
      </div>
    </motion.div>
  )
}
