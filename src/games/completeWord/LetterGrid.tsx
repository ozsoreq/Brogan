import { motion } from 'framer-motion'
import type { Round, Feedback } from './types'

interface LetterGridProps {
  round: Round
  selectedLetter: string | null
  feedback: Feedback
  locked: boolean
  onSelect: (letter: string) => void
}

export function LetterGrid({
  round,
  selectedLetter,
  feedback,
  locked,
  onSelect,
}: LetterGridProps) {
  return (
    <div
      className="grid w-full max-w-md grid-cols-5 gap-2 sm:gap-3"
      dir="rtl"
    >
      {round.options.map((letter, index) => {
        const isSelected = letter === selectedLetter
        const isCorrectLetter = letter === round.correctLetter
        const revealCorrect = feedback === 'wrong' && isCorrectLetter

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
            key={`${letter}-${index}`}
            type="button"
            disabled={locked}
            onClick={() => onSelect(letter)}
            whileTap={{ scale: 0.9 }}
            whileHover={locked ? {} : { scale: 1.05 }}
            className={`flex aspect-square items-center justify-center rounded-xl text-2xl font-bold transition-colors duration-200 sm:text-3xl ${tileStyle} disabled:cursor-default`}
          >
            {letter}
          </motion.button>
        )
      })}
    </div>
  )
}
