import { useCallback, useEffect, useState } from 'react'
import {
  chooseMove,
  COMPUTER,
  emptyBoard,
  findWin,
  isFull,
  landingRow,
  play,
  PLAYER,
  type Board,
  type Difficulty,
  type Side,
} from './connect4Logic'

const COMPUTER_DELAY_MS = 700

export interface Tally {
  wins: number
  losses: number
  draws: number
}

export interface Result {
  winner: Side | null
  cells: [number, number][]
}

interface Game {
  board: Board
  turn: Side
  result: Result | null
  lastMove: [number, number] | null
  gameNo: number
}

function tallyKey(difficulty: Difficulty) {
  return `brogan-connect4-score-${difficulty}`
}

function loadTally(difficulty: Difficulty): Tally {
  try {
    const t = JSON.parse(localStorage.getItem(tallyKey(difficulty)) ?? '')
    if ([t.wins, t.losses, t.draws].every(Number.isFinite)) return t
  } catch {
    // no saved score yet
  }
  return { wins: 0, losses: 0, draws: 0 }
}

// The player starts the first game, then the starting side alternates.
function newGame(gameNo: number): Game {
  return { board: emptyBoard(), turn: gameNo % 2 === 0 ? PLAYER : COMPUTER, result: null, lastMove: null, gameNo }
}

export function useConnect4(difficulty: Difficulty) {
  const [game, setGame] = useState(() => newGame(0))
  const [tally, setTally] = useState(() => loadTally(difficulty))

  const apply = useCallback(
    (col: number, side: Side) => {
      const row = landingRow(game.board, col)
      if (row < 0 || game.result || game.turn !== side) return
      const board = play(game.board, col, side)
      const win = findWin(board)
      const result: Result | null = win ? { winner: win.side, cells: win.cells } : isFull(board) ? { winner: null, cells: [] } : null
      setGame({ ...game, board, turn: side === PLAYER ? COMPUTER : PLAYER, result, lastMove: [row, col] })
      if (!result) return
      const next = {
        wins: tally.wins + (result.winner === PLAYER ? 1 : 0),
        losses: tally.losses + (result.winner === COMPUTER ? 1 : 0),
        draws: tally.draws + (result.winner === null ? 1 : 0),
      }
      setTally(next)
      try {
        localStorage.setItem(tallyKey(difficulty), JSON.stringify(next))
      } catch {
        // storage unavailable - the score just isn't kept
      }
    },
    [game, tally, difficulty],
  )

  useEffect(() => {
    if (game.turn !== COMPUTER || game.result) return
    const timer = setTimeout(() => apply(chooseMove(game.board, difficulty), COMPUTER), COMPUTER_DELAY_MS)
    return () => clearTimeout(timer)
  }, [game, difficulty, apply])

  const playerMove = useCallback((col: number) => apply(col, PLAYER), [apply])
  const again = useCallback(() => setGame((g) => newGame(g.gameNo + 1)), [])

  return { ...game, tally, playerMove, again }
}
