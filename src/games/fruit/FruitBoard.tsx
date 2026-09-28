import { motion } from 'framer-motion'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useRef, type PointerEvent } from 'react'
import { START_LIVES, timeLeft, WORLD_HEIGHT, WORLD_WIDTH, type Difficulty } from './fruitLogic'
import { useFruitGame } from './useFruitGame'
import { fitBoard } from '../../lib/fitBoard'
import { PauseButton, PauseOverlay } from '../../components/Pause'
import { useSoundOnIncrease, useSoundWhen } from '../../lib/sound'

const leftPct = (x: number) => (x / WORLD_WIDTH) * 100
const bottomPct = (y: number) => (y / WORLD_HEIGHT) * 100

interface FruitBoardProps {
  difficulty: Difficulty
  onChangeDifficulty: () => void
}

export function FruitBoard({ difficulty, onChangeDifficulty }: FruitBoardProps) {
  const { cfg, state, phase, trail, best, isNewRecord, pointerDown, pointerMove, pointerUp, restart, paused, pause, resume } =
    useFruitGame(difficulty)
  useSoundOnIncrease(state.sliced, 'pop')
  useSoundOnIncrease(-state.lives, 'bomb')
  useSoundWhen(phase === 'over', 'lose')
  const boxRef = useRef<HTMLDivElement>(null)

  const toWorld = (e: PointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect()
    return {
      x: ((e.clientX - r.left) / r.width) * WORLD_WIDTH,
      y: (1 - (e.clientY - r.top) / r.height) * WORLD_HEIGHT,
    }
  }

  const trailPoints = trail.map((p) => `${p.x},${WORLD_HEIGHT - p.y}`).join(' ')

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between gap-2 text-lg font-bold text-slate-700">
        <span>ניקוד: {state.score}</span>
        <span aria-label={`${state.lives} לבבות`}>
          {'❤️'.repeat(state.lives)}
          <span className="opacity-25">{'❤️'.repeat(START_LIVES - state.lives)}</span>
        </span>
        <span dir="ltr" className={timeLeft(state) <= 10 && phase === 'playing' ? 'text-rose-500' : ''}>
          ⏱ {timeLeft(state)}
        </span>
        <PauseButton onPause={pause} disabled={phase !== 'playing'} />
      </div>

      <div
        ref={boxRef}
        role="button"
        tabIndex={0}
        aria-label={phase === 'ready' ? 'התחלת משחק' : 'לוח חיתוך'}
        onPointerDown={(e) => {
          e.preventDefault()
          e.currentTarget.setPointerCapture(e.pointerId)
          const p = toWorld(e)
          pointerDown(p.x, p.y)
        }}
        onPointerMove={(e) => {
          const p = toWorld(e)
          pointerMove(p.x, p.y)
        }}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        className="relative w-full select-none overflow-hidden rounded-3xl bg-gradient-to-b from-amber-800 via-amber-900 to-stone-900 shadow-lg"
        style={{
          aspectRatio: `${WORLD_WIDTH} / ${WORLD_HEIGHT}`,
          containerType: 'inline-size',
          touchAction: 'none',
          ...fitBoard('144px', WORLD_WIDTH / WORLD_HEIGHT),
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.5) 0 2px, transparent 2px 18%)' }}
        />

        {state.pieces.map((p) => (
          <span
            key={p.id}
            aria-hidden
            className="absolute -translate-x-1/2 translate-y-1/2 leading-none"
            style={{
              left: `${leftPct(p.x)}%`,
              bottom: `${bottomPct(p.y)}%`,
              fontSize: '14cqw',
              clipPath: p.side === 'left' ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)',
              rotate: `${p.spin}deg`,
            }}
          >
            {p.emoji}
          </span>
        ))}

        {state.objects.map((o) => (
          <span
            key={o.id}
            aria-hidden
            className="absolute -translate-x-1/2 translate-y-1/2 leading-none"
            style={{ left: `${leftPct(o.x)}%`, bottom: `${bottomPct(o.y)}%`, fontSize: '14cqw' }}
          >
            {o.emoji}
          </span>
        ))}

        {state.popups.map((p) => (
          <motion.span
            key={p.id}
            aria-hidden
            dir="ltr"
            initial={{ opacity: 1, y: 0, scale: 0.7 }}
            animate={{ opacity: 0, y: -30, scale: 1.2 }}
            transition={{ duration: 0.7 }}
            className="absolute -translate-x-1/2 font-extrabold text-yellow-300 drop-shadow"
            style={{ left: `${leftPct(p.x)}%`, bottom: `${bottomPct(p.y)}%`, fontSize: '6cqw' }}
          >
            {p.text}
          </motion.span>
        ))}

        {trail.length > 1 && (
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
            preserveAspectRatio="none"
          >
            <polyline
              points={trailPoints}
              fill="none"
              stroke="white"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.9))' }}
            />
          </svg>
        )}

        {phase === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 text-center text-white">
            <span style={{ fontSize: '16cqw' }} aria-hidden>
              🍉🔪
            </span>
            <p className="font-extrabold" style={{ fontSize: '7cqw' }}>
              געו כדי להתחיל
            </p>
            <p style={{ fontSize: '4.5cqw' }}>החליקו את האצבע על הפירות, והיזהרו מהפצצות 💣</p>
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
          <p className="text-2xl font-extrabold text-slate-800">
            {state.lives === 0 ? 'אוי! נגמרו הלבבות' : 'נגמר הזמן!'}
          </p>
          <p className="text-5xl font-extrabold text-rose-500">{state.score}</p>
          <p className="text-slate-600">חתכתם {state.sliced} פירות 🍉</p>
          {isNewRecord ? (
            <p className="rounded-full bg-amber-100 px-4 py-1 font-semibold text-amber-700">🏅 שיא חדש ברמה {cfg.label}!</p>
          ) : (
            best !== null && <p className="text-sm text-slate-500">השיא שלכם ברמה {cfg.label}: {best}</p>
          )}
          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={restart}
              className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-rose-600 active:scale-95"
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
