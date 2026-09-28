import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message?: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * The app's own yes/no dialog. Unlike window.confirm it is in Hebrew, matches the
 * app's look, and works inside in-app browsers that block native dialogs.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'ביטול',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6"
          onClick={onCancel}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-6 text-center shadow-2xl"
          >
            <p id="confirm-title" className="text-xl font-extrabold text-slate-800">
              {title}
            </p>
            {message && <p className="text-slate-600">{message}</p>}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-2xl bg-rose-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-rose-700 active:scale-95"
              >
                {confirmLabel}
              </button>
              <button
                ref={cancelRef}
                type="button"
                onClick={onCancel}
                className="rounded-2xl bg-slate-100 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
