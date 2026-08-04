import { useEffect, useRef, useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Ball, Paddle, Brick, PowerUp, GameState, GameStats, ActivePowerUp, PowerUpType } from '@/lib/types'
import { createBricksForLevel } from '@/lib/levels'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, ArrowClockwise, Lightning, ArrowsOutSimple, Target, Heart } from '@phosphor-icons/react'
import { toast } from 'sonner'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PADDLE_WIDTH = 100
const PADDLE_HEIGHT = 15
const BALL_RADIUS = 8
const BALL_SPEED = 5
const POWERUP_CHANCE = 0.3

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState>('menu')
  const [highScoreValue, setHighScoreValue] = useKV<number>('dxball-highscore', 0)
  const [stats, setStats] = useState<GameStats>({ score: 0, lives: 3, level: 1, highScore: 0 })

  const paddleRef = useRef<Paddle>({
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 40,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 8,
  })
  const [paddle, setPaddle] = useState<Paddle>(paddleRef.current)

  const [balls, setBalls] = useState<Ball[]>([])
  const [bricks, setBricks] = useState<Brick[]>([])
  const [powerUps, setPowerUps] = useState<PowerUp[]>([])
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([])

  const requestRef = useRef<number>(0)
  const keysPressed = useRef<Set<string>>(new Set())

  const createBall = useCallback((fromPaddle = true, currentPaddle?: Paddle): Ball => {
    const p = currentPaddle || paddle
    const angle = fromPaddle ? -Math.PI / 4 + (Math.random() - 0.5) * 0.5 : Math.random() * Math.PI * 2
    return {
      x: fromPaddle ? p.x + p.width / 2 : Math.random() * CANVAS_WIDTH,
      y: fromPaddle ? p.y - BALL_RADIUS - 5 : Math.random() * (CANVAS_HEIGHT / 2),
      dx: Math.cos(angle) * BALL_SPEED,
      dy: Math.sin(angle) * BALL_SPEED,
      radius: BALL_RADIUS,
      speed: BALL_SPEED,
    }
  }, [paddle])

  const startGame = useCallback(() => {
    setStats(prev => ({ ...prev, score: 0, lives: 3, level: 1 }))
    setBricks(createBricksForLevel(1, CANVAS_WIDTH))
    setBalls([createBall()])
    setPowerUps([])
    setActivePowerUps([])
    setPaddle(prev => ({ ...prev, x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, width: PADDLE_WIDTH }))
    setGameState('playing')
  }, [createBall])

  const nextLevel = useCallback(() => {
    const newLevel = stats.level + 1
    setStats(prev => ({ ...prev, level: newLevel, lives: prev.lives + 1 }))
    setBricks(createBricksForLevel(newLevel, CANVAS_WIDTH))
    setBalls([createBall()])
    setPowerUps([])
    setActivePowerUps([])
    setPaddle(prev => ({ ...prev, x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, width: PADDLE_WIDTH }))
    setGameState('playing')
    toast.success(`Level ${newLevel}!`, { description: 'Bonus life awarded!' })
  }, [stats.level, createBall])

  const spawnPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() > POWERUP_CHANCE) return

    const types: PowerUpType[] = ['wide', 'multi', 'laser', 'slow', 'life']
    const type = types[Math.floor(Math.random() * types.length)]

    setPowerUps(prev => [...prev, {
      x,
      y,
      width: 30,
      height: 30,
      type,
      dy: 2,
    }])
  }, [])

  const activatePowerUp = useCallback((type: PowerUpType) => {
    switch (type) {
      case 'wide':
        setPaddle(prev => ({ ...prev, width: PADDLE_WIDTH * 1.5 }))
        setActivePowerUps(prev => [...prev, { type, duration: 10000, maxDuration: 10000 }])
        toast.success('Wide Paddle!', { description: 'Paddle increased in size' })
        break
      case 'multi':
        setBalls(prev => [...prev, createBall(false), createBall(false)])
        toast.success('Multi-Ball!', { description: 'Extra balls spawned' })
        break
      case 'slow':
        setBalls(prev => prev.map(ball => ({
          ...ball,
          dx: ball.dx * 0.7,
          dy: ball.dy * 0.7,
        })))
        setActivePowerUps(prev => [...prev, { type, duration: 8000, maxDuration: 8000 }])
        toast.success('Slow Motion!', { description: 'Ball speed reduced' })
        break
      case 'life':
        setStats(prev => ({ ...prev, lives: prev.lives + 1 }))
        toast.success('Extra Life!', { description: '+1 Life' })
        break
    }
  }, [createBall])

  useEffect(() => {
    const currentHighScore = highScoreValue || 0
    if (stats.score > currentHighScore) {
      setHighScoreValue(stats.score)
      setStats(prev => ({ ...prev, highScore: stats.score }))
    }
  }, [stats.score, highScoreValue, setHighScoreValue])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key)
      if (e.key === ' ' && gameState === 'playing') {
        setGameState('paused')
      } else if (e.key === ' ' && gameState === 'paused') {
        setGameState('playing')
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameState !== 'playing') return
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      setPaddle(prev => ({
        ...prev,
        x: Math.max(0, Math.min(CANVAS_WIDTH - prev.width, x - prev.width / 2)),
      }))
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [gameState, paddle.width])

  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      if (keysPressed.current.has('ArrowLeft')) {
        setPaddle(prev => ({ ...prev, x: Math.max(0, prev.x - prev.speed) }))
      }
      if (keysPressed.current.has('ArrowRight')) {
        setPaddle(prev => ({ ...prev, x: Math.min(CANVAS_WIDTH - prev.width, prev.x + prev.speed) }))
      }

      ctx.fillStyle = 'oklch(0.75 0.15 200)'
      ctx.shadowBlur = 15
      ctx.shadowColor = 'oklch(0.75 0.15 200)'
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
      ctx.shadowBlur = 0

      setBalls(prevBalls => {
        if (prevBalls.length === 0) return prevBalls

        const updatedBalls = prevBalls.map(ball => {
          let newBall = { ...ball }
          newBall.x += newBall.dx
          newBall.y += newBall.dy

          if (newBall.x - newBall.radius <= 0 || newBall.x + newBall.radius >= CANVAS_WIDTH) {
            newBall.dx = -newBall.dx
            newBall.x = newBall.x - newBall.radius <= 0 ? newBall.radius : CANVAS_WIDTH - newBall.radius
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
        }).filter(ball => ball.y - ball.radius < CANVAS_HEIGHT)

        return updatedBalls
      })

      if (balls.length === 0) {
        setStats(prev => {
          const newLives = prev.lives - 1
          if (newLives <= 0) {
            setGameState('gameOver')
            toast.error('Game Over!', { description: `Final Score: ${prev.score}` })
            return { ...prev, lives: 0 }
          }
          toast.warning('Ball Lost!', { description: `${newLives} lives remaining` })
          return { ...prev, lives: newLives }
        })
        setBalls([createBall()])
        setPowerUps([])
        setActivePowerUps([])
        setPaddle(prev => ({ ...prev, width: PADDLE_WIDTH }))
      }

      balls.forEach(ball => {
        ctx.fillStyle = 'oklch(0.98 0 0)'
        ctx.shadowBlur = 20
        ctx.shadowColor = 'oklch(0.75 0.15 200)'
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      setBricks(prevBricks => {
        const updatedBricks = [...prevBricks]
        let scoreIncrease = 0

        balls.forEach(ball => {
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
                spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2)
                scoreIncrease += brick.points
                updatedBricks.splice(i, 1)
              }
              break
            }
          }
        })

        if (scoreIncrease > 0) {
          setStats(prev => ({ ...prev, score: prev.score + scoreIncrease }))
        }

        return updatedBricks
      })

      bricks.forEach(brick => {
        const alpha = brick.hits / brick.maxHits
        ctx.fillStyle = brick.color.replace(')', ` / ${alpha})`)
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height)
        ctx.strokeStyle = 'oklch(0.15 0.05 250)'
        ctx.lineWidth = 1
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height)
      })

      if (bricks.length === 0 && gameState === 'playing') {
        setGameState('levelComplete')
      }

      setPowerUps(prevPowerUps => {
        const updated = prevPowerUps.map(p => ({ ...p, y: p.y + p.dy }))
        
        return updated.filter(powerUp => {
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

      powerUps.forEach(powerUp => {
        const icons: Record<PowerUpType, string> = {
          wide: '↔',
          multi: '●●',
          laser: '↑',
          slow: '🐌',
          life: '❤',
        }
        ctx.fillStyle = 'oklch(0.7 0.25 330)'
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height)
        ctx.fillStyle = 'white'
        ctx.font = '20px Space Grotesk'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(icons[powerUp.type], powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2)
      })

      setActivePowerUps(prev => {
        const updated = prev.map(p => ({ ...p, duration: p.duration - 16 }))
        
        const expired = updated.filter(p => p.duration <= 0)
        expired.forEach(p => {
          if (p.type === 'wide') {
            setPaddle(prev => ({ ...prev, width: PADDLE_WIDTH }))
          }
          if (p.type === 'slow') {
            setBalls(prev => prev.map(ball => ({
              ...ball,
              dx: ball.dx / 0.7,
              dy: ball.dy / 0.7,
            })))
          }
        })
        
        return updated.filter(p => p.duration > 0)
      })

      requestRef.current = requestAnimationFrame(gameLoop)
    }

    requestRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [gameState, paddle, balls, bricks, powerUps, createBall, spawnPowerUp, activatePowerUp])

  const getPowerUpIcon = (type: PowerUpType) => {
    switch (type) {
      case 'wide': return <ArrowsOutSimple weight="fill" />
      case 'multi': return <Target weight="fill" />
      case 'slow': return <Lightning weight="fill" />
      case 'life': return <Heart weight="fill" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/30 shadow-2xl">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-bold tracking-tight text-primary">
              DX BALL
            </h1>
            {gameState === 'playing' && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setGameState('paused')}
                className="border-primary/50 hover:bg-primary/20"
              >
                <Pause weight="fill" />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-muted-foreground text-sm">SCORE</div>
                <div className="text-2xl font-bold text-accent">{stats.score}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">LEVEL</div>
                <div className="text-2xl font-bold text-primary">{stats.level}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">LIVES</div>
                <div className="text-2xl font-bold text-destructive flex gap-1">
                  {Array.from({ length: stats.lives }).map((_, i) => (
                    <Heart key={i} weight="fill" className="inline" />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">HIGH SCORE</div>
              <div className="text-2xl font-bold text-secondary">{highScoreValue || 0}</div>
            </div>
          </div>

          {activePowerUps.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {activePowerUps.map((powerUp, i) => (
                <div key={i} className="flex flex-col gap-1 min-w-24">
                  <Badge variant="secondary" className="flex items-center gap-1 justify-center">
                    {getPowerUpIcon(powerUp.type)}
                    {powerUp.type.toUpperCase()}
                  </Badge>
                  <Progress value={(powerUp.duration / powerUp.maxDuration) * 100} className="h-1" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-primary/30 rounded-lg bg-background/50"
          />

          {gameState === 'menu' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
              <div className="text-center space-y-6">
                <h2 className="text-6xl font-bold tracking-wider" style={{ letterSpacing: '0.2em' }}>
                  DX BALL 2
                </h2>
                <p className="text-muted-foreground text-lg">Break all the bricks to win!</p>
                <Button
                  size="lg"
                  onClick={startGame}
                  className="gap-2 text-lg px-8 bg-primary hover:bg-primary/80 shadow-lg shadow-primary/50"
                >
                  <Play weight="fill" />
                  START GAME
                </Button>
              </div>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
              <div className="text-center space-y-6">
                <h2 className="text-4xl font-bold">PAUSED</h2>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    onClick={() => setGameState('playing')}
                    className="gap-2 bg-primary hover:bg-primary/80"
                  >
                    <Play weight="fill" />
                    RESUME
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={startGame}
                    className="gap-2 border-primary/50"
                  >
                    <ArrowClockwise weight="fill" />
                    RESTART
                  </Button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'levelComplete' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
              <div className="text-center space-y-6">
                <h2 className="text-5xl font-bold text-primary">LEVEL COMPLETE!</h2>
                <p className="text-2xl text-muted-foreground">Level {stats.level}</p>
                <Button
                  size="lg"
                  onClick={nextLevel}
                  className="gap-2 text-lg px-8 bg-accent hover:bg-accent/80 shadow-lg shadow-accent/50"
                >
                  NEXT LEVEL
                </Button>
              </div>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
              <div className="text-center space-y-6">
                <h2 className="text-5xl font-bold text-destructive">GAME OVER</h2>
                <div className="space-y-2">
                  <p className="text-3xl font-mono font-bold text-accent">Score: {stats.score}</p>
                  <p className="text-xl text-muted-foreground">Level: {stats.level}</p>
                  {stats.score === (highScoreValue || 0) && stats.score > 0 && (
                    <p className="text-lg text-secondary font-bold">🏆 NEW HIGH SCORE! 🏆</p>
                  )}
                </div>
                <Button
                  size="lg"
                  onClick={startGame}
                  className="gap-2 text-lg px-8 bg-primary hover:bg-primary/80 shadow-lg shadow-primary/50"
                >
                  <ArrowClockwise weight="fill" />
                  PLAY AGAIN
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
          <p>Move: Mouse or Arrow Keys • Pause: Space</p>
          <p className="text-xs">Collect power-ups for special abilities!</p>
        </div>
      </Card>
    </div>
  )
}

export default App
