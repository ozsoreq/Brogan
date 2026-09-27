import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { DifficultyPicker } from '../../components/DifficultyPicker'
import { DIFFICULTIES, PERFECT_POINTS, type Difficulty } from './stackLogic'
import { StackBoard } from './StackBoard'

export function StackGame() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-50 via-white to-amber-50">
      <AppHeader title="בונים מגדל!" onBack={() => (difficulty ? setDifficulty(null) : navigate('/games'))} />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-4">
        {difficulty ? (
          <StackBoard key={difficulty} difficulty={difficulty} onChangeDifficulty={() => setDifficulty(null)} />
        ) : (
          <DifficultyPicker
            intro={`הבלוק זז מצד לצד - געו במסך כדי להפיל אותו על המגדל 🏗️. מה שבולט החוצה נחתך ונופל, אז כוונו בדיוק! הנחה מושלמת ✨ שווה ${PERFECT_POINTS} נקודות, וכמה מושלמות ברצף מרחיבות את המגדל בחזרה. כמה גבוה תגיעו? 🚀`}
            levels={DIFFICULTIES}
            onPick={setDifficulty}
          />
        )}
      </main>
    </div>
  )
}
