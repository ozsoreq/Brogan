import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Lightbulb, RotateCcw, SlidersHorizontal, Undo2 } from 'lucide-react'
import { fitBoard } from '../../lib/fitBoard'
import { colorOf, isTubeDone, type Ball, type Difficulty } from './sortLogic'
import { useSortGame, type Hint } from './useSortGame'

// Every colour also has its own shape, so the puzzle works for colour-blind children too.
const BALLS: { color: string; ink: string; shape: ReactNode }[] = [
  { color: '#ef4444', ink: '#fff', shape: <circle cx="12" cy="12" r="6" /> },
  { color: '#f97316', ink: '#fff', shape: <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" /> },
  { color: '#facc15', ink: '#92400e', shape: <path d="M12 4l8 15H4z" /> },
  { color: '#22c55e', ink: '#fff', shape: <rect x="6" y="6" width="12" height="12" rx="1" /> },
  { color: '#3b82f6', ink: '#fff', shape: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /> },
  { color: '#a855f7', ink: '#fff', shape: <path d="M12 3l8 9-8 9-8-9z" /> },
  { color: '#ec4899', ink: '#fff', shape: <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" /> },
  { color: '#92400e', ink: '#fde68a', shape: <path d="M15 3a9 9 0 1 0 6 15A7 7 0 0 1 15 3z" /> },
]

function BallView({ ball, size }: { ball: Ball; size: number }) {
  const { color, ink, shape } = BALLS[colorOf(ball)]
  return (
    <motion.div
      layoutId={`ball-${ball}`}
      transition={{ type: 'spring', stiffness: 520, damping: 36 }}
      className="flex shrink-0 items-center justify-center rounded-full shadow-sm"
      style={{
        width: `${size}cqw`,
        height: `${size}cqw`,
        background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), transparent 45%), ${color}`,
      }}
    >
      <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill={ink} aria-hidden>
        {shape}
      </svg>
    </motion.div>
  )
}

function hintText(hint: Hint | null) {
  if (!hint) return null
  if (hint.kind === 'move') return 'הזיזו את הכדור המורם אל המבחנה המסומנת'
  if (hint.kind === 'undo') return hint.steps === 1 ? 'אין דרך מכאן - בטלו מהלך אחד ↩' : `אין דרך מכאן - בטלו ${hint.steps} מהלכים ↩`
  return 'אין דרך מכאן - התחילו את השלב מחדש 🔄'
}

interface SortBoardProps {
  difficulty: Difficulty
  onChangeDifficulty: () => void
}

export function SortBoard({ difficulty, onChangeDifficulty }: SortBoardProps) {
  const { cfg, run, moves, hint, shake, best, isNewRecord, tapTube, undo, restartStage, showHint, nextStage, restart } =
    useSortGame(difficulty)
  const { tubes, selected } = run
  const cap = cfg.capacity

  // All sizes are in cqw (percent of the board's width), so the board scales as one piece.
  const perRow = tubes.length <= 6 ? tubes.length : Math.ceil(tubes.length / 2)
  const rows = Math.ceil(tubes.length / perRow)
  const slot = Math.min(100 / perRow, 22)
  const tubeW = slot * 0.74
  const ball = tubeW * 0.84
  const gap = ball * 0.06
  const tubeH = cap * (ball + gap) + tubeW * 0.2
  const lift = ball * 1.15
  const rowH = lift + tubeH
  const rowGap = 4
  const boardH = rows * rowH + (rows - 1) * rowGap + 4
  const hintTarget = hint?.kind === 'move' ? hint.move.to : null
  const message = hintText(hint)

  const tubeRows = Array.from({ length: rows }, (_, r) => tubes.slice(r * perRow, (r + 1) * perRow).map((t, i) => ({ t, i: r * perRow + i })))

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between gap-2 text-lg font-bold text-slate-700">
        <span>
          שלב {run.stage + 1}/{cfg.colors.length}
        </span>
        <span>מהלכים: {moves}</span>
      </div>

      <div
        dir="ltr"
        className="relative w-full select-none rounded-3xl bg-gradient-to-b from-sky-100 to-indigo-100 shadow-lg"
        style={{ containerType: 'inline-size', aspectRatio: `100 / ${boardH}`, ...fitBoard('260px', 100 / boardH) }}
      >
        <div className="flex h-full w-full flex-col justify-center" style={{ gap: `${rowGap}cqw`, paddingBlock: '2cqw' }}>
          {tubeRows.map((row, r) => (
            <div key={r} className="flex justify-center">
              {row.map(({ t, i }) => {
                const lifted = selected === i ? t[t.length - 1] : undefined
                const stack = lifted === undefined ? t : t.slice(0, -1)
                const done = isTubeDone(t, cap)
                return (
                  <motion.button
                    key={i}
                    type="button"
                    aria-label={`מבחנה ${i + 1}${done ? ' - מוכנה' : ''}`}
                    aria-pressed={selected === i}
                    onPointerDown={(e) => {
                      e.preventDefault()
                      tapTube(i)
                    }}
                    animate={shake === i ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative flex touch-manipulation justify-center"
                    style={{ width: `${slot}cqw`, height: `${rowH}cqw` }}
                  >
                    {hintTarget === i && (
                      <motion.span
                        aria-hidden
                        className="absolute top-0 leading-none"
                        style={{ fontSize: `${ball * 0.7}cqw` }}
                        animate={{ y: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.7 }}
                      >
                        ⬇
                      </motion.span>
                    )}
                    {lifted !== undefined && (
                      <div className="absolute top-0 flex justify-center" style={{ paddingTop: `${ball * 0.08}cqw` }}>
                        <BallView ball={lifted} size={ball} />
                      </div>
                    )}
                    <div
                      className={`absolute bottom-0 flex flex-col-reverse items-center rounded-b-full border-[3px] border-t-0 transition-colors ${
                        done
                          ? 'border-emerald-400 bg-emerald-50/80'
                          : hintTarget === i
                            ? 'animate-pulse border-amber-400 bg-amber-50/80'
                            : selected === i
                              ? 'border-indigo-400 bg-white/80'
                              : 'border-slate-300 bg-white/60'
                      }`}
                      style={{ width: `${tubeW}cqw`, height: `${tubeH}cqw`, gap: `${gap}cqw`, paddingBottom: `${tubeW * 0.07}cqw` }}
                    >
                      {stack.map((b) => (
                        <BallView key={b} ball={b} size={ball} />
                      ))}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          ))}
        </div>

        {run.phase === 'levelDone' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/85 text-center"
            dir="rtl"
          >
            <span className="emoji text-6xl" aria-hidden>
              🎨
            </span>
            <p className="text-2xl font-extrabold text-slate-800">כל הכבוד! שלב {run.stage + 1} הושלם</p>
            <button
              type="button"
              onClick={nextStage}
              className="rounded-2xl bg-indigo-600 px-8 py-3 text-xl font-bold text-white shadow-md active:scale-95"
            >
              לשלב הבא ←
            </button>
          </motion.div>
        )}
      </div>

      <p className="min-h-6 text-center font-semibold text-amber-700" role="status">
        {message}
      </p>

      {run.phase === 'finished' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-xl"
        >
          <p className="text-2xl font-extrabold text-slate-800">סידרתם את כל הצבעים! 🎉</p>
          <p className="text-slate-600">מספר המהלכים</p>
          <p className="text-5xl font-extrabold text-indigo-600">{moves}</p>
          {run.hints > 0 && <p className="text-sm text-slate-500">השתמשתם ב-{run.hints} רמזים</p>}
          {isNewRecord ? (
            <p className="rounded-full bg-amber-100 px-4 py-1 font-semibold text-amber-700">🏅 שיא חדש ברמה {cfg.label}!</p>
          ) : (
            best !== null && <p className="text-sm text-slate-500">השיא שלכם ברמה {cfg.label}: {best} מהלכים</p>
          )}
          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={restart}
              className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-indigo-700 active:scale-95"
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
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={run.phase !== 'playing' || run.history.length === 0}
            className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-white font-semibold text-slate-700 shadow-sm active:scale-95 disabled:opacity-40"
          >
            <Undo2 className="h-5 w-5" aria-hidden />
            ביטול
          </button>
          <button
            type="button"
            onClick={showHint}
            disabled={run.phase !== 'playing'}
            className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-amber-100 font-semibold text-amber-800 shadow-sm active:scale-95 disabled:opacity-40"
          >
            <Lightbulb className="h-5 w-5" aria-hidden />
            רמז
          </button>
          <button
            type="button"
            onClick={restartStage}
            disabled={run.phase !== 'playing' || run.history.length === 0}
            className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-white font-semibold text-slate-700 shadow-sm active:scale-95 disabled:opacity-40"
          >
            <RotateCcw className="h-5 w-5" aria-hidden />
            מההתחלה
          </button>
        </div>
      )}
    </div>
  )
}
