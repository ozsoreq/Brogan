import { useCallback, useState } from 'react'
import { useQuizSession } from '../../lib/useQuizSession'
import { buildLevel, type BuiltQuestion } from './levels'

const FEEDBACK_DELAY_MS = 1000

const isCorrectOption = (question: BuiltQuestion, option: string) =>
  option === question.options[question.correctIndex]

export function useHebrewStoryGame(level: number) {
  // The story itself never changes within a level; only the question/option
  // order is reshuffled on retry.
  const [{ title, story }] = useState(() => buildLevel(level))
  const build = useCallback(() => buildLevel(level).questions, [level])
  const session = useQuizSession(build, isCorrectOption, FEEDBACK_DELAY_MS)
  return {
    ...session,
    title,
    story,
    currentQuestion: session.currentItem,
    selectedOption: session.selectedAnswer,
    selectOption: session.select,
    passed: session.score === session.total,
  }
}
