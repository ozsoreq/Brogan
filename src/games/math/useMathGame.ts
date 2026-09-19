import { useCallback, useMemo, useState } from 'react'
import type { Feedback } from '../../components/FeedbackOverlay'
import { buildLevelExercises, EXERCISES_PER_LEVEL, PASS_RATIO, type MathExercise } from './levels'

const FEEDBACK_DELAY_MS = 900

export function useMathGame(level: number) {
  const [attemptKey, setAttemptKey] = useState(0)
  const exercises: MathExercise[] = useMemo(
    () => buildLevelExercises(level),
    [level, attemptKey],
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [locked, setLocked] = useState(false)
  const [finished, setFinished] = useState(false)

  const currentExercise = exercises[currentIndex]
  const isLastExercise = currentIndex === exercises.length - 1

  const selectAnswer = useCallback(
    (value: number) => {
      if (locked || !currentExercise) return

      const isCorrect = value === currentExercise.answer
      setLocked(true)
      setSelectedAnswer(value)
      setFeedback(isCorrect ? 'correct' : 'wrong')
      if (isCorrect) setScore((s) => s + 1)

      setTimeout(() => {
        setSelectedAnswer(null)
        setFeedback(null)
        if (isLastExercise) {
          setFinished(true)
        } else {
          setCurrentIndex((i) => i + 1)
          setLocked(false)
        }
      }, FEEDBACK_DELAY_MS)
    },
    [locked, currentExercise, isLastExercise],
  )

  const restart = useCallback(() => {
    setAttemptKey((k) => k + 1)
    setCurrentIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setFeedback(null)
    setLocked(false)
    setFinished(false)
  }, [])

  const passed = score / EXERCISES_PER_LEVEL >= PASS_RATIO

  return {
    exercises,
    currentIndex,
    currentExercise,
    score,
    selectedAnswer,
    feedback,
    locked,
    finished,
    passed,
    total: exercises.length,
    selectAnswer,
    restart,
  }
}
