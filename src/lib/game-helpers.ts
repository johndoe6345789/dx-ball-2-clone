import { Ball, Paddle, PowerUpType } from './types'
import {
  BALL_RADIUS,
  BALL_SPEED,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from './constants'

export function createBall(
  fromPaddle: boolean,
  paddle: Paddle
): Ball {
  const angle = fromPaddle
    ? -Math.PI / 4 + (Math.random() - 0.5) * 0.5
    : Math.random() * Math.PI * 2

  return {
    x: fromPaddle
      ? paddle.x + paddle.width / 2
      : Math.random() * CANVAS_WIDTH,
    y: fromPaddle
      ? paddle.y - BALL_RADIUS - 5
      : Math.random() * (CANVAS_HEIGHT / 2),
    dx: Math.cos(angle) * BALL_SPEED,
    dy: Math.sin(angle) * BALL_SPEED,
    radius: BALL_RADIUS,
    speed: BALL_SPEED,
  }
}

export function getPowerUpIcon(type: PowerUpType): string {
  const icons: Record<PowerUpType, string> = {
    wide: '↔',
    multi: '●●',
    laser: '↑',
    slow: '🐌',
    life: '❤',
  }
  return icons[type]
}
