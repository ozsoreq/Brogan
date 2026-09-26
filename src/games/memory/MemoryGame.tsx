import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { DIFFICULTIES, type Difficulty } from './memoryLogic'
import { MemoryBoard } from './MemoryBoard'

const LEVEL_COLORS: Record<Difficulty, string> = {
  easy: 'from-emerald-400 to-teal-500',
  medium: 'from-sky-400 to-indigo-500',
  hard: 'from-fuchsia-500 to-rose-500',
}

export function MemoryGame() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-fuchsia-50 via-white to-sky-50">
      <AppHeader
        title="משחק הזיכרון"
        onBack={() => (difficulty ? setDifficulty(null) : navigate('/games'))}
      />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-6">
        {difficulty ? (
          <MemoryBoard key={difficulty} difficulty={difficulty} onChangeDifficulty={() => setDifficulty(null)} />
        ) : (
          <div className="flex w-full max-w-sm flex-col gap-4">
            <p className="text-center text-slate-600">
              הפכו שני קלפים בכל תור ומצאו את כל הזוגות. כמה שפחות מהלכים - יותר כוכבים!
            </p>
            {(Object.keys(DIFFICULTIES) as Difficulty[]).map((key) => {
              const { label, grades, pairs } = DIFFICULTIES[key]
              return (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => setDifficulty(key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center justify-between rounded-2xl bg-gradient-to-br ${LEVEL_COLORS[key]} px-6 py-5 text-white shadow-md`}
                >
                  <span className="text-right">
                    <span className="block text-2xl font-extrabold">{label}</span>
                    <span className="text-sm text-white/85">{grades}</span>
                  </span>
                  <span className="text-lg font-semibold">{pairs} זוגות</span>
                </motion.button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
