import { Brick } from './types'

export const BRICK_COLORS = [
  { color: 'oklch(0.7 0.25 330)', hits: 3, points: 30 },
  { color: 'oklch(0.65 0.2 300)', hits: 2, points: 20 },
  { color: 'oklch(0.75 0.15 200)', hits: 2, points: 20 },
  { color: 'oklch(0.75 0.18 45)', hits: 1, points: 10 },
  { color: 'oklch(0.8 0.15 140)', hits: 1, points: 10 },
]

export const LEVELS = [
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  [
    [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    [0, 2, 0, 2, 0, 0, 2, 0, 2, 0],
    [3, 0, 3, 0, 3, 3, 0, 3, 0, 3],
    [0, 2, 0, 2, 0, 0, 2, 0, 2, 0],
    [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  [
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [1, 2, 3, 3, 3, 3, 3, 3, 2, 1],
    [1, 2, 3, 0, 0, 0, 0, 3, 2, 1],
    [1, 2, 3, 3, 3, 3, 3, 3, 2, 1],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
  ],
  [
    [1, 1, 2, 2, 3, 3, 2, 2, 1, 1],
    [1, 2, 2, 3, 3, 3, 3, 2, 2, 1],
    [2, 2, 3, 3, 0, 0, 3, 3, 2, 2],
    [2, 3, 3, 0, 0, 0, 0, 3, 3, 2],
    [2, 2, 3, 3, 0, 0, 3, 3, 2, 2],
    [1, 2, 2, 3, 3, 3, 3, 2, 2, 1],
  ],
  [
    [0, 1, 2, 3, 0, 0, 3, 2, 1, 0],
    [1, 2, 3, 0, 1, 1, 0, 3, 2, 1],
    [2, 3, 0, 1, 2, 2, 1, 0, 3, 2],
    [2, 3, 0, 1, 2, 2, 1, 0, 3, 2],
    [1, 2, 3, 0, 1, 1, 0, 3, 2, 1],
    [0, 1, 2, 3, 0, 0, 3, 2, 1, 0],
  ],
]

export function createBricksForLevel(level: number, canvasWidth: number): Brick[] {
  const bricks: Brick[] = []
  const levelIndex = (level - 1) % LEVELS.length
  const pattern = LEVELS[levelIndex]
  
  const cols = pattern[0].length
  const rows = pattern.length
  const brickWidth = canvasWidth / cols
  const brickHeight = 30
  const padding = 2

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorIndex = pattern[row][col]
      if (colorIndex > 0) {
        const brickData = BRICK_COLORS[colorIndex - 1]
        bricks.push({
          x: col * brickWidth + padding,
          y: row * brickHeight + 60 + padding,
          width: brickWidth - padding * 2,
          height: brickHeight - padding * 2,
          hits: brickData.hits,
          maxHits: brickData.hits,
          color: brickData.color,
          points: brickData.points,
        })
      }
    }
  }

  return bricks
}
