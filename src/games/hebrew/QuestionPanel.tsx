import { motion } from 'framer-motion'
import type { Feedback } from '../../components/FeedbackOverlay'
import type { BuiltQuestion } from './levels'

interface QuestionPanelProps {
  question: BuiltQuestion
  selectedOption: string | null
  feedback: Feedback
  locked: boolean
  onSelect: (option: string) => void
}

export function QuestionPanel({
  question,
  selectedOption,
  feedback,
  locked,
  onSelect,
}: QuestionPanelProps) {
  const correctOption = question.options[question.correctIndex]

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-xl font-bold text-slate-800">{question.prompt}</p>
      <div className="flex flex-col gap-3">
        {question.options.map((option, index) => {
          const isSelected = option === selectedOption
          const isCorrectOption = option === correctOption
          const revealCorrect = feedback === 'wrong' && isCorrectOption

          let tileStyle =
            'bg-white text-slate-700 shadow-sm hover:bg-amber-50 hover:shadow-md'
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
              key={`${option}-${index}`}
              type="button"
              disabled={locked}
              onClick={() => onSelect(option)}
              whileTap={{ scale: 0.97 }}
              whileHover={locked ? {} : { scale: 1.01 }}
              className={`rounded-2xl px-5 py-4 text-right text-lg font-semibold transition-colors duration-200 ${tileStyle} disabled:cursor-default`}
            >
              {option}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
