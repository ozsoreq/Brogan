import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { DifficultyPicker } from '../../components/DifficultyPicker'
import { DIFFICULTY_KEYS } from '../../lib/difficulty'
import { useRouteChoice } from '../../lib/useRouteChoice'
import { DIFFICULTIES, type Difficulty } from './simonLogic'
import { SimonBoard } from './SimonBoard'

export function SimonGame() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty, clearDifficulty] = useRouteChoice<Difficulty>('/games/simon', DIFFICULTY_KEYS)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-violet-50 via-white to-pink-50">
      <AppHeader title="זוכרים את הרצף" onBack={() => (difficulty ? clearDifficulty() : navigate('/games'))} />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-4">
        {difficulty ? (
          <SimonBoard key={difficulty} difficulty={difficulty} onChangeDifficulty={clearDifficulty} />
        ) : (
          <DifficultyPicker
            intro="החיות מתעוררות אחת אחרי השנייה 🐶🐸🐱🐵, וכל אחת עם צליל משלה 🎵. צפו והקשיבו, ואז לחצו על החיות באותו סדר בדיוק. בכל סבב הרצף מתארך בעוד חיה - כמה ארוך תצליחו לזכור?"
            levels={DIFFICULTIES}
            onPick={setDifficulty}
          />
        )}
      </main>
    </div>
  )
}
