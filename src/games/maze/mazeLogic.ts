export type Dir = 'up' | 'down' | 'left' | 'right'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Point {
  x: number
  y: number
}

// cells[y][x] is a bitmask of the open sides of that cell.
export interface Maze {
  w: number
  h: number
  cells: number[][]
}

export interface DifficultyConfig {
  label: string
  grades: string
  detail: string
  sizes: number[]
  stars: number
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { label: 'קל', grades: 'כיתות א׳-ב׳', detail: 'מבוכים קטנים 🐣', sizes: [5, 6, 6, 7, 8], stars: 2 },
  medium: { label: 'בינוני', grades: 'כיתות ב׳-ג׳', detail: 'מבוכים בינוניים', sizes: [7, 8, 9, 10, 11], stars: 3 },
  hard: { label: 'קשה', grades: 'כיתות ג׳-ד׳', detail: 'מבוכים ענקיים 🧭', sizes: [9, 10, 12, 13, 14], stars: 3 },
}

export const HINT_PENALTY_SECONDS = 5
export const HINT_LENGTH = 6

const BIT: Record<Dir, number> = { up: 1, right: 2, down: 4, left: 8 }
const STEP: Record<Dir, Point> = { up: { x: 0, y: -1 }, right: { x: 1, y: 0 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 } }
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }
export const DIRS: Dir[] = ['up', 'right', 'down', 'left']

type Rng = () => number

export const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y

export function goalOf(maze: Maze): Point {
  return { x: maze.w - 1, y: maze.h - 1 }
}

// Depth-first "recursive backtracker": every cell is reachable by exactly one path.
export function generateMaze(w: number, h: number, rng: Rng = Math.random): Maze {
  const cells = Array.from({ length: h }, () => Array<number>(w).fill(0))
  const visited = Array.from({ length: h }, () => Array<boolean>(w).fill(false))
  const stack: Point[] = [{ x: 0, y: 0 }]
  visited[0][0] = true
  while (stack.length) {
    const cur = stack[stack.length - 1]
    const options = DIRS.filter((d) => {
      const nx = cur.x + STEP[d].x
      const ny = cur.y + STEP[d].y
      return nx >= 0 && ny >= 0 && nx < w && ny < h && !visited[ny][nx]
    })
    if (options.length === 0) {
      stack.pop()
      continue
    }
    const d = options[Math.floor(rng() * options.length)]
    const next = { x: cur.x + STEP[d].x, y: cur.y + STEP[d].y }
    cells[cur.y][cur.x] |= BIT[d]
    cells[next.y][next.x] |= BIT[OPPOSITE[d]]
    visited[next.y][next.x] = true
    stack.push(next)
  }
  return { w, h, cells }
}

export function isOpen(maze: Maze, p: Point, d: Dir) {
  return (maze.cells[p.y][p.x] & BIT[d]) !== 0
}

export function openDirs(maze: Maze, p: Point) {
  return DIRS.filter((d) => isOpen(maze, p, d))
}

export function stepFrom(p: Point, d: Dir): Point {
  return { x: p.x + STEP[d].x, y: p.y + STEP[d].y }
}

/**
 * Moves along a corridor, turning its corners, until reaching a junction, a dead end or the goal.
 * Returns the cells passed through (not including the start); empty if blocked.
 */
export function slide(maze: Maze, from: Point, dir: Dir): Point[] {
  if (!isOpen(maze, from, dir)) return []
  const goal = goalOf(maze)
  const path: Point[] = []
  let p = from
  let d = dir
  for (let guard = 0; guard < maze.w * maze.h; guard++) {
    p = stepFrom(p, d)
    path.push(p)
    if (samePoint(p, goal)) break
    const onward = openDirs(maze, p).filter((o) => o !== OPPOSITE[d])
    if (onward.length !== 1) break
    d = onward[0]
  }
  return path
}

/** Shortest route from `from` to `to`, not including `from`. */
export function shortestPath(maze: Maze, from: Point, to: Point): Point[] {
  const key = (p: Point) => p.y * maze.w + p.x
  const prev = new Map<number, Point | null>([[key(from), null]])
  const queue = [from]
  while (queue.length) {
    const cur = queue.shift()!
    if (samePoint(cur, to)) break
    for (const d of openDirs(maze, cur)) {
      const n = stepFrom(cur, d)
      if (!prev.has(key(n))) {
        prev.set(key(n), cur)
        queue.push(n)
      }
    }
  }
  const path: Point[] = []
  for (let p: Point | null | undefined = to; p && !samePoint(p, from); p = prev.get(key(p))) path.unshift(p)
  return path
}

function shuffle<T>(items: T[], rng: Rng) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

/**
 * Stars go in dead ends, so collecting them is a small detour. Reaching the cheese ends the stage,
 * so a star is never placed where the only way to it passes the cheese. Small mazes that run out
 * of dead ends fall back to other free cells.
 */
export function placeStars(maze: Maze, count: number, rng: Rng = Math.random): Point[] {
  const start = { x: 0, y: 0 }
  const goal = goalOf(maze)
  const deadEnds: Point[] = []
  const others: Point[] = []
  for (let y = 0; y < maze.h; y++) {
    for (let x = 0; x < maze.w; x++) {
      const p = { x, y }
      if (samePoint(p, start) || samePoint(p, goal)) continue
      if (shortestPath(maze, start, p).some((q) => samePoint(q, goal))) continue
      ;(openDirs(maze, p).length === 1 ? deadEnds : others).push(p)
    }
  }
  return [...shuffle(deadEnds, rng), ...shuffle(others, rng)].slice(0, count)
}

export interface Level {
  maze: Maze
  stars: Point[]
}

export function makeLevel(difficulty: Difficulty, index: number, rng: Rng = Math.random): Level {
  const cfg = DIFFICULTIES[difficulty]
  const size = cfg.sizes[index]
  const maze = generateMaze(size, size, rng)
  return { maze, stars: placeStars(maze, cfg.stars, rng) }
}
