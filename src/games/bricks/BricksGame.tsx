import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { DifficultyPicker } from '../../components/DifficultyPicker'
import { DIFFICULTY_KEYS } from '../../lib/difficulty'
import { useRouteChoice } from '../../lib/useRouteChoice'
import { DIFFICULTIES, STAR_POINTS, type Difficulty } from './bricksLogic'
import { BricksBoard } from './BricksBoard'

export function BricksGame() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty, clearDifficulty] = useRouteChoice<Difficulty>('/games/bricks', DIFFICULTY_KEYS)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-indigo-50 via-white to-violet-50">
      <AppHeader title="שוברים לבנים!" onBack={() => (difficulty ? clearDifficulty() : navigate('/games'))} />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-4">
        {difficulty ? (
          <BricksBoard key={difficulty} difficulty={difficulty} onChangeDifficulty={() => clearDifficulty()} />
        ) : (
          <DifficultyPicker
            intro={`גררו את המחבט והקפיצו את הכדור אל הלבנים 🧱 כדי לשבור את כולן. לבנה עם כוכב ⭐ מפילה כוכב - תפסו אותו במחבט וקבלו ${STAR_POINTS} נקודות. אל תתנו לכדור ליפול!`}
            levels={DIFFICULTIES}
            onPick={setDifficulty}
          />
        )}
      </main>
    </div>
  )
}
