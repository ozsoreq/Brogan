/** Covers a game on a phone held sideways; every board is laid out for portrait. */
export function RotateHint() {
  return (
    <div
      role="alert"
      className="fixed inset-0 z-50 hidden flex-col items-center justify-center gap-3 bg-violet-600 p-6 text-center text-white phone-landscape:flex"
    >
      <span className="text-6xl" aria-hidden>
        📱🔄
      </span>
      <p className="text-2xl font-extrabold">סובבו את הטלפון</p>
      <p className="text-white/85">המשחק עובד הכי טוב כשהטלפון עומד</p>
    </div>
  )
}
