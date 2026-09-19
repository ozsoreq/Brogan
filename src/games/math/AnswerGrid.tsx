import { motion } from 'framer-motion'
import type { Feedback } from '../../components/FeedbackOverlay'
import type { MathExercise } from './levels'

interface AnswerGridProps {
  exercise: MathExercise
  selectedAnswer: number | null
  feedback: Feedback
  locked: boolean
  onSelect: (value: number) => void
}

export function AnswerGrid({
  exercise,
  selectedAnswer,
  feedback,
  locked,
  onSelect,
}: AnswerGridProps) {
  return (
    <div className="grid w-full max-w-xs grid-cols-2 gap-3">
      {exercise.options.map((value, index) => {
        const isSelected = value === selectedAnswer
        const isCorrectValue = value === exercise.answer
        const revealCorrect = feedback === 'wrong' && isCorrectValue

        let tileStyle =
          'bg-white text-slate-700 shadow-sm hover:bg-violet-50 hover:shadow-md'
        if (feedback) {
          if (isSelected && feedback === 'correct') {
            tileStyle = 'bg-emerald-500 text-white shadow-md'
          } else if (isSelected && feedback === 'wrong') {
            tileStyle = 'bg-rose-500 text-white shadow-md'
          } else if (revealCorrect) {
            tileStyle = 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400'
          } else {
            tileStyle = 'bg-white text-slate-300'
          }
        }

        return (
          <motion.button
            key={`${value}-${index}`}
            type="button"
            disabled={locked}
            onClick={() => onSelect(value)}
            whileTap={{ scale: 0.94 }}
            whileHover={locked ? {} : { scale: 1.03 }}
            className={`rounded-2xl py-5 text-2xl font-bold transition-colors duration-200 sm:text-3xl ${tileStyle} disabled:cursor-default`}
          >
            {value}
          </motion.button>
        )
      })}
    </div>
  )
}
