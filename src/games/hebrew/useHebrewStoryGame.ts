import { useCallback, useMemo, useState } from 'react'
import type { Feedback } from '../../components/FeedbackOverlay'
import { buildLevel, type BuiltLevel } from './levels'

const FEEDBACK_DELAY_MS = 1000

export function useHebrewStoryGame(level: number) {
  const [attemptKey, setAttemptKey] = useState(0)
  const built: BuiltLevel = useMemo(() => buildLevel(level), [level, attemptKey])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [locked, setLocked] = useState(false)
  const [finished, setFinished] = useState(false)

  const currentQuestion = built.questions[currentIndex]
  const isLastQuestion = currentIndex === built.questions.length - 1

  const selectOption = useCallback(
    (option: string) => {
      if (locked || !currentQuestion) return

      const isCorrect = option === currentQuestion.options[currentQuestion.correctIndex]
      setLocked(true)
      setSelectedOption(option)
      setFeedback(isCorrect ? 'correct' : 'wrong')
      if (isCorrect) setScore((s) => s + 1)

      setTimeout(() => {
        setSelectedOption(null)
        setFeedback(null)
        if (isLastQuestion) {
          setFinished(true)
        } else {
          setCurrentIndex((i) => i + 1)
          setLocked(false)
        }
      }, FEEDBACK_DELAY_MS)
    },
    [locked, currentQuestion, isLastQuestion],
  )

  const restart = useCallback(() => {
    setAttemptKey((k) => k + 1)
    setCurrentIndex(0)
    setScore(0)
    setSelectedOption(null)
    setFeedback(null)
    setLocked(false)
    setFinished(false)
  }, [])

  const total = built.questions.length
  const passed = score === total

  return {
    title: built.title,
    story: built.story,
    questions: built.questions,
    currentIndex,
    currentQuestion,
    score,
    selectedOption,
    feedback,
    locked,
    finished,
    passed,
    total,
    selectOption,
    restart,
  }
}
