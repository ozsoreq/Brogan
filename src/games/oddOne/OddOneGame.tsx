import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { DifficultyPicker } from '../../components/DifficultyPicker'
import { DIFFICULTY_KEYS } from '../../lib/difficulty'
import { useRouteChoice } from '../../lib/useRouteChoice'
import { DIFFICULTIES, ROUND_SECONDS, type Difficulty } from './oddOneLogic'
import { OddOneBoard } from './OddOneBoard'

export function OddOneGame() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty, clearDifficulty] = useRouteChoice<Difficulty>('/games/oddone', DIFFICULTY_KEYS)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-teal-50 via-white to-sky-50">
      <AppHeader title="מצאו את השונה" onBack={() => (difficulty ? clearDifficulty() : navigate('/games'))} />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-4">
        {difficulty ? (
          <OddOneBoard key={difficulty} difficulty={difficulty} onChangeDifficulty={clearDifficulty} />
        ) : (
          <DifficultyPicker
            intro={`הלוח מלא בתמונות זהות, ורק אחת שונה 🔍. מצאו אותה ולחצו עליה מהר! כל מציאה מביאה לוח חדש, והלוח גדל. יש ${ROUND_SECONDS} שניות, ולחיצה לא נכונה עולה בשניות.`}
            levels={DIFFICULTIES}
            onPick={setDifficulty}
          />
        )}
      </main>
    </div>
  )
}
