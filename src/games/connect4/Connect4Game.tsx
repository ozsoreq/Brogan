import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { DifficultyPicker } from '../../components/DifficultyPicker'
import { DIFFICULTIES, type Difficulty } from './connect4Logic'
import { Connect4Board } from './Connect4Board'

export function Connect4Game() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 via-white to-amber-50">
      <AppHeader title="ארבע בשורה" onBack={() => (difficulty ? setDifficulty(null) : navigate('/games'))} />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-4">
        {difficulty ? (
          <Connect4Board key={difficulty} difficulty={difficulty} onChangeDifficulty={() => setDifficulty(null)} />
        ) : (
          <DifficultyPicker
            intro="משחקים בתורות מול המחשב: אתם מפילים דיסקיות אדומות 🔴 והמחשב צהובות 🟡. מי שמסדר ראשון ארבע דיסקיות ברצף - לרוחב, לגובה או באלכסון - מנצח!"
            levels={DIFFICULTIES}
            onPick={setDifficulty}
          />
        )}
      </main>
    </div>
  )
}
