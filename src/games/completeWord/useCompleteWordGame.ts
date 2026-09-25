import type { Feedback as SharedFeedback } from '../../components/FeedbackOverlay'
import { useQuizSession } from '../../lib/useQuizSession'
import { buildRounds, type Round } from './words'

export type Feedback = SharedFeedback

const FEEDBACK_DELAY_MS = 1100

const isCorrectLetter = (round: Round, letter: string) => letter === round.correctLetter

export function useCompleteWordGame() {
  const session = useQuizSession(buildRounds, isCorrectLetter, FEEDBACK_DELAY_MS)
  return {
    ...session,
    currentRound: session.currentItem,
    selectedLetter: session.selectedAnswer,
    selectLetter: session.select,
  }
}
