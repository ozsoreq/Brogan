import { motion } from 'framer-motion'
import { RotateCcw, Users } from 'lucide-react'
import { PLAYER_SIZE, PLAYER_X, STAR_BONUS, WORLD_HEIGHT, type ObstacleKind } from './runnerLogic'
import { useRunnerGame } from './useRunnerGame'

// The ground takes the bottom GROUND_PCT of the box; the world sits above it.
// The box's aspect ratio keeps one world unit the same size on both axes.
const GROUND_PCT = 18
const BOX_HEIGHT_UNITS = WORLD_HEIGHT / (1 - GROUND_PCT / 100)
const OBSTACLE_EMOJI: Record<ObstacleKind, string> = { cactus: '🌵', rock: '🪨' }
const CLOUDS = [
  { x: 10, y: 80, size: 11 },
  { x: 55, y: 88, size: 8 },
  { x: 95, y: 76, size: 10 },
]

const bottomPct = (y: number) => GROUND_PCT + (y / BOX_HEIGHT_UNITS) * 100

interface RunnerBoardProps {
  character: string
  onChangeCharacter: () => void
}

export function RunnerBoard({ character, onChangeCharacter }: RunnerBoardProps) {
  const { state, phase, score, best, isNewRecord, press, restart } = useRunnerGame()
  const grounded = state.playerY <= 0

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center justify-between text-lg font-bold text-slate-700">
        <span>ניקוד: {score}</span>
        <span>⭐ {state.starsCollected}</span>
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-label={phase === 'ready' ? 'התחלת משחק' : 'קפיצה'}
        onPointerDown={(e) => {
          e.preventDefault()
          press()
        }}
        className="relative w-full touch-manipulation select-none overflow-hidden rounded-3xl bg-gradient-to-b from-sky-300 via-sky-200 to-amber-50 shadow-lg"
        style={{ aspectRatio: `100 / ${BOX_HEIGHT_UNITS}`, containerType: 'inline-size' }}
      >
        <span className="absolute right-[6%] top-[6%]" style={{ fontSize: '10cqw' }} aria-hidden>
          ☀️
        </span>
        {CLOUDS.map((c, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute opacity-90"
            style={{
              left: `${((((c.x - state.distance * 0.15) % 130) + 130) % 130) - 15}%`,
              bottom: `${c.y}%`,
              fontSize: `${c.size}cqw`,
            }}
          >
            ☁️
          </span>
        ))}

        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 border-t-4 border-lime-600 bg-lime-500"
          style={{
            height: `${GROUND_PCT}%`,
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 4cqw, transparent 4cqw 10cqw)',
            backgroundPositionX: `${-state.distance}cqw`,
          }}
        />

        {state.stars.map((s) => (
          <span
            key={s.id}
            aria-hidden
            className="absolute leading-none"
            style={{ left: `${s.x}%`, bottom: `${bottomPct(s.y)}%`, fontSize: '6.5cqw' }}
          >
            ⭐
          </span>
        ))}
        {state.obstacles.map((o) => (
          <span
            key={o.id}
            aria-hidden
            className="absolute leading-none"
            style={{ left: `${o.x}%`, bottom: `${GROUND_PCT - 1}%`, fontSize: o.kind === 'rock' ? '7cqw' : '8.5cqw' }}
          >
            {OBSTACLE_EMOJI[o.kind]}
          </span>
        ))}

        <span
          aria-hidden
          className="absolute leading-none"
          style={{ left: `${PLAYER_X}%`, bottom: `${bottomPct(state.playerY) - 1}%`, fontSize: `${PLAYER_SIZE * 0.95}cqw` }}
        >
          <span
            className={`inline-block transition-transform ${grounded && phase === 'playing' ? 'runner-bob' : ''}`}
            style={{ transform: `scaleX(-1) rotate(${phase === 'over' ? 90 : grounded ? 0 : -12}deg)` }}
          >
            {character}
          </span>
        </span>

        {phase === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/40 text-center">
            <motion.span
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
              style={{ fontSize: '12cqw' }}
              aria-hidden
            >
              👆
            </motion.span>
            <p className="font-extrabold text-slate-800" style={{ fontSize: '5.5cqw' }}>
              גע כדי להתחיל
            </p>
          </div>
        )}
      </div>

      {phase === 'over' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-xl"
        >
          <p className="text-2xl font-extrabold text-slate-800">אופס! נתקעת 😅</p>
          <p className="text-5xl font-extrabold text-sky-600">{score}</p>
          <p className="text-slate-600">אספת {state.starsCollected} כוכבים ⭐ (כל כוכב שווה {STAR_BONUS} נקודות)</p>
          {isNewRecord ? (
            <p className="rounded-full bg-amber-100 px-4 py-1 font-semibold text-amber-700">🏅 שיא חדש!</p>
          ) : (
            best !== null && <p className="text-sm text-slate-500">השיא שלך: {best}</p>
          )}
          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={restart}
              className="flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-sky-600 active:scale-95"
            >
              <RotateCcw className="h-5 w-5" aria-hidden />
              שחק שוב
            </button>
            <button
              type="button"
              onClick={onChangeCharacter}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
            >
              <Users className="h-5 w-5" aria-hidden />
              החלפת דמות
            </button>
          </div>
        </motion.div>
      ) : (
        <p className="text-center text-slate-600">
          גע במשחק כדי לקפוץ מעל 🌵 ו-🪨 · קפוץ לתפוס ⭐ לבונוס
        </p>
      )}
    </div>
  )
}
