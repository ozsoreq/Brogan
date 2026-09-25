import { useCallback, useState } from 'react'
import { useQuizSession } from '../../lib/useQuizSession'
import { buildLevelExercises, PASS_RATIO, type MathExercise } from './levels'

const FEEDBACK_DELAY_MS = 900

const isCorrectAnswer = (exercise: MathExercise, value: number) => value === exercise.answer

export function useMathGame(level: number) {
  // Generated once per visit to the level, so "נסה שוב" replays the exact
  // same exercises the player just failed. Re-entering the level from the
  // level select screen generates a fresh set.
  const [exercises] = useState(() => buildLevelExercises(level))
  const build = useCallback(() => exercises, [exercises])
  const session = useQuizSession(build, isCorrectAnswer, FEEDBACK_DELAY_MS)
  return {
    ...session,
    currentExercise: session.currentItem,
    selectAnswer: session.select,
    passed: session.score / session.total >= PASS_RATIO,
  }
}
