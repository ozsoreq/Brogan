import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { useCompleteWordGame } from './useCompleteWordGame'
import { WordDisplay } from './WordDisplay'
import { LetterGrid } from './LetterGrid'
import { ResultScreen } from './ResultScreen'

export function CompleteWordGame() {
  const navigate = useNavigate()
  const {
    currentIndex,
    currentRound,
    score,
    selectedLetter,
    feedback,
    locked,
    finished,
    total,
    selectLetter,
    restart,
  } = useCompleteWordGame()

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-violet-50 via-white to-fuchsia-50">
      <AppHeader
        title="השלם את המילה"
        onBack={() => navigate('/learning')}
      />

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
        {finished ? (
          <ResultScreen
            score={score}
            total={total}
            onReplay={restart}
            onBackToMenu={() => navigate('/learning')}
          />
        ) : (
          <>
            <div className="flex w-full max-w-md flex-col items-center gap-2">
              <div className="flex w-full items-center justify-between text-sm font-medium text-slate-500">
                <span>ניקוד: {score}</span>
                <span>
                  מילה {currentIndex + 1} מתוך {total}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-violet-100">
                <motion.div
                  className="h-full rounded-full bg-violet-500"
                  initial={false}
                  animate={{ width: `${(currentIndex / total) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {currentRound && (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center gap-10"
                >
                  <WordDisplay round={currentRound} feedback={feedback} />
                  <LetterGrid
                    round={currentRound}
                    selectedLetter={selectedLetter}
                    feedback={feedback}
                    locked={locked}
                    onSelect={selectLetter}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      <FeedbackOverlay feedback={feedback} />
    </div>
  )
}
