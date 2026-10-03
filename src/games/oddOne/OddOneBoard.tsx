import { motion } from 'framer-motion'
import { Play, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { PauseButton, PauseOverlay } from '../../components/Pause'
import { fitBoard } from '../../lib/fitBoard'
import { ROUND_SECONDS, showHint, timeLeft, type Difficulty } from './oddOneLogic'
import { useOddOneGame } from './useOddOneGame'

interface OddOneBoardProps {
  difficulty: Difficulty
  onChangeDifficulty: () => void
}

export function OddOneBoard({ difficulty, onChangeDifficulty }: OddOneBoardProps) {
  const { cfg, state, phase, missed, best, isNewRecord, start, tap, restart, paused, pause, resume } =
    useOddOneGame(difficulty)
  const { round } = state
  const seconds = Math.ceil(timeLeft(state))
  const hint = phase === 'playing' && showHint(state, cfg)
  const cellFont = `${(100 / round.size) * 0.6}cqw`

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between gap-2 text-lg font-bold text-slate-700">
        <span>נמצאו: {state.found}</span>
        <span dir="ltr" className={seconds <= 10 && phase === 'playing' ? 'text-rose-600' : ''}>
          ⏱ {seconds}
        </span>
        <PauseButton onPause={pause} disabled={phase !== 'playing'} />
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-teal-100">
        <div className="h-full rounded-full bg-teal-500" style={{ width: `${(timeLeft(state) / ROUND_SECONDS) * 100}%` }} />
      </div>

      <div
        dir="ltr"
        className="relative aspect-square w-full rounded-3xl bg-white p-2 shadow-lg"
        style={{ containerType: 'inline-size', ...fitBoard('250px') }}
      >
        <div
          key={`${state.found}-${round.pairIndex}`}
          className="grid h-full w-full gap-1"
          style={{ gridTemplateColumns: `repeat(${round.size}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: round.size * round.size }, (_, i) => {
            const isOdd = i === round.oddIndex
            return (
              <motion.button
                key={i}
                type="button"
                aria-label={`תמונה ${i + 1}`}
                disabled={phase !== 'playing'}
                onPointerDown={(e) => {
                  e.preventDefault()
                  tap(i)
                }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={
                  missed === i
                    ? { x: [0, -6, 6, -6, 6, 0], rotate: 0, scale: 1, opacity: 1 }
                    : isOdd && hint
                      ? { rotate: [0, -12, 12, -12, 0], x: 0, scale: 1, opacity: 1 }
                      : { rotate: 0, x: 0, scale: 1, opacity: 1 }
                }
                transition={
                  isOdd && hint ? { rotate: { repeat: Infinity, duration: 0.8, repeatDelay: 0.6 } } : { duration: 0.25 }
                }
                className={`emoji flex touch-manipulation select-none items-center justify-center rounded-xl leading-none transition-colors disabled:cursor-default ${
                  missed === i ? 'bg-rose-200' : 'bg-teal-50'
                }`}
                style={{ fontSize: cellFont }}
              >
                {phase === 'ready' ? '' : isOdd ? round.odd : round.base}
              </motion.button>
            )
          })}
        </div>

        {phase === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/90 p-4 text-center" dir="rtl">
            <span className="emoji text-6xl" aria-hidden>
              🔍
            </span>
            <p className="text-xl font-extrabold text-slate-800">מצאו את התמונה השונה!</p>
            <button
              type="button"
              onClick={start}
              className="flex items-center gap-2 rounded-2xl bg-teal-600 px-8 py-3 text-xl font-bold text-white shadow-md transition hover:bg-teal-700 active:scale-95"
            >
              <Play className="h-6 w-6" aria-hidden />
              מתחילים
            </button>
          </div>
        )}
        {paused && <PauseOverlay onResume={resume} />}
      </div>

      {phase === 'over' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-3xl bg-white p-5 text-center shadow-xl"
        >
          <p className="text-2xl font-extrabold text-slate-800">נגמר הזמן!</p>
          <p className="text-slate-600">מצאתם</p>
          <p className="text-5xl font-extrabold text-teal-600">{state.found}</p>
          {state.mistakes > 0 && <p className="text-sm text-slate-500">לחיצות לא נכונות: {state.mistakes}</p>}
          {isNewRecord ? (
            <p className="rounded-full bg-amber-100 px-4 py-1 font-semibold text-amber-700">🏅 שיא חדש ברמה {cfg.label}!</p>
          ) : (
            best !== null && <p className="text-sm text-slate-500">השיא שלכם ברמה {cfg.label}: {best}</p>
          )}
          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={restart}
              className="flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-teal-700 active:scale-95"
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
