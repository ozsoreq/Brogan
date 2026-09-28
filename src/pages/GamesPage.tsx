import { Brain, BrickWall, Building2, Footprints, Grid3x3, Hammer, Route, Slice, Worm } from 'lucide-react'
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
          title="העכבר במבוך"
          description="חדש! עזרו לעכבר למצוא את הגבינה ב-5 מבוכים · 3 רמות קושי"
          icon={Route}
          color="bg-violet-600"
          onClick={() => navigate('/games/maze')}
        />
        <ModuleCard
          title="ארבע בשורה"
          description="משחק חשיבה מול המחשב - סדרו ארבע דיסקיות ברצף · 3 רמות קושי"
          icon={Grid3x3}
          color="bg-blue-600"
          onClick={() => navigate('/games/connect4')}
        />
        <ModuleCard
          title="בונים מגדל!"
          description="מפילים בלוקים בדיוק ובונים מגדל עד השמיים · 3 רמות קושי"
          icon={Building2}
          color="bg-sky-600"
          onClick={() => navigate('/games/stack')}
        />
        <ModuleCard
          title="שוברים לבנים!"
          description="מקפיצים כדור ושוברים קיר של לבנים · 3 רמות קושי"
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
