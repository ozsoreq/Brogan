import { useLevelProgress } from '../../lib/useLevelProgress'
import { TOTAL_LEVELS } from './levels'

const STORAGE_KEY = 'brogan-hebrew-unlocked-level'

export function useHebrewProgress() {
  return useLevelProgress(STORAGE_KEY, TOTAL_LEVELS)
}
