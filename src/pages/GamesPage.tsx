import { Brain, BrickWall, Footprints, Hammer, Slice, Worm } from 'lucide-react'
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
          title="שוברים לבנים!"
          description="חדש! מקפיצים כדור ושוברים קיר של לבנים · 3 רמות קושי"
          icon={BrickWall}
          color="bg-indigo-500"
          onClick={() => navigate('/games/bricks')}
        />
        <ModuleCard
          title="הנחש הרעב"
          description="מכוונים את הנחש לאכול תפוחים · 3 רמות קושי"
          icon={Worm}
          color="bg-emerald-600"
          onClick={() => navigate('/games/snake')}
        />
        <ModuleCard
          title="חותכים פירות!"
          description="מחליקים את האצבע וחותכים פירות · 3 רמות קושי"
          icon={Slice}
          color="bg-rose-500"
          onClick={() => navigate('/games/fruit')}
        />
        <ModuleCard
          title="רוץ, דינו, רוץ!"
          description="נוגעים כדי לקפוץ מעל מכשולים ואוספים כוכבים"
          icon={Footprints}
          color="bg-sky-500"
          onClick={() => navigate('/games/runner')}
        />
        <ModuleCard
          title="משחק הזיכרון"
          description="מצאו את כל הזוגות · 3 רמות קושי"
          icon={Brain}
          color="bg-fuchsia-500"
          onClick={() => navigate('/games/memory')}
        />
        <ModuleCard
          title="תפסו את האוגר!"
          description="משחק תגובה מהירה · 3 רמות קושי"
          icon={Hammer}
          color="bg-orange-500"
          onClick={() => navigate('/games/whack')}
        />
      </main>
    </div>
  )
}
