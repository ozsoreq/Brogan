import { motion } from 'framer-motion'

interface MemoryCardProps {
  emoji: string
  faceUp: boolean
  matched: boolean
  onClick: () => void
}

const faceStyle = { backfaceVisibility: 'hidden' as const, WebkitBackfaceVisibility: 'hidden' as const }

export function MemoryCard({ emoji, faceUp, matched, onClick }: MemoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={faceUp}
      aria-label={faceUp ? emoji : 'קלף הפוך'}
      className="aspect-square w-full disabled:cursor-default"
      style={{ perspective: 600 }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: faceUp ? 180 : 0, scale: matched ? 0.94 : 1 }}
        transition={{ duration: 0.35 }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-rose-500 text-3xl text-white/80 shadow-md"
          style={faceStyle}
        >
          ?
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-2xl text-4xl shadow-md sm:text-5xl ${
            matched ? 'bg-emerald-100 ring-2 ring-emerald-400' : 'bg-white'
          }`}
          style={{ ...faceStyle, transform: 'rotateY(180deg)' }}
        >
          {emoji}
        </div>
      </motion.div>
    </button>
  )
}
