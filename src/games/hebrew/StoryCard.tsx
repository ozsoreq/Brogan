import { BookOpen } from 'lucide-react'

interface StoryCardProps {
  title: string
  story: string
}

export function StoryCard({ title, story }: StoryCardProps) {
  return (
    <div className="w-full rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-amber-600">
        <BookOpen className="h-5 w-5" />
        <h2 className="font-bold">{title}</h2>
      </div>
      <p className="text-lg leading-relaxed text-slate-700">{story}</p>
    </div>
  )
}
