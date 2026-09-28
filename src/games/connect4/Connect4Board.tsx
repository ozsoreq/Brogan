import { motion } from 'framer-motion'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { COLS, COMPUTER, DIFFICULTIES, landingRow, PLAYER, ROWS, type Difficulty } from './connect4Logic'
import { useConnect4 } from './useConnect4'
import { fitBoard } from '../../lib/fitBoard'
import { useSoundOnIncrease, useSoundWhen } from '../../lib/sound'

const DISC_COLOR = {
  [PLAYER]: 'bg-rose-500 shadow-[inset_0_-4px_0_rgba(0,0,0,0.25),inset_0_3px_0_rgba(255,255,255,0.35)]',
  [COMPUTER]: 'bg-amber-400 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2),inset_0_3px_0_rgba(255,255,255,0.45)]',
}

const cellStyle = (r: number, c: number) => ({
  left: `${(c / COLS) * 100}%`,
  top: `${(r / ROWS) * 100}%`,
  width: `${100 / COLS}%`,
  height: `${100 / ROWS}%`,
})

interface Connect4BoardProps {
  difficulty: Difficulty
  onChangeDifficulty: () => void
}

export function Connect4Board({ difficulty, onChangeDifficulty }: Connect4BoardProps) {
  const { board, turn, result, lastMove, gameNo, tally, playerMove, again } = useConnect4(difficulty)
  useSoundOnIncrease(board.flat().filter((c) => c !== 0).length, 'hit')
  useSoundWhen(result?.winner === PLAYER, 'win')
  useSoundWhen(result?.winner === COMPUTER, 'lose')
  const cfg = DIFFICULTIES[difficulty]
  const myTurn = turn === PLAYER && !result
  const isWinCell = (r: number, c: number) => result?.cells.some(([rr, cc]) => rr === r && cc === c) ?? false

  const status = result
    ? result.winner === PLAYER
      ? 'ניצחתם! 🎉'
      : result.winner === COMPUTER
        ? 'המחשב ניצח 🤖'
        : 'תיקו! 🤝'
    : myTurn
      ? 'התור שלכם 🔴'
      : 'המחשב חושב... 🟡'

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
        <span>🏆 אתם: {tally.wins}</span>
        <span>🤝 תיקו: {tally.draws}</span>
        <span>🤖 המחשב: {tally.losses}</span>
      </div>

      <p
        aria-live="polite"
        className={`text-center text-2xl font-extrabold ${myTurn ? 'text-rose-600' : result ? 'text-slate-800' : 'text-amber-600'}`}
      >
        {status}
      </p>

      <div dir="ltr" className="flex w-full flex-col gap-1" style={fitBoard('280px', COLS / ROWS)}>
        <div className="grid grid-cols-7 px-2" aria-hidden>
          {Array.from({ length: COLS }, (_, c) => (
            <span
              key={c}
              className={`text-center text-xl transition-opacity ${myTurn && landingRow(board, c) >= 0 ? 'text-rose-500 opacity-100' : 'opacity-0'}`}
            >
              ▼
            </span>
          ))}
        </div>

        <div className="rounded-3xl bg-blue-600 p-2 shadow-lg">
          <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: `${COLS} / ${ROWS}` }}>
            {board.map((line, r) =>
              line.map((_, c) => (
                <div key={`h${r}-${c}`} aria-hidden className="absolute" style={cellStyle(r, c)}>
                  <div className="absolute inset-[8%] rounded-full bg-blue-950/50 shadow-[inset_0_3px_4px_rgba(0,0,0,0.4)]" />
                </div>
              )),
            )}

            {board.map((line, r) =>
              line.map((cell, c) =>
                cell === 0 ? null : (
                  <div key={`d${gameNo}-${r}-${c}`} aria-hidden className="absolute" style={cellStyle(r, c)}>
                    <motion.div
                      initial={{ y: `${-(r + 1) * 115}%` }}
                      animate={isWinCell(r, c) ? { y: 0, scale: [1, 1.15, 1] } : { y: 0 }}
                      transition={
                        isWinCell(r, c)
                          ? { y: { type: 'spring', stiffness: 300, damping: 18 }, scale: { repeat: Infinity, duration: 0.8 } }
                          : { type: 'spring', stiffness: 300, damping: 18 }
                      }
                      className={`absolute inset-[8%] rounded-full ${DISC_COLOR[cell]} ${isWinCell(r, c) ? 'ring-4 ring-white' : ''}`}
                    >
                      {lastMove?.[0] === r && lastMove?.[1] === c && !result && (
                        <span className="flex h-full w-full items-center justify-center">
                          <span className="h-[22%] w-[22%] rounded-full bg-white/70" />
                        </span>
                      )}
                    </motion.div>
                  </div>
                ),
              ),
            )}

            <div className="absolute inset-0 grid grid-cols-7">
              {Array.from({ length: COLS }, (_, c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`עמודה ${c + 1}`}
                  disabled={!myTurn || landingRow(board, c) < 0}
                  onClick={() => playerMove(c)}
                  className="h-full touch-manipulation rounded-xl transition-colors enabled:active:bg-white/15 disabled:cursor-default"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {result ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-3xl bg-white p-5 text-center shadow-xl"
        >
          <p className="text-slate-600">
            {result.winner === PLAYER
              ? `כל הכבוד! ניצחתם את המחשב ברמה ${cfg.label} 🏆`
              : result.winner === COMPUTER
                ? 'לא נורא! נסו לחסום את המחשב כשיש לו שלוש בשורה.'
                : 'הלוח התמלא ואף אחד לא סידר ארבע.'}
          </p>
          <p className="text-sm text-slate-500">{gameNo % 2 === 0 ? 'במשחק הבא המחשב מתחיל 🟡' : 'במשחק הבא אתם מתחילים 🔴'}</p>
          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={again}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
            >
              <RotateCcw className="h-5 w-5" aria-hidden />
              משחק נוסף
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
        <p className="text-center text-sm text-slate-500">לחצו על עמודה כדי להפיל לתוכה דיסקית</p>
      )}
    </div>
  )
}
