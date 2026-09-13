import { Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LearningPage } from './pages/LearningPage'
import { GamesPage } from './pages/GamesPage'
import { CompleteWordGame } from './games/completeWord/CompleteWordGame'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/learning" element={<LearningPage />} />
      <Route path="/learning/complete-word" element={<CompleteWordGame />} />
      <Route path="/games" element={<GamesPage />} />
    </Routes>
  )
}

export default App
