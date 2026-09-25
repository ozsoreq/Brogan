import { LevelSelectPage } from '../../components/LevelSelectPage'
import { TOTAL_LEVELS } from './levels'
import { useHebrewProgress } from './useHebrewProgress'

export function HebrewLevelSelect() {
  const { unlockedLevel, resetProgress } = useHebrewProgress()

  return (
    <LevelSelectPage
      title="עברית · בחירת שלב"
      intro="קראו את הסיפור וענו על השאלות. עברו שלב כדי לפתוח את השלב הבא."
      backgroundClass="bg-gradient-to-b from-amber-50 via-white to-white"
      nextTileClass="bg-amber-500 text-white shadow-md ring-2 ring-amber-300"
      routePrefix="/learning/hebrew"
      totalLevels={TOTAL_LEVELS}
      unlockedLevel={unlockedLevel}
      resetProgress={resetProgress}
    />
  )
}
