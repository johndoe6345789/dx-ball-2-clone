import { useRef, useEffect, useCallback, useState } from 'react'
import { useGameState } from '@/hooks/use-game-state'
import { useKeyboard } from '@/hooks/use-keyboard'
import { useMouse } from '@/hooks/use-mouse'
import { useGameLoop } from '@/hooks/use-game-loop'
import { createBricksForLevel } from '@/lib/levels'
import { createBall } from '@/lib/game-helpers'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
} from '@/lib/constants'
import { Ball, Paddle, Brick, PowerUp, ActivePowerUp } from '@/lib/types'
import { GameHeader } from '@/components/game/GameHeader'
import { PowerUpDisplay } from '@/components/game/PowerUpDisplay'
import { GameOverlay } from '@/components/game/GameOverlay'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pause } from '@phosphor-icons/react'
import { toast } from 'sonner'

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const {
    gameState,
    setGameState,
    highScoreValue,
    setHighScoreValue,
    stats,
    setStats,
    updateScore,
    loseLife,
    nextLevel: incrementLevel,
    resetGame,
  } = useGameState()

  const [paddle, setPaddle] = useState<Paddle>({
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 40,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 8,
  })

  const [balls, setBalls] = useState<Ball[]>([])
  const [bricks, setBricks] = useState<Brick[]>([])
  const [powerUps, setPowerUps] = useState<PowerUp[]>([])
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>(
    []
  )

  const onPause = useCallback(() => setGameState('paused'), [setGameState])
  const onResume = useCallback(
    () => setGameState('playing'),
    [setGameState]
  )

  const keysPressed = useKeyboard(gameState, onPause, onResume)

  useMouse(
    canvasRef,
    gameState,
    CANVAS_WIDTH,
    (x) => setPaddle((prev) => ({ ...prev, x })),
    paddle.width
  )

  const startGame = useCallback(() => {
    resetGame()
    setBricks(createBricksForLevel(1, CANVAS_WIDTH))
    setBalls([createBall(true, paddle)])
    setPowerUps([])
    setActivePowerUps([])
    setPaddle((prev) => ({
      ...prev,
      x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      width: PADDLE_WIDTH,
    }))
    setGameState('playing')
  }, [resetGame, paddle, setGameState])

  const handleNextLevel = useCallback(() => {
    incrementLevel()
    setBricks(createBricksForLevel(stats.level + 1, CANVAS_WIDTH))
    setBalls([createBall(true, paddle)])
    setPowerUps([])
    setActivePowerUps([])
    setPaddle((prev) => ({
      ...prev,
      x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      width: PADDLE_WIDTH,
    }))
    setGameState('playing')
    toast.success(`Level ${stats.level + 1}!`, {
      description: 'Bonus life awarded!',
    })
  }, [incrementLevel, stats.level, paddle, setGameState])

  useGameLoop({
    canvasRef,
    gameState,
    paddle,
    balls,
    bricks,
    powerUps,
    activePowerUps,
    keysPressed,
    stats,
    onSetPaddle: setPaddle,
    onSetBalls: setBalls,
    onSetBricks: setBricks,
    onSetPowerUps: setPowerUps,
    onSetActivePowerUps: setActivePowerUps,
    onUpdateScore: updateScore,
    onLoseLife: loseLife,
    onSetGameState: setGameState,
  })

  useEffect(() => {
    const currentHighScore = highScoreValue || 0
    if (stats.score > currentHighScore) {
      setHighScoreValue(stats.score)
      setStats((prev) => ({ ...prev, highScore: stats.score }))
    }
  }, [stats.score, highScoreValue, setHighScoreValue, setStats])

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
                onClick={onPause}
                className="border-primary/50 hover:bg-primary/20"
              >
                <Pause weight="fill" />
              </Button>
            )}
          </div>

          <GameHeader stats={stats} highScore={highScoreValue || 0} />
          <PowerUpDisplay activePowerUps={activePowerUps} />
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-primary/30 rounded-lg bg-background/50"
          />

          <GameOverlay
            gameState={gameState}
            score={stats.score}
            level={stats.level}
            highScore={highScoreValue || 0}
            onStart={startGame}
            onResume={onResume}
            onNext={handleNextLevel}
            onPause={onPause}
          />
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
          <p>Move: Mouse or Arrow Keys • Pause: Space</p>
          <p className="text-xs">
            Collect power-ups for special abilities!
          </p>
        </div>
      </Card>
    </div>
  )
}

export default App
