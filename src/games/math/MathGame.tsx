import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TOTAL_LEVELS } from './levels'
import { useMathProgress } from './useMathProgress'
import { MathLevelPlay } from './MathLevelPlay'

export function MathGame() {
  const navigate = useNavigate()
  const { level: levelParam } = useParams()
  const level = Number(levelParam)
  const isValidLevel = Number.isInteger(level) && level >= 1 && level <= TOTAL_LEVELS

  const { unlockedLevel, unlockUpTo } = useMathProgress()
  const isUnlocked = isValidLevel && level <= unlockedLevel

  useEffect(() => {
    if (!isUnlocked) navigate('/learning/math', { replace: true })
  }, [isUnlocked, navigate])

  if (!isUnlocked) return null

  // Keying on level forces a fresh MathLevelPlay instance - and fresh game
  // state - every time the player moves to a different level, instead of
  // reusing the previous level's finished/score state.
  return <MathLevelPlay key={level} level={level} unlockUpTo={unlockUpTo} />
}
