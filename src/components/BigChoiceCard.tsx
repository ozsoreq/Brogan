import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface BigChoiceCardProps {
  title: string
  subtitle: string
  icon: LucideIcon
  gradient: string
  onClick: () => void
}

export function BigChoiceCard({
  title,
  subtitle,
  icon: Icon,
  gradient,
  onClick,
}: BigChoiceCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`flex w-full flex-col items-center gap-4 rounded-3xl p-8 text-white shadow-lg sm:p-10 ${gradient}`}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
        <Icon className="h-10 w-10" strokeWidth={1.75} />
      </div>
      <div className="text-center">
        <p className="text-2xl font-extrabold sm:text-3xl">{title}</p>
        <p className="mt-1 text-sm font-medium text-white/80 sm:text-base">
          {subtitle}
        </p>
      </div>
    </motion.button>
  )
}
