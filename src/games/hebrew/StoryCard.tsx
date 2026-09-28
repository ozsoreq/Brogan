import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'

interface StoryCardProps {
  title: string
  story: string
}

/**
 * The story stays on screen while answering, but capped in height so the
 * question and answers below it always fit on the phone. A long story
 * scrolls inside the card, or can be opened in full.
 */
export function StoryCard({ title, story }: StoryCardProps) {
  const textRef = useRef<HTMLDivElement>(null)
  const [overflowing, setOverflowing] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useLayoutEffect(() => {
    const el = textRef.current
    if (!el) return
    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 2)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [story])

  return (
    <div className="w-full rounded-3xl bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-2 text-amber-700">
        <BookOpen className="h-5 w-5 shrink-0" aria-hidden />
        <h2 className="flex-1 font-bold">{title}</h2>
        {(overflowing || expanded) && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="flex min-h-11 shrink-0 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-amber-800 hover:bg-amber-50"
          >
            {expanded ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
            {expanded ? 'להקטין' : 'כל הסיפור'}
          </button>
        )}
      </div>
      <div className="relative">
        <div
          ref={textRef}
          tabIndex={overflowing ? 0 : undefined}
          className={`overflow-y-auto text-lg leading-relaxed text-slate-700 ${
            expanded ? '' : 'max-h-[max(4.5rem,calc(100dvh-34rem))]'
          }`}
        >
          <p>{story}</p>
        </div>
        {overflowing && !expanded && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white" />
        )}
      </div>
    </div>
  )
}
