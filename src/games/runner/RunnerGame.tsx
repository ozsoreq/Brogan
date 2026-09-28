import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { DifficultyPicker } from '../../components/DifficultyPicker'
import { DIFFICULTY_KEYS } from '../../lib/difficulty'
import { useRouteChoice } from '../../lib/useRouteChoice'
import { DIFFICULTIES, type Difficulty } from './runnerLogic'
import { RunnerBoard } from './RunnerBoard'

const CHARACTERS = ['🦖', '🦄', '🐕', '🐇', '🐈', '🐢']
const CHARACTER_KEY = 'brogan-runner-character'

function loadCharacter(): string {
  try {
    const c = localStorage.getItem(CHARACTER_KEY)
    return c && CHARACTERS.includes(c) ? c : CHARACTERS[0]
  } catch {
    return CHARACTERS[0]
  }
}

export function RunnerGame() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty, clearDifficulty] = useRouteChoice<Difficulty>('/games/runner', DIFFICULTY_KEYS)
  const [character, setCharacter] = useState(loadCharacter)

  const pickCharacter = (c: string) => {
    try {
      localStorage.setItem(CHARACTER_KEY, c)
    } catch {
      // not critical
    }
    setCharacter(c)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-50 via-white to-lime-50">
      <AppHeader title="רוץ, דינו, רוץ!" onBack={() => (difficulty ? clearDifficulty() : navigate('/games'))} />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-6">
        {difficulty ? (
          <RunnerBoard
            key={difficulty}
            character={character}
            difficulty={difficulty}
            onChangeDifficulty={clearDifficulty}
          />
        ) : (
          <div className="flex w-full max-w-sm flex-col gap-4 text-center">
            <p className="text-lg font-bold text-slate-700">בחרו רץ!</p>
            <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="בחירת דמות">
              {CHARACTERS.map((c) => (
                <motion.button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={c === character}
                  aria-label={`בחירת ${c}`}
                  onClick={() => pickCharacter(c)}
                  whileTap={{ scale: 0.92 }}
                  className={`flex aspect-square items-center justify-center rounded-2xl text-3xl shadow-md transition ${
                    c === character ? 'bg-sky-100 ring-4 ring-sky-500' : 'bg-white'
                  }`}
                >
                  <span className="inline-block" style={{ transform: 'scaleX(-1)' }}>
                    {c}
                  </span>
                </motion.button>
              ))}
            </div>
            <DifficultyPicker
              intro="הדמות רצה לבד - אתם רק נוגעים במסך כדי לקפוץ מעל המכשולים ולתפוס כוכבים ⭐."
              levels={DIFFICULTIES}
              onPick={setDifficulty}
            />
          </div>
        )}
      </main>
    </div>
  )
}
