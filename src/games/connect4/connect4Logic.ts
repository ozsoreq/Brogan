export const ROWS = 6
export const COLS = 7
export const PLAYER = 1
export const COMPUTER = 2

export type Cell = 0 | typeof PLAYER | typeof COMPUTER
export type Side = typeof PLAYER | typeof COMPUTER
// board[row][col], row 0 is the top row.
export type Board = Cell[][]
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  label: string
  grades: string
  detail: string
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { label: 'קל', grades: 'כיתות א׳-ב׳', detail: 'המחשב עוד לומד 🐣' },
  medium: { label: 'בינוני', grades: 'כיתות ב׳-ג׳', detail: 'המחשב חושב קצת 🤔' },
  hard: { label: 'קשה', grades: 'כיתות ג׳-ד׳', detail: 'המחשב חכם! 🧠' },
}

type Rng = () => number

export function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0))
}

export function other(side: Side): Side {
  return side === PLAYER ? COMPUTER : PLAYER
}

/** The row a disc dropped in `col` lands on, or -1 if the column is full. */
export function landingRow(board: Board, col: number) {
  for (let r = ROWS - 1; r >= 0; r--) if (board[r][col] === 0) return r
  return -1
}

export function validCols(board: Board) {
  return Array.from({ length: COLS }, (_, c) => c).filter((c) => board[0][c] === 0)
}

export function play(board: Board, col: number, side: Side): Board {
  const row = landingRow(board, col)
  if (row < 0) throw new Error(`column ${col} is full`)
  return board.map((line, r) => (r === row ? line.map((cell, c) => (c === col ? side : cell)) : line))
}

export function isFull(board: Board) {
  return board[0].every((cell) => cell !== 0)
}

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const

/** Every line of four cells on the board. */
const WINDOWS: [number, number][][] = []
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    for (const [dr, dc] of DIRECTIONS) {
      const cells: [number, number][] = [0, 1, 2, 3].map((i) => [r + dr * i, c + dc * i])
      if (cells.every(([rr, cc]) => rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS)) WINDOWS.push(cells)
    }
  }
}

export function findWin(board: Board): { side: Side; cells: [number, number][] } | null {
  for (const w of WINDOWS) {
    const first = board[w[0][0]][w[0][1]]
    if (first !== 0 && w.every(([r, c]) => board[r][c] === first)) return { side: first, cells: w }
  }
  return null
}

function winsWith(board: Board, col: number, side: Side) {
  return findWin(play(board, col, side))?.side === side
}

// Heuristic: open lines of two and three, plus a little love for the centre column.
function evaluate(board: Board, me: Side) {
  const them = other(me)
  let score = 0
  for (let r = 0; r < ROWS; r++) if (board[r][3] === me) score += 3
  for (const w of WINDOWS) {
    let mine = 0
    let theirs = 0
    for (const [r, c] of w) {
      if (board[r][c] === me) mine++
      else if (board[r][c] === them) theirs++
    }
    if (mine && theirs) continue
    if (mine === 3) score += 5
    else if (mine === 2) score += 2
    else if (theirs === 3) score -= 4
    else if (theirs === 2) score -= 1
  }
  return score
}

const WIN_SCORE = 1_000_000
const CENTRE_FIRST = [3, 2, 4, 1, 5, 0, 6]

function minimax(board: Board, depth: number, alpha: number, beta: number, toMove: Side, me: Side): number {
  const win = findWin(board)
  if (win) return win.side === me ? WIN_SCORE + depth : -WIN_SCORE - depth
  if (isFull(board)) return 0
  if (depth === 0) return evaluate(board, me)

  const cols = CENTRE_FIRST.filter((c) => board[0][c] === 0)
  if (toMove === me) {
    let best = -Infinity
    for (const c of cols) {
      best = Math.max(best, minimax(play(board, c, toMove), depth - 1, alpha, beta, other(toMove), me))
      alpha = Math.max(alpha, best)
      if (alpha >= beta) break
    }
    return best
  }
  let best = Infinity
  for (const c of cols) {
    best = Math.min(best, minimax(play(board, c, toMove), depth - 1, alpha, beta, other(toMove), me))
    beta = Math.min(beta, best)
    if (alpha >= beta) break
  }
  return best
}

// Random pick that prefers the middle columns.
function centreWeighted(cols: number[], rng: Rng) {
  const weights = cols.map((c) => 4 - Math.abs(3 - c))
  let x = rng() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < cols.length; i++) {
    x -= weights[i]
    if (x < 0) return cols[i]
  }
  return cols[cols.length - 1]
}

export const SEARCH_DEPTH = 5

export function chooseMove(board: Board, difficulty: Difficulty, rng: Rng = Math.random, me: Side = COMPUTER): number {
  const cols = validCols(board)
  if (cols.length === 0) throw new Error('board is full')
  const them = other(me)
  const winning = cols.find((c) => winsWith(board, c, me))
  const blocking = cols.find((c) => winsWith(board, c, them))

  if (difficulty === 'easy') {
    // Sometimes spots a win or a threat, often just plays somewhere nice.
    if (winning !== undefined && rng() < 0.7) return winning
    if (blocking !== undefined && rng() < 0.4) return blocking
    return centreWeighted(cols, rng)
  }

  if (difficulty === 'medium') {
    if (winning !== undefined) return winning
    if (blocking !== undefined) return blocking
    // Don't hand the player a win by playing underneath their winning spot.
    const safe = cols.filter((c) => {
      const next = play(board, c, me)
      return !validCols(next).some((cc) => winsWith(next, cc, them))
    })
    return centreWeighted(safe.length ? safe : cols, rng)
  }

  let bestScore = -Infinity
  let best: number[] = []
  for (const c of cols) {
    const score = minimax(play(board, c, me), SEARCH_DEPTH - 1, -Infinity, Infinity, them, me)
    if (score > bestScore) {
      bestScore = score
      best = [c]
    } else if (score === bestScore) {
      best.push(c)
    }
  }
  return best[Math.floor(rng() * best.length)]
}
