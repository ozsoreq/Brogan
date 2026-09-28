import { lazy, Suspense, useEffect, type ComponentType } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { RotateHint } from './components/RotateHint'
import { HomePage } from './pages/HomePage'
import { stopSpeaking } from './lib/sound'

// Every screen except home loads on demand, so the first screen appears fast
// on slow phones and networks.
function page<M>(load: () => Promise<M>, name: keyof M) {
  return lazy(async () => ({ default: (await load())[name] as ComponentType }))
}

const LearningPage = page(() => import('./pages/LearningPage'), 'LearningPage')
const GamesPage = page(() => import('./pages/GamesPage'), 'GamesPage')
const CompleteWordGame = page(() => import('./games/completeWord/CompleteWordGame'), 'CompleteWordGame')
const MathLevelSelect = page(() => import('./games/math/MathLevelSelect'), 'MathLevelSelect')
const MathGame = page(() => import('./games/math/MathGame'), 'MathGame')
const HebrewLevelSelect = page(() => import('./games/hebrew/HebrewLevelSelect'), 'HebrewLevelSelect')
const HebrewGame = page(() => import('./games/hebrew/HebrewGame'), 'HebrewGame')
const MemoryGame = page(() => import('./games/memory/MemoryGame'), 'MemoryGame')
const WhackGame = page(() => import('./games/whack/WhackGame'), 'WhackGame')
const RunnerGame = page(() => import('./games/runner/RunnerGame'), 'RunnerGame')
const FruitGame = page(() => import('./games/fruit/FruitGame'), 'FruitGame')
const SnakeGame = page(() => import('./games/snake/SnakeGame'), 'SnakeGame')
const BricksGame = page(() => import('./games/bricks/BricksGame'), 'BricksGame')
const StackGame = page(() => import('./games/stack/StackGame'), 'StackGame')
const Connect4Game = page(() => import('./games/connect4/Connect4Game'), 'Connect4Game')
const MazeGame = page(() => import('./games/maze/MazeGame'), 'MazeGame')

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-label="טוען">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
    </div>
  )
}

function App() {
  const { pathname } = useLocation()

  useEffect(() => stopSpeaking(), [pathname])

  return (
    <ErrorBoundary resetKey={pathname}>
      {pathname.startsWith('/games/') && <RotateHint />}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/learning/complete-word" element={<CompleteWordGame />} />
          <Route path="/learning/math" element={<MathLevelSelect />} />
          <Route path="/learning/math/:level" element={<MathGame />} />
          <Route path="/learning/hebrew" element={<HebrewLevelSelect />} />
          <Route path="/learning/hebrew/:level" element={<HebrewGame />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/memory/:choice?" element={<MemoryGame />} />
          <Route path="/games/whack/:choice?" element={<WhackGame />} />
          <Route path="/games/runner/:choice?" element={<RunnerGame />} />
          <Route path="/games/fruit/:choice?" element={<FruitGame />} />
          <Route path="/games/snake/:choice?" element={<SnakeGame />} />
          <Route path="/games/bricks/:choice?" element={<BricksGame />} />
          <Route path="/games/stack/:choice?" element={<StackGame />} />
          <Route path="/games/connect4/:choice?" element={<Connect4Game />} />
          <Route path="/games/maze/:choice?" element={<MazeGame />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
