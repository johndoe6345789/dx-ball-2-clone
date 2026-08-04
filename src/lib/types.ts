export interface Ball {
  x: number
  y: number
  dx: number
  dy: number
  radius: number
  speed: number
}

export interface Paddle {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

export interface Brick {
  x: number
  y: number
  width: number
  height: number
  hits: number
  maxHits: number
  color: string
  points: number
}

export interface PowerUp {
  x: number
  y: number
  width: number
  height: number
  type: PowerUpType
  dy: number
}

export type PowerUpType = 'wide' | 'multi' | 'laser' | 'slow' | 'life'

export interface ActivePowerUp {
  type: PowerUpType
  duration: number
  maxDuration: number
}

export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'levelComplete'

export interface GameStats {
  score: number
  lives: number
  level: number
  highScore: number
}
