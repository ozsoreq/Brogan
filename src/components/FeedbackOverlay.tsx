import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

export type Feedback = 'correct' | 'wrong' | null

interface FeedbackOverlayProps {
  feedback: Feedback
}

export function FeedbackOverlay({ feedback }: FeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={`flex h-32 w-32 items-center justify-center rounded-full shadow-2xl sm:h-40 sm:w-40 ${
              feedback === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          >
            {feedback === 'correct' ? (
              <Check className="h-16 w-16 text-white sm:h-20 sm:w-20" strokeWidth={3} />
            ) : (
              <X className="h-16 w-16 text-white sm:h-20 sm:w-20" strokeWidth={3} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
