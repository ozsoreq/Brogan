import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { DifficultyPicker } from '../../components/DifficultyPicker'
import { DIFFICULTIES, ROUND_SECONDS, type Difficulty } from './whackLogic'
import { WhackBoard } from './WhackBoard'

const LEVELS = {
  easy: { ...DIFFICULTIES.easy, detail: 'בלי פצצות' },
  medium: { ...DIFFICULTIES.medium, detail: 'יותר מהר 💣' },
  hard: { ...DIFFICULTIES.hard, detail: 'סופר מהר 💣💣' },
}

export function WhackGame() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 via-white to-lime-50">
      <AppHeader
        title="תפסו את האוגר!"
        onBack={() => (difficulty ? setDifficulty(null) : navigate('/games'))}
      />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-6">
        {difficulty ? (
          <WhackBoard key={difficulty} difficulty={difficulty} onChangeDifficulty={() => setDifficulty(null)} />
        ) : (
          <DifficultyPicker
            intro={`יש לכם ${ROUND_SECONDS} שניות לתפוס כמה שיותר אוגרים 🐹. ברמות הקשות - היזהרו מהפצצות!`}
            levels={LEVELS}
            onPick={setDifficulty}
          />
        )}
      </main>
    </div>
  )
}
