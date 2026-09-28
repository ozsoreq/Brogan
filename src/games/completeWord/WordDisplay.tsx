import { motion } from 'framer-motion'
import type { Round, Feedback } from './types'
import { wordTiles } from './words'

interface WordDisplayProps {
  round: Round
  feedback: Feedback
}

const TILE_MAX_PX = 56

export function WordDisplay({ round, feedback }: WordDisplayProps) {
  const tiles = wordTiles(round.word)
  // Tiles shrink together so even a 9-letter word fits a 320px phone; the
  // letters scale with the row's width (cqw) rather than a fixed size.
  const fontSize = `min(2.25rem, ${Math.round(62 / tiles.length)}cqw)`

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <motion.div
        key={round.word}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-7xl sm:text-8xl"
      >
        {round.emoji}
      </motion.div>

      <div className="w-full" style={{ containerType: 'inline-size' }}>
        <div className="flex w-full justify-center gap-[min(0.5rem,1.5cqw)]" dir="rtl">
          {tiles.map(({ text, index }) => {
            const isBlank = index === round.blankIndex
            const tileStyle = { flex: `0 1 ${TILE_MAX_PX}px`, minWidth: 0, fontSize }

            if (!isBlank) {
              return (
                <div
                  key={index}
                  style={tileStyle}
                  className="flex h-16 items-center justify-center rounded-2xl bg-white font-bold text-slate-800 shadow-sm sm:h-20"
                >
                  {text}
                </div>
              )
            }

            const showAnswer = feedback !== null
            const answerColor =
              feedback === 'correct'
                ? 'bg-emerald-100 text-emerald-600 border-emerald-400'
                : 'bg-rose-100 text-rose-600 border-rose-400'

            return (
              <motion.div
                key={index}
                animate={feedback === 'wrong' ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                style={tileStyle}
                className={`flex h-16 items-center justify-center rounded-2xl border-2 border-dashed font-bold shadow-sm sm:h-20 ${
                  showAnswer ? answerColor : 'border-violet-300 bg-violet-50 text-violet-300'
                }`}
              >
                {showAnswer ? text : ''}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
