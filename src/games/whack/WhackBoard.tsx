import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { BOMB_PENALTY, ROUND_SECONDS, starsFor, type Difficulty, type Hole } from './whackLogic'
import { useWhackGame } from './useWhackGame'

const HOLE_EMOJI: Record<Hole['kind'], string> = { mole: '🐹', bomb: '💣', hit: '⭐', boom: '💥' }

interface WhackBoardProps {
  difficulty: Difficulty
  onChangeDifficulty: () => void
}

export function WhackBoard({ difficulty, onChangeDifficulty }: WhackBoardProps) {
  const { cfg, phase, countdown, timeLeft, holes, score, hits, bombsHit, best, isNewRecord, whackAt, restart } =
    useWhackGame(difficulty)

  if (phase === 'over') {
    const stars = starsFor(score, cfg)
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
        <p className="text-2xl font-extrabold text-slate-800">נגמר הזמן!</p>
        <p className="text-5xl font-extrabold text-orange-500">{score}</p>
        <p className="text-slate-600">
          תפסת {hits} אוגרים
          {cfg.bombChance > 0 && ` · נגעת ב-${bombsHit} פצצות`}
        </p>
        {isNewRecord ? (
          <p className="rounded-full bg-amber-100 px-4 py-1 font-semibold text-amber-700">🏅 שיא חדש ברמה {cfg.label}!</p>
        ) : (
          best !== null && <p className="text-sm text-slate-500">השיא שלך ברמה {cfg.label}: {best}</p>
        )}
        <div className="mt-2 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={restart}
            className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-orange-600 active:scale-95"
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

  return (
    <div className="relative flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center justify-between text-lg font-bold text-slate-700">
        <span>ניקוד: {score}</span>
        <span dir="ltr" className={timeLeft <= 5 && phase === 'playing' ? 'text-rose-500' : ''}>
          ⏱ {timeLeft}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-orange-100">
        <div
          className="h-full rounded-full bg-orange-500 transition-[width] duration-100 ease-linear"
          style={{ width: `${(timeLeft / ROUND_SECONDS) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-3xl bg-gradient-to-b from-lime-200 to-green-300 p-4 shadow-inner">
        {holes.map((hole, index) => (
          <button
            key={index}
            type="button"
            aria-label={hole?.kind === 'mole' ? 'אוגר' : hole?.kind === 'bomb' ? 'פצצה' : 'גומה ריקה'}
            onPointerDown={(e) => {
              e.preventDefault()
              whackAt(index)
            }}
            className="relative aspect-square touch-manipulation select-none overflow-hidden rounded-full bg-gradient-to-b from-amber-900 to-amber-700 shadow-[inset_0_8px_12px_rgba(0,0,0,0.45)]"
          >
            <AnimatePresence>
              {hole && (
                <motion.span
                  key={hole.id + hole.kind}
                  initial={{ y: '70%', scale: 0.6 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: '80%', opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl"
                >
                  {HOLE_EMOJI[hole.kind]}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-slate-500">
        גע באוגר 🐹 כשהוא יוצא
        {cfg.bombChance > 0 && ` · אל תיגע בפצצה 💣 (מינוס ${BOMB_PENALTY})`}
      </p>

      <AnimatePresence>
        {phase === 'countdown' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/70 backdrop-blur-sm"
          >
            <motion.span
              key={countdown}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-8xl font-extrabold text-orange-500"
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
