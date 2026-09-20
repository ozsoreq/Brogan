import { Puzzle, Hash, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { ModuleCard } from '../components/ModuleCard'

export function LearningPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white">
      <AppHeader title="למידה" onBack={() => navigate('/')} />

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
        <ModuleCard
          title="השלם את המילה"
          description="גלו את האות החסרה במילה"
          icon={Puzzle}
          color="bg-violet-500"
          onClick={() => navigate('/learning/complete-word')}
        />
        <ModuleCard
          title="חשבון"
          description="50 שלבים של חיבור, חיסור, כפל וחילוק"
          icon={Hash}
          color="bg-sky-500"
          onClick={() => navigate('/learning/math')}
        />
        <ModuleCard
          title="עברית"
          description="50 שלבים של סיפורים ושאלות הבנת הנקרא"
          icon={BookOpen}
          color="bg-amber-500"
          onClick={() => navigate('/learning/hebrew')}
        />
      </main>
    </div>
  )
}
