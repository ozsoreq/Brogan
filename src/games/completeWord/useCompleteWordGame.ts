import { useCallback, useMemo, useState } from 'react'
import { buildRounds, type Round } from './words'

export type Feedback = 'correct' | 'wrong' | null

const FEEDBACK_DELAY_MS = 1100

export function useCompleteWordGame() {
  const [gameKey, setGameKey] = useState(0)
  const rounds: Round[] = useMemo(() => buildRounds(), [gameKey])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [locked, setLocked] = useState(false)
  const [finished, setFinished] = useState(false)

  const currentRound = rounds[currentIndex]
  const isLastRound = currentIndex === rounds.length - 1

  const selectLetter = useCallback(
    (letter: string) => {
      if (locked || !currentRound) return

      const isCorrect = letter === currentRound.correctLetter
      setLocked(true)
      setSelectedLetter(letter)
      setFeedback(isCorrect ? 'correct' : 'wrong')
      if (isCorrect) setScore((s) => s + 1)

      setTimeout(() => {
        if (isLastRound) {
          setFinished(true)
        } else {
          setCurrentIndex((i) => i + 1)
          setSelectedLetter(null)
          setFeedback(null)
          setLocked(false)
        }
      }, FEEDBACK_DELAY_MS)
    },
    [locked, currentRound, isLastRound],
  )

  const restart = useCallback(() => {
    setGameKey((k) => k + 1)
    setCurrentIndex(0)
    setScore(0)
    setSelectedLetter(null)
    setFeedback(null)
    setLocked(false)
    setFinished(false)
  }, [])

  return {
    rounds,
    currentIndex,
    currentRound,
    score,
    selectedLetter,
    feedback,
    locked,
    finished,
    total: rounds.length,
    selectLetter,
    restart,
  }
}
