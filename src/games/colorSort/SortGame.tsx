import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { DifficultyPicker } from '../../components/DifficultyPicker'
import { DIFFICULTY_KEYS } from '../../lib/difficulty'
import { useRouteChoice } from '../../lib/useRouteChoice'
import { DIFFICULTIES, type Difficulty } from './sortLogic'
import { SortBoard } from './SortBoard'

export function SortGame() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty, clearDifficulty] = useRouteChoice<Difficulty>('/games/colorsort', DIFFICULTY_KEYS)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-indigo-50 via-white to-sky-50">
      <AppHeader title="ממיינים צבעים" onBack={() => (difficulty ? clearDifficulty() : navigate('/games'))} />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-4">
        {difficulty ? (
          <SortBoard key={difficulty} difficulty={difficulty} onChangeDifficulty={clearDifficulty} />
        ) : (
          <DifficultyPicker
            intro="הכדורים התערבבו! 🎨 סדרו אותם כך שבכל מבחנה יהיו כדורים בצבע אחד. לוחצים על מבחנה כדי להרים את הכדור העליון, ואז על מבחנה אחרת כדי להניח אותו - על כדור באותו צבע או במבחנה ריקה. יש 5 שלבים, ואפשר לבטל מהלך או לבקש רמז."
            levels={DIFFICULTIES}
            onPick={setDifficulty}
          />
        )}
      </main>
    </div>
  )
}
