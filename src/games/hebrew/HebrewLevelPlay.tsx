import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { LevelResultScreen } from '../../components/LevelResultScreen'
import { TOTAL_LEVELS } from './levels'
import { QuestionPanel } from './QuestionPanel'
import { StoryCard } from './StoryCard'
import { useHebrewStoryGame } from './useHebrewStoryGame'

interface HebrewLevelPlayProps {
  level: number
  unlockUpTo: (level: number) => void
}

export function HebrewLevelPlay({ level, unlockUpTo }: HebrewLevelPlayProps) {
  const navigate = useNavigate()

  const {
    title,
    story,
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
  } = useHebrewStoryGame(level)

  useEffect(() => {
    if (finished && passed) unlockUpTo(level + 1)
  }, [finished, passed, level, unlockUpTo])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 via-white to-sky-50">
      <AppHeader title={`עברית · שלב ${level}`} onBack={() => navigate('/learning/hebrew')} />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 px-4 py-6">
        {finished ? (
          <LevelResultScreen
            level={level}
            totalLevels={TOTAL_LEVELS}
            score={score}
            total={total}
            itemLabel="שאלות"
            passed={passed}
            failHint="אפשר להסתכל שוב בסיפור!"
            retryButtonClass="bg-amber-500 hover:bg-amber-600"
            onRetry={restart}
            onNextLevel={() => navigate(`/learning/hebrew/${level + 1}`)}
            onBackToLevels={() => navigate('/learning/hebrew')}
          />
        ) : (
          <>
            <div className="flex w-full flex-col items-center gap-2">
              <div className="flex w-full items-center justify-between text-sm font-medium text-slate-500">
                <span>ניקוד: {score}</span>
                <span>
                  שאלה {currentIndex + 1} מתוך {total}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100">
                <motion.div
                  className="h-full rounded-full bg-amber-500"
                  initial={false}
                  animate={{ width: `${(currentIndex / total) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
            </div>

            <StoryCard title={title} story={story} />

            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  <QuestionPanel
                    question={currentQuestion}
                    selectedOption={selectedOption}
                    feedback={feedback}
                    locked={locked}
                    onSelect={selectOption}
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
