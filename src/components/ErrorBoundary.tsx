import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  /** When this changes (e.g. the route), a caught error is cleared. */
  resetKey: string
  children: ReactNode
}

interface ErrorBoundaryState {
  failedKey: string | null
}

/** Shows a friendly screen instead of a blank page if something throws. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failedKey: null }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { failedKey: '__pending__' }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
    this.setState({ failedKey: this.props.resetKey })
  }

  render() {
    const { failedKey } = this.state
    if (failedKey === null || (failedKey !== '__pending__' && failedKey !== this.props.resetKey)) {
      return this.props.children
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-violet-50 to-white p-6 text-center">
        <span className="text-6xl" aria-hidden>
          🙈
        </span>
        <p className="text-2xl font-extrabold text-slate-800">אופס! משהו השתבש</p>
        <p className="text-slate-600">אפשר לחזור לתפריט ולנסות שוב.</p>
        <a
          href="/"
          className="rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-violet-700 active:scale-95"
        >
          חזרה לתפריט
        </a>
      </div>
    )
  }
}
