import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TOTAL_LEVELS } from './levels'
import { useHebrewProgress } from './useHebrewProgress'
import { HebrewLevelPlay } from './HebrewLevelPlay'

export function HebrewGame() {
  const navigate = useNavigate()
  const { level: levelParam } = useParams()
  const level = Number(levelParam)
  const isValidLevel = Number.isInteger(level) && level >= 1 && level <= TOTAL_LEVELS

  const { unlockedLevel, unlockUpTo } = useHebrewProgress()
  const isUnlocked = isValidLevel && level <= unlockedLevel

  useEffect(() => {
    if (!isUnlocked) navigate('/learning/hebrew', { replace: true })
  }, [isUnlocked, navigate])

  if (!isUnlocked) return null

  // key={level} forces a fresh instance (and fresh game state) whenever the
  // player moves to a different level, instead of reusing the previous
  // level's finished/score state.
  return <HebrewLevelPlay key={level} level={level} unlockUpTo={unlockUpTo} />
}
