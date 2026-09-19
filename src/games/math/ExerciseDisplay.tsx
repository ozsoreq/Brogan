import { motion } from 'framer-motion'
import type { Feedback } from '../../components/FeedbackOverlay'
import type { MathExercise } from './levels'

interface ExerciseDisplayProps {
  exercise: MathExercise
  feedback: Feedback
}

export function ExerciseDisplay({ exercise, feedback }: ExerciseDisplayProps) {
  return (
    <motion.div
      key={`${exercise.a}${exercise.operator}${exercise.b}`}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`flex items-center gap-3 rounded-3xl bg-white px-8 py-6 text-4xl font-extrabold text-slate-800 shadow-sm sm:text-5xl ${
        feedback === 'wrong' ? 'ring-2 ring-rose-300' : feedback === 'correct' ? 'ring-2 ring-emerald-300' : ''
      }`}
      dir="ltr"
    >
      <span>{exercise.a}</span>
      <span className="text-violet-500">{exercise.operator}</span>
      <span>{exercise.b}</span>
      <span className="text-slate-300">=</span>
      <span className="text-violet-400">?</span>
    </motion.div>
  )
}
