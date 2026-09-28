import { motion } from 'framer-motion'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useRef, type PointerEvent } from 'react'
import {
  BALL_RADIUS,
  brickRect,
  PADDLE_HEIGHT,
  PADDLE_Y,
  STAR_POINTS,
  STAR_RADIUS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  type Brick,
  type Difficulty,
} from './bricksLogic'
import { useBricksGame } from './useBricksGame'
import { fitBoard } from '../../lib/fitBoard'
import { PauseButton, PauseOverlay } from '../../components/Pause'
import { useSoundOnIncrease, useSoundWhen } from '../../lib/sound'

const ROW_COLORS = ['#f43f5e', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899']

const xPct = (x: number) => `${(x / WORLD_WIDTH) * 100}%`
const yPct = (y: number) => `${(y / WORLD_HEIGHT) * 100}%`

function brickStyle(b: Brick) {
  if (!b.strong) return { backgroundColor: ROW_COLORS[b.row % ROW_COLORS.length] }
  // Iron bricks look metallic, and cracked once they have taken a hit.
  return b.hits > 1
    ? { background: 'linear-gradient(135deg, #cbd5e1, #64748b)', border: '2px solid #e2e8f0' }
    : { background: 'linear-gradient(135deg, #94a3b8, #475569)', border: '2px dashed #e2e8f0' }
}

interface BricksBoardProps {
  difficulty: Difficulty
  onChangeDifficulty: () => void
}

export function BricksBoard({ difficulty, onChangeDifficulty }: BricksBoardProps) {
  const { cfg, state, phase, best, isNewRecord, pointerDown, pointerMove, restart, paused, pause, resume } = useBricksGame(difficulty)
  useSoundOnIncrease(state.broken, 'hit')
  useSoundOnIncrease(-state.lives, 'wrong')
  useSoundOnIncrease(state.stage, 'win')
  useSoundWhen(phase === 'over', 'lose')
  const boxRef = useRef<HTMLDivElement>(null)

  const toWorldX = (e: PointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect()
    return ((e.clientX - r.left) / r.width) * WORLD_WIDTH
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between gap-2 text-lg font-bold text-slate-700">
        <span>ניקוד: {state.score}</span>
        <span>שלב {state.stage}</span>
        <span aria-label={`${state.lives} לבבות`}>
          {'❤️'.repeat(state.lives)}
          <span className="opacity-25">{'❤️'.repeat(cfg.lives - state.lives)}</span>
        </span>
        <PauseButton onPause={pause} disabled={phase !== 'playing'} />
      </div>

      <div
        ref={boxRef}
        role="application"
        aria-label="לוח המשחק - גררו את המחבט וגעו כדי לשגר את הכדור"
        onPointerDown={(e) => {
          e.preventDefault()
          e.currentTarget.setPointerCapture(e.pointerId)
          pointerDown(toWorldX(e))
        }}
        onPointerMove={(e) => {
          if (e.pointerType === 'mouse' || e.buttons > 0) pointerMove(toWorldX(e))
        }}
        dir="ltr"
        className="relative w-full select-none overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950 via-indigo-900 to-violet-900 shadow-lg"
        style={{
          aspectRatio: `${WORLD_WIDTH} / ${WORLD_HEIGHT}`,
          containerType: 'inline-size',
          touchAction: 'none',
          ...fitBoard('144px', WORLD_WIDTH / WORLD_HEIGHT),
        }}
      >
        {state.bricks.map((b) => {
          const r = brickRect(b)
          return (
            <div
              key={b.id}
              aria-hidden
              className="absolute flex items-center justify-center rounded-md shadow-[inset_0_-3px_0_rgba(0,0,0,0.25)]"
              style={{ left: xPct(r.x), top: yPct(r.y), width: xPct(r.w), height: yPct(r.h), ...brickStyle(b) }}
            >
              {b.star && (
                <span className="leading-none" style={{ fontSize: '3.8cqw', filter: 'drop-shadow(0 0 1.5px rgba(0,0,0,0.9))' }}>
                  ⭐
                </span>
              )}
            </div>
          )
        })}

        {state.stars.map((s) => (
          <span
            key={s.id}
            aria-hidden
            className="absolute -translate-x-1/2 -translate-y-1/2 leading-none drop-shadow"
            style={{ left: xPct(s.x), top: yPct(s.y), fontSize: `${STAR_RADIUS * 2.2}cqw` }}
          >
            ⭐
          </span>
        ))}

        {state.popups.map((p) => (
          <motion.span
            key={p.id}
            aria-hidden
            initial={{ opacity: 1, y: 0, scale: 0.7 }}
            animate={{ opacity: 0, y: -30, scale: 1.3 }}
            transition={{ duration: 0.7 }}
            className="absolute -translate-x-1/2 font-extrabold text-yellow-300 drop-shadow"
            style={{ left: xPct(p.x), top: yPct(p.y), fontSize: '7cqw' }}
          >
            {p.text}
          </motion.span>
        ))}

        <div
          aria-hidden
          className="absolute rounded-full bg-gradient-to-b from-cyan-200 to-cyan-500 shadow-[0_0_12px_rgba(103,232,249,0.8)]"
          style={{
            left: xPct(state.paddleX - cfg.paddleWidth / 2),
            top: yPct(PADDLE_Y),
            width: xPct(cfg.paddleWidth),
            height: yPct(PADDLE_HEIGHT),
          }}
        />

        <div
          aria-hidden
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]"
          style={{
            left: xPct(state.ball.x),
            top: yPct(state.ball.y),
            width: xPct(BALL_RADIUS * 2),
            aspectRatio: '1',
          }}
        />

        {state.stuck && phase === 'playing' && (
          <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center gap-1 text-center text-white" style={{ top: '52%' }}>
            <p className="font-extrabold drop-shadow" style={{ fontSize: '8cqw' }} dir="rtl">
              שלב {state.stage}
            </p>
            <p className="drop-shadow" style={{ fontSize: '4.8cqw' }} dir="rtl">
              געו כדי לשגר את הכדור ⬆️ · גררו את המחבט
            </p>
          </div>
        )}
        {paused && <PauseOverlay onResume={resume} />}
      </div>

      {phase === 'over' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-xl"
        >
          <p className="text-2xl font-extrabold text-slate-800">נגמרו הלבבות!</p>
          <p className="text-5xl font-extrabold text-indigo-600">{state.score}</p>
          <p className="text-slate-600">
            שברתם {state.broken} לבנים 🧱 והגעתם לשלב {state.stage} · כוכב ⭐ שווה {STAR_POINTS} נקודות
          </p>
          {isNewRecord ? (
            <p className="rounded-full bg-amber-100 px-4 py-1 font-semibold text-amber-700">🏅 שיא חדש ברמה {cfg.label}!</p>
          ) : (
            best !== null && <p className="text-sm text-slate-500">השיא שלכם ברמה {cfg.label}: {best}</p>
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
      )}
    </div>
  )
}
