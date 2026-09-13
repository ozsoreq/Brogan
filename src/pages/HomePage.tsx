import { motion } from 'framer-motion'
import { BookOpen, Gamepad2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BigChoiceCard } from '../components/BigChoiceCard'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-violet-100 via-white to-sky-100 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl">
          🎓 אקדמיית הלמידה
        </h1>
        <p className="mt-2 text-slate-500">מה בא לך לעשות היום?</p>
      </motion.div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
        <BigChoiceCard
          title="למידה"
          subtitle="תרגלו מילים, מספרים ועוד"
          icon={BookOpen}
          gradient="bg-gradient-to-br from-violet-500 to-indigo-500"
          onClick={() => navigate('/learning')}
        />
        <BigChoiceCard
          title="משחקים"
          subtitle="כיף ואתגרים בדרך"
          icon={Gamepad2}
          gradient="bg-gradient-to-br from-fuchsia-500 to-rose-500"
          onClick={() => navigate('/games')}
        />
      </div>
    </div>
  )
}
