import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'

interface GameEntry {
  path: string
  title: string
  /** The game's own picture, so children who can't read yet can find it. */
  art: string
  gradient: string
  isNew?: boolean
}

const THINKING: GameEntry[] = [
  { path: 'oddone', title: 'מצאו את השונה', art: '🔍', gradient: 'from-teal-500 to-teal-700', isNew: true },
  { path: 'simon', title: 'זוכרים את הרצף', art: '🐶🎵', gradient: 'from-pink-500 to-violet-700' },
  { path: 'maze', title: 'העכבר במבוך', art: '🐭🧀', gradient: 'from-violet-500 to-purple-700' },
  { path: 'connect4', title: 'ארבע בשורה', art: '🔴🟡', gradient: 'from-blue-500 to-blue-700' },
  { path: 'memory', title: 'משחק הזיכרון', art: '🃏', gradient: 'from-fuchsia-500 to-pink-700' },
]

const QUICK: GameEntry[] = [
  { path: 'stack', title: 'בונים מגדל', art: '🏗️', gradient: 'from-sky-500 to-sky-700' },
  { path: 'bricks', title: 'שוברים לבנים', art: '🧱', gradient: 'from-indigo-500 to-indigo-700' },
  { path: 'snake', title: 'הנחש הרעב', art: '🐍', gradient: 'from-emerald-500 to-emerald-700' },
  { path: 'fruit', title: 'חותכים פירות', art: '🍉', gradient: 'from-rose-500 to-rose-700' },
  { path: 'runner', title: 'רוץ, דינו, רוץ', art: '🦖', gradient: 'from-cyan-500 to-teal-700' },
  { path: 'whack', title: 'תפסו את האוגר', art: '🐹', gradient: 'from-orange-500 to-orange-700' },
]

function GameTile({ game, onOpen }: { game: GameEntry; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.96 }}
      className={`relative flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-br p-3 text-white shadow-md ${game.gradient}`}
    >
      {game.isNew && (
        <span className="absolute left-2 top-2 rounded-full bg-amber-300 px-2 py-0.5 text-xs font-bold text-amber-950">חדש!</span>
      )}
      <span className="emoji text-5xl leading-none drop-shadow-sm" aria-hidden>
        {game.art}
      </span>
      <span className="text-center text-base font-bold leading-tight">{game.title}</span>
    </motion.button>
  )
}

function Section({ title, games }: { title: string; games: GameEntry[] }) {
  const navigate = useNavigate()
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-slate-700">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {games.map((game) => (
          <GameTile key={game.path} game={game} onOpen={() => navigate(`/games/${game.path}`)} />
        ))}
      </div>
    </section>
  )
}

export function GamesPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-fuchsia-50 via-white to-white">
      <AppHeader title="משחקים" onBack={() => navigate('/')} />

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-8 pt-2">
        <Section title="🧠 משחקי חשיבה" games={THINKING} />
        <Section title="⚡ משחקי זריזות" games={QUICK} />
      </main>
    </div>
  )
}
