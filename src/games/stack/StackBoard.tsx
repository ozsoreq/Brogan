import { motion } from 'framer-motion'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { BLOCK_HEIGHT, PERFECT_POINTS, WORLD_WIDTH, type Block, type Difficulty } from './stackLogic'
import { useStackGame } from './useStackGame'
import { fitBoard } from '../../lib/fitBoard'

const VIEW_HEIGHT = 140
const GROUND = 10
// The block being placed sits about halfway up the view once the tower is tall.
const FOCUS_Y = 62

const xPct = (x: number) => `${(x / WORLD_WIDTH) * 100}%`
const yPct = (y: number) => `${(y / VIEW_HEIGHT) * 100}%`
const levelBottom = (level: number) => yPct(GROUND + level * BLOCK_HEIGHT)

// The sky changes as the tower climbs: day, sunset, dusk, then night in space.
const SKY_TIERS = [
  { from: 0, color: '#7dd3fc' },
  { from: 18, color: '#fdba74' },
  { from: 32, color: '#a78bfa' },
  { from: 45, color: '#1e1b4b' },
]

function skyColor(level: number) {
  return [...SKY_TIERS].reverse().find((t) => level >= t.from)!.color
}

// Scenery in world units, spaced out up the sky and picked by height.
const DECORATIONS = Array.from({ length: 120 }, (_, i) => {
  const y = 50 + i * 42
  const level = y / BLOCK_HEIGHT
  const day = ['☁️', '☁️', '🐦', '☁️']
  const high = ['✈️', '☁️', '🎈', '🦅']
  const night = ['✨', '⭐', '🛰️', '✨', '🪐', '⭐', '☄️']
  const set = level < 18 ? day : level < 45 ? high : night
  const emoji = level >= 48 && level < 53 ? '🌙' : set[i % set.length]
  return { y, x: 8 + ((i * 37) % 78), emoji }
})

function BlockView({ block, bottom, tag }: { block: Block; bottom: string; tag?: 'top' | 'moving' }) {
  return (
    <div
      aria-hidden
      data-block={tag}
      className="absolute overflow-hidden rounded-[3px] shadow-[inset_0_-4px_0_rgba(0,0,0,0.2),inset_0_2px_0_rgba(255,255,255,0.35)]"
      style={{
        left: xPct(block.left),
        width: xPct(block.width),
        bottom,
        height: yPct(BLOCK_HEIGHT),
        backgroundColor: `hsl(${block.hue} 75% 58%)`,
      }}
    >
      <div
        className="absolute inset-x-[4%] top-[30%] h-[36%]"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0 7px, transparent 7px 16px)' }}
      />
    </div>
  )
}

interface StackBoardProps {
  difficulty: Difficulty
  onChangeDifficulty: () => void
}

export function StackBoard({ difficulty, onChangeDifficulty }: StackBoardProps) {
  const { cfg, state, phase, best, isNewRecord, tap, restart } = useStackGame(difficulty)
  const floors = state.placed.length - 1
  const movingLevel = state.placed.length
  const cameraY = Math.max(0, GROUND + movingLevel * BLOCK_HEIGHT - FOCUS_Y)
  const inView = (y: number) => y >= cameraY - 30 && y <= cameraY + VIEW_HEIGHT + 10

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between text-lg font-bold text-slate-700">
        <span>ניקוד: {state.score}</span>
        <span>🏢 {floors}</span>
        {best !== null && <span className="text-sm font-medium text-slate-500">שיא: {best}</span>}
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={phase === 'ready' ? 'התחלת משחק' : 'הפלת הבלוק'}
        onPointerDown={(e) => {
          e.preventDefault()
          tap()
        }}
        dir="ltr"
        className="relative w-full select-none overflow-hidden rounded-3xl shadow-lg"
        style={{
          aspectRatio: `${WORLD_WIDTH} / ${VIEW_HEIGHT}`,
          ...fitBoard('144px', WORLD_WIDTH / VIEW_HEIGHT),
          containerType: 'inline-size',
          touchAction: 'manipulation',
          backgroundColor: skyColor(floors),
          transition: 'background-color 1.5s',
        }}
      >
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />

        <div
          className="absolute inset-0"
          style={{ transform: `translateY(${(cameraY / VIEW_HEIGHT) * 100}%)`, transition: 'transform 0.35s ease-out' }}
        >
          {DECORATIONS.filter((d) => inView(d.y)).map((d) => (
            <span
              key={d.y}
              aria-hidden
              className="absolute -translate-x-1/2 leading-none opacity-90"
              style={{ left: xPct(d.x), bottom: yPct(d.y), fontSize: '9cqw' }}
            >
              {d.emoji}
            </span>
          ))}

          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-lime-500 to-green-700"
            style={{ height: yPct(GROUND) }}
          />

          {state.placed.map((b, level) =>
            inView(GROUND + level * BLOCK_HEIGHT) ? <BlockView key={level} block={b} bottom={levelBottom(level)} tag={level === floors ? 'top' : undefined} /> : null,
          )}

          {phase !== 'over' && <BlockView block={state.moving} bottom={levelBottom(movingLevel)} tag="moving" />}

          {state.chunks.map((c) => (
            <motion.div
              key={c.id}
              aria-hidden
              initial={{ y: 0, rotate: 0, opacity: 1 }}
              animate={{ y: '70cqw', rotate: c.side === 'left' ? -35 : 35, opacity: 0 }}
              transition={{ duration: 1, ease: 'easeIn' }}
              className="absolute rounded-[3px]"
              style={{
                left: xPct(c.left),
                width: xPct(c.width),
                bottom: levelBottom(c.level),
                height: yPct(BLOCK_HEIGHT),
                backgroundColor: `hsl(${c.hue} 75% 58%)`,
              }}
            />
          ))}

          {state.popups.map((p) => (
            <motion.span
              key={p.id}
              aria-hidden
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: '-12cqw', scale: 1.2 }}
              transition={{ duration: 1 }}
              className="absolute -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-3 font-extrabold text-amber-600 shadow-md"
              style={{ left: xPct(Math.min(80, Math.max(20, p.x))), bottom: levelBottom(p.level + 1.2), fontSize: '6cqw' }}
              dir="rtl"
            >
              {p.text} ✨
            </motion.span>
          ))}
        </div>

        {phase === 'ready' && (
          <div className="pointer-events-none absolute inset-x-0 top-[12%] flex flex-col items-center gap-2 px-4 text-center">
            <span style={{ fontSize: '14cqw' }} aria-hidden>
              🏗️
            </span>
            <p className="font-extrabold text-slate-800" style={{ fontSize: '7cqw' }} dir="rtl">
              געו כדי להתחיל
            </p>
            <p className="text-slate-700" style={{ fontSize: '4.8cqw' }} dir="rtl">
              בכל נגיעה הבלוק נופל - כוונו אותו בדיוק על המגדל!
            </p>
          </div>
        )}
      </div>

      {phase === 'over' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-xl"
        >
          <p className="text-2xl font-extrabold text-slate-800">אופס! הבלוק נפל</p>
          <p className="text-5xl font-extrabold text-sky-600">{state.score}</p>
          <p className="text-slate-600">
            בנית מגדל של {floors} קומות 🏢 · {state.perfects} הנחות מושלמות ✨ (כל אחת שווה {PERFECT_POINTS})
          </p>
          {isNewRecord ? (
            <p className="rounded-full bg-amber-100 px-4 py-1 font-semibold text-amber-700">🏅 שיא חדש ברמה {cfg.label}!</p>
          ) : (
            best !== null && <p className="text-sm text-slate-500">השיא שלך ברמה {cfg.label}: {best}</p>
          )}
          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={restart}
              className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-sky-700 active:scale-95"
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
      )}
    </div>
  )
}
