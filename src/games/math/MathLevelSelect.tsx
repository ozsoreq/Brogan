import { LevelSelectPage } from '../../components/LevelSelectPage'
import { TOTAL_LEVELS } from './levels'
import { useMathProgress } from './useMathProgress'

export function MathLevelSelect() {
  const { unlockedLevel, resetProgress } = useMathProgress()

  return (
    <LevelSelectPage
      title="חשבון · בחירת שלב"
      intro="עברו שלב כדי לפתוח את השלב הבא. אפשר תמיד לחזור על שלבים שכבר עברתם."
      backgroundClass="bg-gradient-to-b from-sky-50 via-white to-white"
      nextTileClass="bg-violet-600 text-white shadow-md ring-2 ring-violet-300"
      routePrefix="/learning/math"
      totalLevels={TOTAL_LEVELS}
      unlockedLevel={unlockedLevel}
      resetProgress={resetProgress}
    />
  )
}
