import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { DifficultyPicker } from '../../components/DifficultyPicker'
import { DIFFICULTY_KEYS } from '../../lib/difficulty'
import { useRouteChoice } from '../../lib/useRouteChoice'
import { DIFFICULTIES, type Difficulty } from './mazeLogic'
import { MazeBoard } from './MazeBoard'

export function MazeGame() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty, clearDifficulty] = useRouteChoice<Difficulty>('/games/maze', DIFFICULTY_KEYS)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-violet-50 via-white to-amber-50">
      <AppHeader title="העכבר במבוך" onBack={() => (difficulty ? clearDifficulty() : navigate('/games'))} />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-4">
        {difficulty ? (
          <MazeBoard key={difficulty} difficulty={difficulty} onChangeDifficulty={() => clearDifficulty()} />
        ) : (
          <DifficultyPicker
            intro="עזרו לעכבר 🐭 למצוא את הגבינה 🧀! החליקו על המבוך או לחצו על החצים - העכבר רץ לאורך המסדרון עד הפנייה הבאה. בדרך אפשר לאסוף כוכבים ⭐. יש 5 מבוכים, וכל אחד גדול יותר מהקודם."
            levels={DIFFICULTIES}
            onPick={setDifficulty}
          />
        )}
      </main>
    </div>
  )
}
