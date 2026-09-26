import { motion } from 'framer-motion'

export type DifficultyKey = 'easy' | 'medium' | 'hard'

const LEVEL_COLORS: Record<DifficultyKey, string> = {
  easy: 'from-emerald-400 to-teal-500',
  medium: 'from-sky-400 to-indigo-500',
  hard: 'from-fuchsia-500 to-rose-500',
}

interface DifficultyPickerProps {
  intro: string
  levels: Record<DifficultyKey, { label: string; grades: string; detail: string }>
  onPick: (key: DifficultyKey) => void
}

export function DifficultyPicker({ intro, levels, onPick }: DifficultyPickerProps) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <p className="text-center text-slate-600">{intro}</p>
      {(Object.keys(levels) as DifficultyKey[]).map((key) => {
        const { label, grades, detail } = levels[key]
        return (
          <motion.button
            key={key}
            type="button"
            onClick={() => onPick(key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center justify-between rounded-2xl bg-gradient-to-br ${LEVEL_COLORS[key]} px-6 py-5 text-white shadow-md`}
          >
            <span className="text-right">
              <span className="block text-2xl font-extrabold">{label}</span>
              <span className="text-sm text-white/85">{grades}</span>
            </span>
            <span className="text-lg font-semibold">{detail}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
