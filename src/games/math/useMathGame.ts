import { useCallback } from 'react'
import { useQuizSession } from '../../lib/useQuizSession'
import { buildLevelExercises, PASS_RATIO, type MathExercise } from './levels'

const FEEDBACK_DELAY_MS = 900

const isCorrectAnswer = (exercise: MathExercise, value: number) => value === exercise.answer

export function useMathGame(level: number) {
  const build = useCallback(() => buildLevelExercises(level), [level])
  const session = useQuizSession(build, isCorrectAnswer, FEEDBACK_DELAY_MS)
  return {
    ...session,
    currentExercise: session.currentItem,
    selectAnswer: session.select,
    passed: session.score / session.total >= PASS_RATIO,
  }
}
