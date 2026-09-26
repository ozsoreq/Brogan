import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { DifficultyPicker } from '../../components/DifficultyPicker'
import { DIFFICULTIES, type Difficulty } from './memoryLogic'
import { MemoryBoard } from './MemoryBoard'

const LEVELS = {
  easy: { ...DIFFICULTIES.easy, detail: `${DIFFICULTIES.easy.pairs} זוגות` },
  medium: { ...DIFFICULTIES.medium, detail: `${DIFFICULTIES.medium.pairs} זוגות` },
  hard: { ...DIFFICULTIES.hard, detail: `${DIFFICULTIES.hard.pairs} זוגות` },
}

export function MemoryGame() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-fuchsia-50 via-white to-sky-50">
      <AppHeader
        title="משחק הזיכרון"
        onBack={() => (difficulty ? setDifficulty(null) : navigate('/games'))}
      />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-6">
        {difficulty ? (
          <MemoryBoard key={difficulty} difficulty={difficulty} onChangeDifficulty={() => setDifficulty(null)} />
        ) : (
          <DifficultyPicker
            intro="הפכו שני קלפים בכל תור ומצאו את כל הזוגות. כמה שפחות מהלכים - יותר כוכבים!"
            levels={LEVELS}
            onPick={setDifficulty}
          />
        )}
      </main>
    </div>
  )
}
