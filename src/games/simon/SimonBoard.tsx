import { motion } from 'framer-motion'
import { Play, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { fitBoard } from '../../lib/fitBoard'
import { PADS, type Difficulty } from './simonLogic'
import { useSimonGame } from './useSimonGame'

interface SimonBoardProps {
  difficulty: Difficulty
  onChangeDifficulty: () => void
}

export function SimonBoard({ difficulty, onChangeDifficulty }: SimonBoardProps) {
  const { cfg, game, phase, lit, mood, best, isNewRecord, start, pressPad, restart } = useSimonGame(difficulty)
  const columns = cfg.pads === 4 ? 2 : 3
  const rows = cfg.pads / columns
  const length = game.sequence.length

  const status =
    phase === 'ready'
      ? length > 1
        ? 'ממשיכים מאותו רצף'
        : 'צפו בחיות, ואז לחצו עליהן באותו סדר'
      : phase === 'showing'
        ? 'צפו והקשיבו… 👀'
        : phase === 'input'
          ? `תורכם! ${game.inputIndex} מתוך ${length}`
          : mood === 'success'
            ? 'כל הכבוד! ✓ עכשיו רצף ארוך יותר'
            : mood === 'mistake'
              ? 'אופס! צפו שוב באותו רצף'
              : ''

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between gap-2 text-lg font-bold text-slate-700">
        <span>רצף: {length}</span>
        <span aria-label={`${game.lives} לבבות`}>
          {'❤️'.repeat(game.lives)}
          <span className="opacity-25">{'❤️'.repeat(cfg.lives - game.lives)}</span>
        </span>
        {best !== null && <span className="text-sm font-medium text-slate-500">שיא: {best}</span>}
      </div>

      <p
        aria-live="polite"
        className={`min-h-7 text-center text-lg font-bold ${
          mood === 'mistake' ? 'text-rose-600' : mood === 'success' ? 'text-emerald-700' : 'text-slate-700'
        }`}
      >
        {phase === 'over' ? '' : status}
      </p>

      <div
        dir="ltr"
        className="grid w-full gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...fitBoard('290px', columns / rows) }}
      >
        {PADS.slice(0, cfg.pads).map((pad, i) => {
          const isLit = lit === i
          return (
            <motion.button
              key={pad.name}
              type="button"
              aria-label={pad.name}
              disabled={phase !== 'input'}
              onPointerDown={(e) => {
                e.preventDefault()
                pressPad(i)
              }}
              animate={{ scale: isLit ? 1.06 : 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className={`flex aspect-square touch-manipulation select-none items-center justify-center rounded-3xl text-6xl shadow-md transition-colors duration-100 disabled:cursor-default ${
                isLit ? `${pad.lit} ring-8 ring-white/80` : pad.color
              } ${phase === 'input' || isLit ? 'opacity-100' : 'opacity-80'}`}
            >
              <span aria-hidden className={`emoji ${isLit ? 'drop-shadow-lg' : ''}`}>
                {pad.animal}
              </span>
            </motion.button>
          )
        })}
      </div>

      {phase === 'ready' && (
        <button
          type="button"
          onClick={start}
          className="flex items-center justify-center gap-2 self-center rounded-2xl bg-violet-600 px-8 py-3 text-xl font-bold text-white shadow-md transition hover:bg-violet-700 active:scale-95"
        >
          <Play className="h-6 w-6" aria-hidden />
          {length > 1 ? 'ממשיכים' : 'מתחילים'}
        </button>
      )}

      {phase === 'over' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-3xl bg-white p-5 text-center shadow-xl"
        >
          <p className="text-2xl font-extrabold text-slate-800">נגמרו הלבבות!</p>
          <p className="text-slate-600">זכרתם רצף של</p>
          <p className="text-5xl font-extrabold text-violet-600">{game.best}</p>
          {isNewRecord ? (
            <p className="rounded-full bg-amber-100 px-4 py-1 font-semibold text-amber-700">🏅 שיא חדש ברמה {cfg.label}!</p>
          ) : (
            best !== null && <p className="text-sm text-slate-500">השיא שלכם ברמה {cfg.label}: {best}</p>
          )}
          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={restart}
              className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-violet-700 active:scale-95"
            >
              <RotateCcw className="h-5 w-5" aria-hidden />
              שחקו שוב
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
      )}
    </div>
  )
}
