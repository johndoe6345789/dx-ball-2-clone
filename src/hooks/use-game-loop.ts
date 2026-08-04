import { useRef, useEffect, useCallback, useState } from 'react'
import { createBall, getPowerUpIcon } from '@/lib/game-helpers'
import { createBricksForLevel } from '@/lib/levels'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  POWERUP_CHANCE,
} from '@/lib/constants'
import {
  Ball,
  Paddle,
  Brick,
  PowerUp,
  ActivePowerUp,
  PowerUpType,
  GameState,
  GameStats,
} from '@/lib/types'
import { toast } from 'sonner'

interface UseGameLoopProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  gameState: GameState
  paddle: Paddle
  balls: Ball[]
  bricks: Brick[]
  powerUps: PowerUp[]
  activePowerUps: ActivePowerUp[]
  keysPressed: React.RefObject<Set<string>>
  stats: GameStats
  onSetPaddle: (updater: (prev: Paddle) => Paddle) => void
  onSetBalls: (updater: (prev: Ball[]) => Ball[]) => void
  onSetBricks: (updater: (prev: Brick[]) => Brick[]) => void
  onSetPowerUps: (updater: (prev: PowerUp[]) => PowerUp[]) => void
  onSetActivePowerUps: (
    updater: (prev: ActivePowerUp[]) => ActivePowerUp[]
  ) => void
  onUpdateScore: (points: number) => void
  onLoseLife: () => void
  onSetGameState: (state: GameState) => void
}

export function useGameLoop(props: UseGameLoopProps) {
  const {
    canvasRef,
    gameState,
    paddle,
    balls,
    bricks,
    powerUps,
    activePowerUps,
    keysPressed,
    stats,
    onSetPaddle,
    onSetBalls,
    onSetBricks,
    onSetPowerUps,
    onSetActivePowerUps,
    onUpdateScore,
    onLoseLife,
    onSetGameState,
  } = props

  const requestRef = useRef<number>(0)

  const spawnPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() > POWERUP_CHANCE) return

    const types: PowerUpType[] = ['wide', 'multi', 'laser', 'slow', 'life']
    const type = types[Math.floor(Math.random() * types.length)]

    onSetPowerUps((prev) => [
      ...prev,
      { x, y, width: 30, height: 30, type, dy: 2 },
    ])
  }, [onSetPowerUps])

  const activatePowerUp = useCallback(
    (type: PowerUpType) => {
      switch (type) {
        case 'wide':
          onSetPaddle((prev) => ({ ...prev, width: PADDLE_WIDTH * 1.5 }))
          onSetActivePowerUps((prev) => [
            ...prev,
            { type, duration: 10000, maxDuration: 10000 },
          ])
          toast.success('Wide Paddle!', {
            description: 'Paddle increased in size',
          })
          break
        case 'multi':
          onSetBalls((prev) => [
            ...prev,
            createBall(false, paddle),
            createBall(false, paddle),
          ])
          toast.success('Multi-Ball!', {
            description: 'Extra balls spawned',
          })
          break
        case 'slow':
          onSetBalls((prev) =>
            prev.map((ball) => ({
              ...ball,
              dx: ball.dx * 0.7,
              dy: ball.dy * 0.7,
            }))
          )
          onSetActivePowerUps((prev) => [
            ...prev,
            { type, duration: 8000, maxDuration: 8000 },
          ])
          toast.success('Slow Motion!', {
            description: 'Ball speed reduced',
          })
          break
        case 'life':
          toast.success('Extra Life!', { description: '+1 Life' })
          break
      }
    },
    [onSetPaddle, onSetBalls, onSetActivePowerUps, paddle]
  )

  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      if (keysPressed.current.has('ArrowLeft')) {
        onSetPaddle((prev) => ({
          ...prev,
          x: Math.max(0, prev.x - prev.speed),
        }))
      }
      if (keysPressed.current.has('ArrowRight')) {
        onSetPaddle((prev) => ({
          ...prev,
          x: Math.min(CANVAS_WIDTH - prev.width, prev.x + prev.speed),
        }))
      }

      ctx.fillStyle = 'oklch(0.75 0.15 200)'
      ctx.shadowBlur = 15
      ctx.shadowColor = 'oklch(0.75 0.15 200)'
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
      ctx.shadowBlur = 0

      onSetBalls((prevBalls) => {
        if (prevBalls.length === 0) return prevBalls

        const updatedBalls = prevBalls
          .map((ball) => {
            let newBall = { ...ball }
            newBall.x += newBall.dx
            newBall.y += newBall.dy

            if (
              newBall.x - newBall.radius <= 0 ||
              newBall.x + newBall.radius >= CANVAS_WIDTH
            ) {
              newBall.dx = -newBall.dx
              newBall.x =
                newBall.x - newBall.radius <= 0
                  ? newBall.radius
                  : CANVAS_WIDTH - newBall.radius
            }
            if (newBall.y - newBall.radius <= 0) {
              newBall.dy = -newBall.dy
              newBall.y = newBall.radius
            }

            if (
              newBall.y + newBall.radius >= paddle.y &&
              newBall.y - newBall.radius <= paddle.y + paddle.height &&
              newBall.x >= paddle.x &&
              newBall.x <= paddle.x + paddle.width
            ) {
              const hitPos = (newBall.x - paddle.x) / paddle.width
              const angle = Math.PI / 4 + hitPos * (Math.PI / 2)
              const speed = Math.sqrt(newBall.dx ** 2 + newBall.dy ** 2)
              newBall.dx = Math.cos(Math.PI - angle) * speed
              newBall.dy = -Math.abs(Math.sin(Math.PI - angle) * speed)
              newBall.y = paddle.y - newBall.radius
            }

            return newBall
          })
          .filter((ball) => ball.y - ball.radius < CANVAS_HEIGHT)

        return updatedBalls
      })

      if (balls.length === 0) {
        onLoseLife()
        if (stats.lives - 1 <= 0) {
          onSetGameState('gameOver')
          toast.error('Game Over!', {
            description: `Final Score: ${stats.score}`,
          })
        } else {
          toast.warning('Ball Lost!', {
            description: `${stats.lives - 1} lives remaining`,
          })
          onSetBalls(() => [createBall(true, paddle)])
          onSetPowerUps(() => [])
          onSetActivePowerUps(() => [])
          onSetPaddle((prev) => ({ ...prev, width: PADDLE_WIDTH }))
        }
      }

      balls.forEach((ball) => {
        ctx.fillStyle = 'oklch(0.98 0 0)'
        ctx.shadowBlur = 20
        ctx.shadowColor = 'oklch(0.75 0.15 200)'
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      onSetBricks((prevBricks) => {
        const updatedBricks = [...prevBricks]
        let scoreIncrease = 0

        balls.forEach((ball) => {
          for (let i = updatedBricks.length - 1; i >= 0; i--) {
            const brick = updatedBricks[i]
            if (
              ball.x + ball.radius > brick.x &&
              ball.x - ball.radius < brick.x + brick.width &&
              ball.y + ball.radius > brick.y &&
              ball.y - ball.radius < brick.y + brick.height
            ) {
              const overlapX = Math.min(
                ball.x + ball.radius - brick.x,
                brick.x + brick.width - (ball.x - ball.radius)
              )
              const overlapY = Math.min(
                ball.y + ball.radius - brick.y,
                brick.y + brick.height - (ball.y - ball.radius)
              )

              if (overlapX < overlapY) {
                ball.dx = -ball.dx
              } else {
                ball.dy = -ball.dy
              }

              brick.hits -= 1
              if (brick.hits <= 0) {
                spawnPowerUp(
                  brick.x + brick.width / 2,
                  brick.y + brick.height / 2
                )
                scoreIncrease += brick.points
                updatedBricks.splice(i, 1)
              }
              break
            }
          }
        })

        if (scoreIncrease > 0) {
          onUpdateScore(scoreIncrease)
        }

        return updatedBricks
      })

      bricks.forEach((brick) => {
        const alpha = brick.hits / brick.maxHits
        ctx.fillStyle = brick.color.replace(')', ` / ${alpha})`)
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height)
        ctx.strokeStyle = 'oklch(0.15 0.05 250)'
        ctx.lineWidth = 1
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height)
      })

      if (bricks.length === 0 && gameState === 'playing') {
        onSetGameState('levelComplete')
      }

      onSetPowerUps((prevPowerUps) => {
        const updated = prevPowerUps.map((p) => ({ ...p, y: p.y + p.dy }))

        return updated.filter((powerUp) => {
          if (
            powerUp.y + powerUp.height >= paddle.y &&
            powerUp.y <= paddle.y + paddle.height &&
            powerUp.x + powerUp.width >= paddle.x &&
            powerUp.x <= paddle.x + paddle.width
          ) {
            activatePowerUp(powerUp.type)
            return false
          }
          return powerUp.y < CANVAS_HEIGHT
        })
      })

      powerUps.forEach((powerUp) => {
        ctx.fillStyle = 'oklch(0.7 0.25 330)'
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height)
        ctx.fillStyle = 'white'
        ctx.font = '20px Space Grotesk'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          getPowerUpIcon(powerUp.type),
          powerUp.x + powerUp.width / 2,
          powerUp.y + powerUp.height / 2
        )
      })

      onSetActivePowerUps((prev) => {
        const updated = prev.map((p) => ({ ...p, duration: p.duration - 16 }))

        const expired = updated.filter((p) => p.duration <= 0)
        expired.forEach((p) => {
          if (p.type === 'wide') {
            onSetPaddle((prev) => ({ ...prev, width: PADDLE_WIDTH }))
          }
          if (p.type === 'slow') {
            onSetBalls((prev) =>
              prev.map((ball) => ({
                ...ball,
                dx: ball.dx / 0.7,
                dy: ball.dy / 0.7,
              }))
            )
          }
        })

        return updated.filter((p) => p.duration > 0)
      })

      requestRef.current = requestAnimationFrame(gameLoop)
    }

    requestRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [
    gameState,
    paddle,
    balls,
    bricks,
    powerUps,
    canvasRef,
    keysPressed,
    stats,
    onSetPaddle,
    onSetBalls,
    onSetBricks,
    onSetPowerUps,
    onSetActivePowerUps,
    onUpdateScore,
    onLoseLife,
    onSetGameState,
    spawnPowerUp,
    activatePowerUp,
  ])
}
