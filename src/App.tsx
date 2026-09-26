import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LearningPage } from './pages/LearningPage'
import { GamesPage } from './pages/GamesPage'
import { CompleteWordGame } from './games/completeWord/CompleteWordGame'
import { MathLevelSelect } from './games/math/MathLevelSelect'
import { MathGame } from './games/math/MathGame'
import { HebrewLevelSelect } from './games/hebrew/HebrewLevelSelect'
import { HebrewGame } from './games/hebrew/HebrewGame'
import { MemoryGame } from './games/memory/MemoryGame'
import { WhackGame } from './games/whack/WhackGame'
import { RunnerGame } from './games/runner/RunnerGame'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/learning" element={<LearningPage />} />
      <Route path="/learning/complete-word" element={<CompleteWordGame />} />
      <Route path="/learning/math" element={<MathLevelSelect />} />
      <Route path="/learning/math/:level" element={<MathGame />} />
      <Route path="/learning/hebrew" element={<HebrewLevelSelect />} />
      <Route path="/learning/hebrew/:level" element={<HebrewGame />} />
      <Route path="/games" element={<GamesPage />} />
      <Route path="/games/memory" element={<MemoryGame />} />
      <Route path="/games/whack" element={<WhackGame />} />
      <Route path="/games/runner" element={<RunnerGame />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
