import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { DifficultyPicker } from '../../components/DifficultyPicker'
import { DIFFICULTIES, ROUND_SECONDS, START_LIVES, type Difficulty } from './fruitLogic'
import { FruitBoard } from './FruitBoard'

export function FruitGame() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50 via-white to-amber-50">
      <AppHeader title="חותכים פירות!" onBack={() => (difficulty ? setDifficulty(null) : navigate('/games'))} />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-4">
        {difficulty ? (
          <FruitBoard key={difficulty} difficulty={difficulty} onChangeDifficulty={() => setDifficulty(null)} />
        ) : (
          <DifficultyPicker
            intro={`החליקו את האצבע על הפירות כדי לחתוך אותם 🍉 - שלושה פירות בהחלקה אחת שווים בונוס 🔥. יש ${ROUND_SECONDS} שניות ו-${START_LIVES} לבבות, ואסור לחתוך פצצות 💣!`}
            levels={DIFFICULTIES}
            onPick={setDifficulty}
          />
        )}
      </main>
    </div>
  )
}
