import { motion } from 'framer-motion'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { DIFFICULTIES, starsFor, type Difficulty } from './memoryLogic'
import { MemoryCard } from './MemoryCard'
import { useMemoryGame } from './useMemoryGame'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

interface MemoryBoardProps {
  difficulty: Difficulty
  onChangeDifficulty: () => void
}

export function MemoryBoard({ difficulty, onChangeDifficulty }: MemoryBoardProps) {
  const { cards, flipped, matched, moves, won, pairs, seconds, best, isNewRecord, flip, restart } =
    useMemoryGame(difficulty)
  const { columns, label } = DIFFICULTIES[difficulty]
  const stars = starsFor(moves, pairs)

  if (won) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl bg-white p-8 text-center shadow-xl"
      >
        <p className="text-4xl" aria-label={`${stars} כוכבים`}>
          {'⭐'.repeat(stars)}
          <span className="opacity-20">{'⭐'.repeat(3 - stars)}</span>
        </p>
        <p className="text-2xl font-extrabold text-slate-800">מצאת את כל הזוגות!</p>
        <div className="flex gap-6 text-slate-600">
          <p>
            מהלכים: <span className="font-bold text-slate-800">{moves}</span>
          </p>
          <p>
            זמן: <span className="font-bold text-slate-800" dir="ltr">{formatTime(seconds)}</span>
          </p>
        </div>
        {isNewRecord ? (
          <p className="rounded-full bg-amber-100 px-4 py-1 font-semibold text-amber-700">🏅 שיא חדש ברמה {label}!</p>
        ) : (
          best !== null && <p className="text-sm text-slate-500">השיא שלך ברמה {label}: {best} מהלכים</p>
        )}
        <div className="mt-2 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={restart}
            className="flex items-center justify-center gap-2 rounded-2xl bg-fuchsia-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-fuchsia-700 active:scale-95"
          >
            <RotateCcw className="h-5 w-5" aria-hidden />
            שחק שוב
          </button>
          <button
            type="button"
            onClick={onChangeDifficulty}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
          >
            <SlidersHorizontal className="h-5 w-5" aria-hidden />
            בחירת רמה
          </button>
        </div>
      </motion.div>
    )
  }

  const faceUp = (index: number) => flipped.includes(index) || matched.includes(cards[index].emoji)

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center justify-between text-sm font-medium text-slate-500">
        <span>
          זוגות: {matched.length}/{pairs}
        </span>
        <span>מהלכים: {moves}</span>
        <span dir="ltr">⏱ {formatTime(seconds)}</span>
      </div>

      <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {cards.map((card, index) => (
          <MemoryCard
            key={card.id}
            emoji={card.emoji}
            faceUp={faceUp(index)}
            matched={matched.includes(card.emoji)}
            onClick={() => flip(index)}
          />
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={restart}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          ערבוב מחדש
        </button>
        <button
          type="button"
          onClick={onChangeDifficulty}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          החלפת רמה
        </button>
      </div>
    </div>
  )
}
