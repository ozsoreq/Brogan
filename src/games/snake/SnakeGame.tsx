import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { DifficultyPicker } from '../../components/DifficultyPicker'
import { DIFFICULTY_KEYS } from '../../lib/difficulty'
import { useRouteChoice } from '../../lib/useRouteChoice'
import { BONUS_EVERY, DIFFICULTIES, type Difficulty } from './snakeLogic'
import { SnakeBoard } from './SnakeBoard'

export function SnakeGame() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty, clearDifficulty] = useRouteChoice<Difficulty>('/games/snake', DIFFICULTY_KEYS)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 via-white to-lime-50">
      <AppHeader title="הנחש הרעב" onBack={() => (difficulty ? clearDifficulty() : navigate('/games'))} />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-4">
        {difficulty ? (
          <SnakeBoard key={difficulty} difficulty={difficulty} onChangeDifficulty={() => clearDifficulty()} />
        ) : (
          <DifficultyPicker
            intro={`כוונו את הנחש 🐍 לאכול תפוחים 🍎 - כל תפוח מאריך אותו. כל ${BONUS_EVERY} תפוחים מופיע כוכב בונוס ⭐. אסור לנגוס בזנב!`}
            levels={DIFFICULTIES}
            onPick={setDifficulty}
          />
        )}
      </main>
    </div>
  )
}
