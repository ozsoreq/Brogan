import { describe, expect, it } from 'vitest'
import {
  DIFFICULTIES,
  DIRS,
  generateMaze,
  goalOf,
  isOpen,
  makeLevel,
  openDirs,
  placeStars,
  samePoint,
  shortestPath,
  slide,
  stepFrom,
  type Maze,
  type Point,
} from './mazeLogic'

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A hand-made 3x2 maze (up=1 right=2 down=4 left=8). The middle column is the spine:
//   S ─ ┬ ─ .
//   . ─ ┴ ─ G
const tiny: Maze = {
  w: 3,
  h: 2,
  cells: [
    [2, 8 | 4 | 2, 8],
    [2, 8 | 1 | 2, 8],
  ],
}

function reachable(maze: Maze) {
  const seen = new Set(['0,0'])
  const queue: Point[] = [{ x: 0, y: 0 }]
  while (queue.length) {
    const p = queue.shift()!
    for (const d of openDirs(maze, p)) {
      const n = stepFrom(p, d)
      if (!seen.has(`${n.x},${n.y}`)) {
        seen.add(`${n.x},${n.y}`)
        queue.push(n)
      }
    }
  }
  return seen.size
}

describe('maze generation', () => {
  it('makes a perfect maze: every cell reachable, no loops, walls match on both sides', () => {
    for (const size of [5, 9, 14]) {
      const m = generateMaze(size, size, seeded(size))
      expect(reachable(m)).toBe(size * size)
      let openings = 0
      for (let y = 0; y < m.h; y++) {
        for (let x = 0; x < m.w; x++) {
          for (const d of DIRS) {
            if (!isOpen(m, { x, y }, d)) continue
            openings++
            const n = stepFrom({ x, y }, d)
            expect(n.x >= 0 && n.y >= 0 && n.x < m.w && n.y < m.h).toBe(true)
            const back = { up: 'down', down: 'up', left: 'right', right: 'left' } as const
            expect(isOpen(m, n, back[d])).toBe(true)
          }
        }
      }
      // A tree with N cells has N-1 passages, each counted from both sides.
      expect(openings / 2).toBe(size * size - 1)
    }
  })

  it('is different each time but repeatable with the same seed', () => {
    expect(generateMaze(8, 8, seeded(1))).toEqual(generateMaze(8, 8, seeded(1)))
    expect(generateMaze(8, 8, seeded(1))).not.toEqual(generateMaze(8, 8, seeded(2)))
  })
})

describe('moving', () => {
  it('cannot walk through a wall', () => {
    expect(slide(tiny, { x: 0, y: 0 }, 'down')).toEqual([])
    expect(slide(tiny, { x: 0, y: 0 }, 'up')).toEqual([])
  })

  it('follows a corridor around corners and stops at a junction', () => {
    // From (2,0) going left: (1,0) is a corner (left+down... plus right), i.e. a junction of 3.
    expect(slide(tiny, { x: 2, y: 0 }, 'left')).toEqual([{ x: 1, y: 0 }])
    // (0,1) going right reaches (1,1), a junction.
    expect(slide(tiny, { x: 0, y: 1 }, 'right')).toEqual([{ x: 1, y: 1 }])
  })

  it('always stops on the cheese', () => {
    const m = generateMaze(9, 9, seeded(5))
    const goal = goalOf(m)
    const route = shortestPath(m, { x: 0, y: 0 }, goal)
    const beforeGoal = route.length > 1 ? route[route.length - 2] : { x: 0, y: 0 }
    const dir = DIRS.find((d) => samePoint(stepFrom(beforeGoal, d), goal))!
    const path = slide(m, beforeGoal, dir)
    expect(path[path.length - 1]).toEqual(goal)
  })

  it('a slide only ever passes through open doors', () => {
    const m = generateMaze(10, 10, seeded(9))
    let p = { x: 0, y: 0 }
    const rng = seeded(3)
    for (let i = 0; i < 200; i++) {
      const dirs = openDirs(m, p)
      const path = slide(m, p, dirs[Math.floor(rng() * dirs.length)])
      let prev = p
      for (const q of path) {
        const d = DIRS.find((dd) => samePoint(stepFrom(prev, dd), q))!
        expect(isOpen(m, prev, d)).toBe(true)
        prev = q
      }
      p = path[path.length - 1]
    }
  })
})

describe('route and stars', () => {
  it('the shortest route leads from start to cheese through open doors', () => {
    const m = generateMaze(12, 12, seeded(11))
    const route = shortestPath(m, { x: 0, y: 0 }, goalOf(m))
    expect(route[route.length - 1]).toEqual(goalOf(m))
    let prev = { x: 0, y: 0 }
    for (const q of route) {
      expect(openDirs(m, prev).some((d) => samePoint(stepFrom(prev, d), q))).toBe(true)
      prev = q
    }
  })

  it('stars sit in different dead ends, never on the start or the cheese', () => {
    const m = generateMaze(8, 8, seeded(4))
    const stars = placeStars(m, 3, seeded(4))
    expect(stars).toHaveLength(3)
    expect(new Set(stars.map((s) => `${s.x},${s.y}`)).size).toBe(3)
    for (const s of stars) {
      expect(openDirs(m, s)).toHaveLength(1)
      expect(samePoint(s, { x: 0, y: 0 }) || samePoint(s, goalOf(m))).toBe(false)
    }
  })

  it('every stage gets all its stars, and each can be reached without passing the cheese', () => {
    for (const d of Object.keys(DIFFICULTIES) as (keyof typeof DIFFICULTIES)[]) {
      for (let i = 0; i < 5; i++) {
        for (let seed = 0; seed < 40; seed++) {
          const { maze, stars } = makeLevel(d, i, seeded(seed * 10 + i))
          expect(stars).toHaveLength(DIFFICULTIES[d].stars)
          for (const s of stars) {
            expect(shortestPath(maze, { x: 0, y: 0 }, s).some((p) => samePoint(p, goalOf(maze)))).toBe(false)
          }
        }
      }
    }
  })

  it('each difficulty has 5 stages that grow, and harder means bigger', () => {
    for (const cfg of Object.values(DIFFICULTIES)) {
      expect(cfg.sizes).toHaveLength(5)
      for (let i = 1; i < 5; i++) expect(cfg.sizes[i]).toBeGreaterThanOrEqual(cfg.sizes[i - 1])
    }
    expect(DIFFICULTIES.hard.sizes[0]).toBeGreaterThan(DIFFICULTIES.easy.sizes[0])
    const level = makeLevel('medium', 4, seeded(8))
    expect(level.maze.w).toBe(DIFFICULTIES.medium.sizes[4])
    expect(level.stars).toHaveLength(DIFFICULTIES.medium.stars)
  })
})
