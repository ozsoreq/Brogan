import { motion } from 'framer-motion'
import { Lightbulb, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { DirectionPad } from '../../components/DirectionPad'
import { useSwipe } from '../../lib/useSwipe'
import { goalOf, HINT_PENALTY_SECONDS, isOpen, type Difficulty, type Maze, type Point } from './mazeLogic'
import { formatTime, useMazeGame } from './useMazeGame'
import { fitBoard } from '../../lib/fitBoard'

const WALL = 0.14

function Walls({ maze }: { maze: Maze }) {
  const lines: [number, number, number, number][] = []
  for (let y = 0; y < maze.h; y++) {
    for (let x = 0; x < maze.w; x++) {
      const p = { x, y }
      if (!isOpen(maze, p, 'up')) lines.push([x, y, x + 1, y])
      if (!isOpen(maze, p, 'left')) lines.push([x, y, x, y + 1])
      if (y === maze.h - 1) lines.push([x, y + 1, x + 1, y + 1])
      if (x === maze.w - 1) lines.push([x + 1, y, x + 1, y + 1])
    }
  }
  return (
    <g stroke="#6d28d9" strokeWidth={WALL} strokeLinecap="round">
      {lines.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </g>
  )
}

interface MazeBoardProps {
  difficulty: Difficulty
  onChangeDifficulty: () => void
}

export function MazeBoard({ difficulty, onChangeDifficulty }: MazeBoardProps) {
  const { cfg, run, hintCells, seconds, totalStars, best, isNewRecord, move, hint, nextLevel, restart } =
    useMazeGame(difficulty)
  const swipe = useSwipe(move)
  const { maze } = run.level
  const goal = goalOf(maze)
  const cell = 100 / maze.w
  const pos = (p: Point) => ({ left: `${p.x * cell}%`, top: `${p.y * cell}%`, width: `${cell}%`, height: `${cell}%` })
  const emojiSize = `${cell * 0.72}cqw`

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between gap-2 text-base font-bold text-slate-700 sm:text-lg">
        <span className="whitespace-nowrap">
          שלב {run.levelIndex + 1}/{cfg.sizes.length}
        </span>
        <span dir="ltr" className="whitespace-nowrap">⏱ {formatTime(seconds)}</span>
        <span className="whitespace-nowrap">⭐ {run.starsCollected}</span>
        {run.phase !== 'finished' && (
          <button
            type="button"
            onClick={hint}
            disabled={run.phase !== 'playing'}
            aria-label={`רמז - מראה את הדרך, ומוסיף ${HINT_PENALTY_SECONDS} שניות`}
            className="flex min-h-11 items-center gap-1 whitespace-nowrap rounded-full bg-amber-100 px-2.5 text-sm font-semibold sm:text-base text-amber-800 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Lightbulb className="h-5 w-5" aria-hidden />
            רמז
            <span className="text-xs font-normal" dir="ltr">
              ⏱+{HINT_PENALTY_SECONDS}
            </span>
          </button>
        )}
      </div>

      <div
        role="application"
        aria-label="המבוך - החליקו או לחצו על החצים כדי להזיז את העכבר"
        {...swipe}
        dir="ltr"
        className="relative aspect-square w-full select-none overflow-hidden rounded-3xl border-4 border-violet-300 bg-amber-50 shadow-lg"
        style={{ touchAction: 'none', containerType: 'inline-size', ...fitBoard('calc(176px + var(--pad-h))') }}
      >
        <svg
          aria-hidden
          className="absolute inset-[3%] h-[94%] w-[94%] overflow-visible"
          viewBox={`0 0 ${maze.w} ${maze.h}`}
        >
          {[...run.visited].map((k) => {
            const [x, y] = k.split(',').map(Number)
            return <circle key={k} cx={x + 0.5} cy={y + 0.5} r={0.11} fill="#fcd34d" />
          })}
          {hintCells.map((p, i) => (
            <circle key={`h${p.x},${p.y}`} cx={p.x + 0.5} cy={p.y + 0.5} r={0.24} fill="#38bdf8" className="animate-pulse" opacity={1 - i * 0.1} />
          ))}
          <Walls maze={maze} />
        </svg>

        <div aria-hidden className="absolute inset-[3%]">
          <span className="absolute flex items-center justify-center leading-none" style={{ ...pos(goal), fontSize: emojiSize }}>
            🧀
          </span>
          {run.starsLeft.map((s) => (
            <span
              key={`${s.x},${s.y}`}
              className="absolute flex items-center justify-center leading-none"
              style={{ ...pos(s), fontSize: `${cell * 0.6}cqw` }}
            >
              ⭐
            </span>
          ))}
          <span
            data-mouse
            className="absolute flex items-center justify-center leading-none"
            style={{ ...pos(run.pos), fontSize: emojiSize, transition: 'left 55ms linear, top 55ms linear' }}
          >
            🐭
          </span>
        </div>

        {run.phase === 'levelDone' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 text-center"
            dir="rtl"
          >
            <span style={{ fontSize: '16cqw' }} aria-hidden>
              🐭🧀
            </span>
            <p className="font-extrabold text-slate-800" style={{ fontSize: '7cqw' }}>
              יאמי! שלב {run.levelIndex + 1} הושלם
            </p>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={nextLevel}
              className="rounded-2xl bg-violet-600 px-8 py-3 text-xl font-bold text-white shadow-md active:scale-95"
            >
              לשלב הבא ←
            </button>
          </motion.div>
        )}
      </div>

      {run.phase === 'finished' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-xl"
        >
          <p className="text-2xl font-extrabold text-slate-800">יצאת מכל המבוכים! 🎉</p>
          <p className="text-5xl font-extrabold text-violet-600" dir="ltr">
            {formatTime(seconds)}
          </p>
          <p className="text-slate-600">
            אספת {run.starsCollected} מתוך {totalStars} כוכבים ⭐
            {run.hints > 0 && ` · השתמשת ב-${run.hints} רמזים`}
          </p>
          {isNewRecord ? (
            <p className="rounded-full bg-amber-100 px-4 py-1 font-semibold text-amber-700">🏅 זמן שיא ברמה {cfg.label}!</p>
          ) : (
            best !== null && (
              <p className="text-sm text-slate-500">
                השיא שלך ברמה {cfg.label}: <span dir="ltr">{formatTime(best)}</span>
              </p>
            )
          )}
          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={restart}
              className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-violet-700 active:scale-95"
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
      ) : (
        <DirectionPad onPress={move} color="bg-violet-500 active:bg-violet-600" />
      )}
    </div>
  )
}
