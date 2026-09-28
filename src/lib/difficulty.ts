export const DIFFICULTY_KEYS = ['easy', 'medium', 'hard'] as const
export type DifficultyKey = (typeof DIFFICULTY_KEYS)[number]
