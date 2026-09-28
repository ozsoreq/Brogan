import { motion } from 'framer-motion'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { DirectionPad } from '../../components/DirectionPad'
import { useSwipe } from '../../lib/useSwipe'
import { BONUS_POINTS, type Difficulty } from './snakeLogic'
import { useSnakeGame } from './useSnakeGame'

interface SnakeBoardProps {
  difficulty: Difficulty
  onChangeDifficulty: () => void
}

export function SnakeBoard({ difficulty, onChangeDifficulty }: SnakeBoardProps) {
  const { cfg, state, phase, best, isNewRecord, steer, restart } = useSnakeGame(difficulty)
  const cell = 100 / state.size
  const pos = (p: { x: number; y: number }) => ({
    left: `${p.x * cell}%`,
    top: `${p.y * cell}%`,
    width: `${cell}%`,
    height: `${cell}%`,
  })

  const swipe = useSwipe(steer)

  const headDir = state.dir
  const eyeRotation = { right: 0, down: 90, left: 180, up: 270 }[headDir]

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between text-lg font-bold text-slate-700">
        <span>ניקוד: {state.score}</span>
        <span>🍎 {state.apples}</span>
        {best !== null && <span className="text-sm font-medium text-slate-500">שיא: {best}</span>}
      </div>

      <div
        role="application"
        aria-label="לוח המשחק - החליקו כדי לכוון את הנחש"
        {...swipe}
        dir="ltr"
        className="relative aspect-square w-full select-none overflow-hidden rounded-3xl border-4 border-emerald-700 shadow-lg"
        style={{
          touchAction: 'none',
          backgroundColor: '#a3e635',
          backgroundImage:
            'linear-gradient(45deg, #84cc16 25%, transparent 25%, transparent 75%, #84cc16 75%), linear-gradient(45deg, #84cc16 25%, transparent 25%, transparent 75%, #84cc16 75%)',
          backgroundSize: `${cell * 2}% ${cell * 2}%`,
          backgroundPosition: `0 0, ${cell}% ${cell}%`,
          containerType: 'inline-size',
        }}
      >
        <span
          aria-hidden
          className="absolute flex items-center justify-center leading-none"
          style={{ ...pos(state.food), fontSize: `${cell * 0.85}cqw` }}
        >
          🍎
        </span>
        {state.bonus && (
          <motion.span
            aria-hidden
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="absolute flex items-center justify-center leading-none"
            style={{ ...pos(state.bonus.at), fontSize: `${cell * 0.9}cqw`, opacity: state.bonus.ticksLeft < 8 ? 0.5 : 1 }}
          >
            ⭐
          </motion.span>
        )}

        {state.snake.map((p, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute p-[1px]"
            style={pos(p)}
          >
            <div
              className={`relative h-full w-full ${i === 0 ? 'rounded-xl bg-emerald-800' : 'rounded-lg bg-emerald-600'}`}
              style={i === 0 ? { rotate: `${eyeRotation}deg` } : { opacity: 1 - (i / state.snake.length) * 0.35 }}
            >
              {i === 0 && (
                <>
                  <span className="absolute right-[15%] top-[18%] h-[26%] w-[26%] rounded-full bg-white">
                    <span className="absolute right-0 top-[25%] h-1/2 w-1/2 rounded-full bg-black" />
                  </span>
                  <span className="absolute bottom-[18%] right-[15%] h-[26%] w-[26%] rounded-full bg-white">
                    <span className="absolute right-0 top-[25%] h-1/2 w-1/2 rounded-full bg-black" />
                  </span>
                </>
              )}
            </div>
          </div>
        ))}

        {phase === 'ready' && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/50 text-center">
            <span style={{ fontSize: '14cqw' }} aria-hidden>
              🐍
            </span>
            <p className="font-extrabold text-slate-800" style={{ fontSize: '6cqw' }} dir="rtl">
              החליקו או לחצו על חץ כדי להתחיל
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
          <p className="text-2xl font-extrabold text-slate-800">{state.won ? 'מילאת את כל הלוח! 🏆' : 'אופס! הנחש נתקע'}</p>
          <p className="text-5xl font-extrabold text-emerald-600">{state.score}</p>
          <p className="text-slate-600">
            אכלת {state.apples} תפוחים 🍎 · כוכב ⭐ שווה {BONUS_POINTS} נקודות
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
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-700 active:scale-95"
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
        <DirectionPad onPress={steer} color="bg-emerald-500 active:bg-emerald-600" />
      )}
    </div>
  )
}
