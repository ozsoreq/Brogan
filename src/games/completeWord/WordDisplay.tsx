import { motion } from 'framer-motion'
import type { Round, Feedback } from './types'

interface WordDisplayProps {
  round: Round
  feedback: Feedback
}

export function WordDisplay({ round, feedback }: WordDisplayProps) {
  const letters = round.word.split('')

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        key={round.word}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-7xl sm:text-8xl"
      >
        {round.emoji}
      </motion.div>

      <div className="flex gap-2 sm:gap-3" dir="rtl">
        {letters.map((char, index) => {
          const isBlank = index === round.blankIndex

          if (!isBlank) {
            return (
              <div
                key={index}
                className="flex h-16 w-14 items-center justify-center rounded-2xl bg-white text-4xl font-bold text-slate-800 shadow-sm sm:h-20 sm:w-16 sm:text-5xl"
              >
                {char}
              </div>
            )
          }

          const showAnswer = feedback !== null
          const answerColor =
            feedback === 'correct'
              ? 'bg-emerald-100 text-emerald-600 border-emerald-400'
              : 'bg-rose-100 text-rose-600 border-rose-400'

          return (
            <motion.div
              key={index}
              animate={
                feedback === 'wrong' ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }
              }
              transition={{ duration: 0.4 }}
              className={`flex h-16 w-14 items-center justify-center rounded-2xl border-2 border-dashed text-4xl font-bold shadow-sm sm:h-20 sm:w-16 sm:text-5xl ${
                showAnswer
                  ? answerColor
                  : 'border-violet-300 bg-violet-50 text-violet-300'
              }`}
            >
              {showAnswer ? char : ''}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
