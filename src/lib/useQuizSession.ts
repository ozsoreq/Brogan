import { useCallback, useEffect, useRef, useState } from 'react'
import type { Feedback } from '../components/FeedbackOverlay'

// Shared flow for every question-by-question game: pick an answer, show
// feedback for `feedbackDelayMs`, then advance (or finish after the last item).
export function useQuizSession<Item, Answer>(
  build: () => Item[],
  isCorrect: (item: Item, answer: Answer) => boolean,
  feedbackDelayMs: number,
) {
  const [items, setItems] = useState<Item[]>(build)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [finished, setFinished] = useState(false)

  // A ref (not state) so two taps landing in the same frame can't both score.
  const lockedRef = useRef(false)
  const [locked, setLocked] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    [],
  )

  const currentItem = items[currentIndex]

  const select = useCallback(
    (answer: Answer) => {
      if (lockedRef.current || !currentItem) return
      lockedRef.current = true
      setLocked(true)

      const correct = isCorrect(currentItem, answer)
      setSelectedAnswer(answer)
      setFeedback(correct ? 'correct' : 'wrong')
      if (correct) setScore((s) => s + 1)

      const isLast = currentIndex === items.length - 1
      timeoutRef.current = setTimeout(() => {
        setSelectedAnswer(null)
        setFeedback(null)
        if (isLast) {
          setFinished(true)
        } else {
          setCurrentIndex((i) => i + 1)
          lockedRef.current = false
          setLocked(false)
        }
      }, feedbackDelayMs)
    },
    [currentItem, currentIndex, items.length, isCorrect, feedbackDelayMs],
  )

  const restart = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setItems(build())
    setCurrentIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setFeedback(null)
    setFinished(false)
    lockedRef.current = false
    setLocked(false)
  }, [build])

  return {
    items,
    currentIndex,
    currentItem,
    score,
    selectedAnswer,
    feedback,
    locked,
    finished,
    total: items.length,
    select,
    restart,
  }
}
