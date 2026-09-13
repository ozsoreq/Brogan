import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'

export function GamesPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-fuchsia-50 via-white to-white">
      <AppHeader title="משחקים" onBack={() => navigate('/')} />

      <main className="flex flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-fuchsia-100"
        >
          <Sparkles className="h-10 w-10 text-fuchsia-500" />
        </motion.div>
        <p className="text-lg font-bold text-slate-700">
          המשחקים הראשונים בדרך!
        </p>
        <p className="max-w-xs text-slate-500">
          אנחנו עובדים על משחקים חדשים ומגניבים. חזרו לבקר בקרוב 🎮
        </p>
      </main>
    </div>
  )
}
