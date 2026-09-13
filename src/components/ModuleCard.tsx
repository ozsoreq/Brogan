import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Lock } from 'lucide-react'

interface ModuleCardProps {
  title: string
  description: string
  icon: LucideIcon
  color: string
  onClick?: () => void
  comingSoon?: boolean
}

export function ModuleCard({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  comingSoon,
}: ModuleCardProps) {
  return (
    <motion.button
      type="button"
      disabled={comingSoon}
      onClick={onClick}
      whileHover={comingSoon ? {} : { scale: 1.02, y: -2 }}
      whileTap={comingSoon ? {} : { scale: 0.98 }}
      className={`flex w-full items-center gap-4 rounded-2xl bg-white p-5 text-right shadow-sm transition-shadow ${
        comingSoon ? 'opacity-60' : 'hover:shadow-md'
      }`}
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="h-7 w-7 text-white" strokeWidth={1.75} />
      </div>
      <div className="flex-1">
        <p className="font-bold text-slate-800">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {comingSoon && <Lock className="h-5 w-5 shrink-0 text-slate-400" />}
    </motion.button>
  )
}
