import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/AppHeader'
import { RunnerBoard } from './RunnerBoard'

const CHARACTERS = ['🦖', '🦄', '🐕', '🐇', '🐈', '🐢']
const CHARACTER_KEY = 'brogan-runner-character'

function loadCharacter(): string | null {
  try {
    const c = localStorage.getItem(CHARACTER_KEY)
    return c && CHARACTERS.includes(c) ? c : null
  } catch {
    return null
  }
}

export function RunnerGame() {
  const navigate = useNavigate()
  const [character, setCharacter] = useState<string | null>(null)
  const [lastPicked] = useState(loadCharacter)

  const pick = (c: string) => {
    try {
      localStorage.setItem(CHARACTER_KEY, c)
    } catch {
      // not critical
    }
    setCharacter(c)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-50 via-white to-lime-50">
      <AppHeader title="רוץ, דינו, רוץ!" onBack={() => (character ? setCharacter(null) : navigate('/games'))} />

      <main className="flex flex-1 flex-col items-center gap-6 px-4 py-6">
        {character ? (
          <RunnerBoard character={character} onChangeCharacter={() => setCharacter(null)} />
        ) : (
          <div className="flex w-full max-w-sm flex-col gap-4 text-center">
            <p className="text-lg font-bold text-slate-700">בחרו רץ!</p>
            <p className="text-slate-500">הדמות רצה לבד - אתם רק נוגעים במסך כדי לקפוץ.</p>
            <div className="grid grid-cols-3 gap-3">
              {CHARACTERS.map((c) => (
                <motion.button
                  key={c}
                  type="button"
                  aria-label={`בחירת ${c}`}
                  onClick={() => pick(c)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  className={`flex aspect-square items-center justify-center rounded-2xl bg-white text-5xl shadow-md ${
                    c === lastPicked ? 'ring-4 ring-sky-400' : ''
                  }`}
                >
                  <span className="inline-block" style={{ transform: 'scaleX(-1)' }}>
                    {c}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
