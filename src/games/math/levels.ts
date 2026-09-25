export const TOTAL_LEVELS = 50
export const EXERCISES_PER_LEVEL = 10
export const PASS_RATIO = 1

export type Operator = '+' | '−' | '×' | '÷'

const MULTIPLICATION_STARTS_AT_LEVEL = 10
const DIVISION_STARTS_AT_LEVEL = 15

export interface MathExercise {
  a: number
  b: number
  operator: Operator
  answer: number
  options: number[]
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Difficulty grows smoothly from level 1 (easiest) to TOTAL_LEVELS (hardest).
function difficultyProgress(level: number): number {
  return (level - 1) / (TOTAL_LEVELS - 1)
}

function makeOptions(answer: number): number[] {
  const options = new Set<number>([answer])
  let spread = Math.max(3, Math.round(Math.abs(answer) * 0.25))
  let guard = 0
  while (options.size < 4 && guard < 200) {
    guard++
    if (guard % 20 === 0) spread += 2 // widen if we keep colliding (small answers)
    const delta = randInt(-spread, spread)
    const candidate = answer + (delta === 0 ? 1 : delta)
    if (candidate >= 0 && candidate !== answer) options.add(candidate)
  }
  return shuffle([...options])
}

function buildExercise(a: number, b: number, operator: Operator, answer: number): MathExercise {
  return { a, b, operator, answer, options: makeOptions(answer) }
}

function generateExercise(level: number, operator: Operator): MathExercise {
  const t = difficultyProgress(level)

  switch (operator) {
    case '+': {
      const maxNum = Math.round(10 + t * 190)
      const a = randInt(0, maxNum)
      const b = randInt(0, maxNum)
      return buildExercise(a, b, '+', a + b)
    }
    case '−': {
      const maxNum = Math.round(10 + t * 190)
      const a = randInt(1, maxNum)
      const b = randInt(0, a)
      return buildExercise(a, b, '−', a - b)
    }
    case '×': {
      const maxFactor = Math.round(3 + t * 17)
      const a = randInt(1, maxFactor)
      const b = randInt(1, maxFactor)
      return buildExercise(a, b, '×', a * b)
    }
    case '÷': {
      const maxFactor = Math.round(3 + t * 17)
      const divisor = randInt(1, maxFactor)
      const quotient = randInt(1, maxFactor)
      return buildExercise(divisor * quotient, divisor, '÷', quotient)
    }
  }
}

function availableOperators(level: number): Operator[] {
  const ops: Operator[] = ['+', '−']
  if (level >= MULTIPLICATION_STARTS_AT_LEVEL) ops.push('×')
  if (level >= DIVISION_STARTS_AT_LEVEL) ops.push('÷')
  return ops
}

function operatorsForLevel(level: number): Operator[] {
  const base = availableOperators(level)
  const ops: Operator[] = []
  while (ops.length < EXERCISES_PER_LEVEL) ops.push(...shuffle(base))
  return shuffle(ops.slice(0, EXERCISES_PER_LEVEL))
}

export function buildLevelExercises(level: number): MathExercise[] {
  const seen = new Set<string>()
  return operatorsForLevel(level).map((operator) => {
    let exercise = generateExercise(level, operator)
    // Low levels have a tiny number space, so cap retries rather than loop forever.
    for (let attempt = 0; attempt < 30 && seen.has(exerciseKey(exercise)); attempt++) {
      exercise = generateExercise(level, operator)
    }
    seen.add(exerciseKey(exercise))
    return exercise
  })
}

function exerciseKey(e: MathExercise): string {
  return `${e.a}${e.operator}${e.b}`
}
