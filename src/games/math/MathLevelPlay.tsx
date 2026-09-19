import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { FeedbackOverlay } from '../../components/FeedbackOverlay'
import { AnswerGrid } from './AnswerGrid'
import { ExerciseDisplay } from './ExerciseDisplay'
import { MathResultScreen } from './MathResultScreen'
import { useMathGame } from './useMathGame'

interface MathLevelPlayProps {
  level: number
  unlockUpTo: (level: number) => void
}

export function MathLevelPlay({ level, unlockUpTo }: MathLevelPlayProps) {
  const navigate = useNavigate()

  const {
    currentIndex,
    currentExercise,
    score,
    selectedAnswer,
    feedback,
    locked,
    finished,
    passed,
    total,
    selectAnswer,
    restart,
  } = useMathGame(level)

  useEffect(() => {
    if (finished && passed) unlockUpTo(level + 1)
  }, [finished, passed, level, unlockUpTo])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-50 via-white to-violet-50">
      <AppHeader title={`חשבון · שלב ${level}`} onBack={() => navigate('/learning/math')} />

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
        {finished ? (
          <MathResultScreen
            level={level}
            score={score}
            passed={passed}
            onRetry={restart}
            onNextLevel={() => navigate(`/learning/math/${level + 1}`)}
            onBackToLevels={() => navigate('/learning/math')}
          />
        ) : (
          <>
            <div className="flex w-full max-w-xs flex-col items-center gap-2">
              <div className="flex w-full items-center justify-between text-sm font-medium text-slate-500">
                <span>ניקוד: {score}</span>
                <span>
                  תרגיל {currentIndex + 1} מתוך {total}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-sky-100">
                <motion.div
                  className="h-full rounded-full bg-sky-500"
                  initial={false}
                  animate={{ width: `${(currentIndex / total) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {currentExercise && (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center gap-10"
                >
                  <ExerciseDisplay exercise={currentExercise} feedback={feedback} />
                  <AnswerGrid
                    exercise={currentExercise}
                    selectedAnswer={selectedAnswer}
                    feedback={feedback}
                    locked={locked}
                    onSelect={selectAnswer}
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
