import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'

interface LevelGridProps {
  totalLevels: number
  unlockedLevel: number
  nextTileClass: string
  onSelect: (level: number) => void
}

export function LevelGrid({ totalLevels, unlockedLevel, nextTileClass, onSelect }: LevelGridProps) {
  const levels = Array.from({ length: totalLevels }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-5 gap-3">
      {levels.map((level) => {
        const isUnlocked = level <= unlockedLevel
        const isCompleted = level < unlockedLevel
        const isNext = level === unlockedLevel

        let tileStyle = 'bg-slate-100 text-slate-300'
        if (isCompleted) tileStyle = 'bg-emerald-500 text-white shadow-sm'
        else if (isNext) tileStyle = nextTileClass

        const label = isCompleted
          ? `שלב ${level}, הושלם`
          : isNext
            ? `שלב ${level}, השלב הבא`
            : `שלב ${level}, נעול`

        return (
          <motion.button
            key={level}
            type="button"
            aria-label={label}
            disabled={!isUnlocked}
            onClick={() => onSelect(level)}
            whileTap={isUnlocked ? { scale: 0.92 } : {}}
            whileHover={isUnlocked ? { scale: 1.05 } : {}}
            className={`flex aspect-square items-center justify-center rounded-xl text-lg font-bold transition-colors duration-200 ${tileStyle} disabled:cursor-default`}
          >
            {isUnlocked ? level : <Lock className="h-4 w-4" aria-hidden />}
          </motion.button>
        )
      })}
    </div>
  )
}
