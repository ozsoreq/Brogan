import { Brain, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { ModuleCard } from '../components/ModuleCard'

export function GamesPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-fuchsia-50 via-white to-white">
      <AppHeader title="משחקים" onBack={() => navigate('/')} />

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
        <ModuleCard
          title="משחק הזיכרון"
          description="מצאו את כל הזוגות · 3 רמות קושי"
          icon={Brain}
          color="bg-fuchsia-500"
          onClick={() => navigate('/games/memory')}
        />
        <ModuleCard title="משחק נוסף" description="בקרוב..." icon={Sparkles} color="bg-sky-500" comingSoon />
      </main>
    </div>
  )
}
