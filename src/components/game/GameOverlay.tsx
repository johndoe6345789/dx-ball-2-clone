import { Button } from '@/components/ui/button'
import {
  Play,
  Pause,
  ArrowClockwise,
} from '@phosphor-icons/react'
import { GameState } from '@/lib/types'

interface GameOverlayProps {
  gameState: GameState
  score: number
  level: number
  highScore: number
  onStart: () => void
  onResume: () => void
  onNext: () => void
  onPause: () => void
}

export function GameOverlay({
  gameState,
  score,
  level,
  highScore,
  onStart,
  onResume,
  onNext,
}: GameOverlayProps) {
  if (gameState === 'menu') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
        <div className="text-center space-y-6">
          <h2
            className="text-6xl font-bold tracking-wider"
            style={{ letterSpacing: '0.2em' }}
          >
            DX BALL 2
          </h2>
          <p className="text-muted-foreground text-lg">
            Break all the bricks to win!
          </p>
          <Button
            size="lg"
            onClick={onStart}
            className="gap-2 text-lg px-8 bg-primary hover:bg-primary/80 shadow-lg shadow-primary/50"
          >
            <Play weight="fill" />
            START GAME
          </Button>
        </div>
      </div>
    )
  }

  if (gameState === 'paused') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold">PAUSED</h2>
          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={onResume}
              className="gap-2 bg-primary hover:bg-primary/80"
            >
              <Play weight="fill" />
              RESUME
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onStart}
              className="gap-2 border-primary/50"
            >
              <ArrowClockwise weight="fill" />
              RESTART
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'levelComplete') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
        <div className="text-center space-y-6">
          <h2 className="text-5xl font-bold text-primary">
            LEVEL COMPLETE!
          </h2>
          <p className="text-2xl text-muted-foreground">Level {level}</p>
          <Button
            size="lg"
            onClick={onNext}
            className="gap-2 text-lg px-8 bg-accent hover:bg-accent/80 shadow-lg shadow-accent/50"
          >
            NEXT LEVEL
          </Button>
        </div>
      </div>
    )
  }

  if (gameState === 'gameOver') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
        <div className="text-center space-y-6">
          <h2 className="text-5xl font-bold text-destructive">
            GAME OVER
          </h2>
          <div className="space-y-2">
            <p className="text-3xl font-mono font-bold text-accent">
              Score: {score}
            </p>
            <p className="text-xl text-muted-foreground">
              Level: {level}
            </p>
            {score === highScore && score > 0 && (
              <p className="text-lg text-secondary font-bold">
                🏆 NEW HIGH SCORE! 🏆
              </p>
            )}
          </div>
          <Button
            size="lg"
            onClick={onStart}
            className="gap-2 text-lg px-8 bg-primary hover:bg-primary/80 shadow-lg shadow-primary/50"
          >
            <ArrowClockwise weight="fill" />
            PLAY AGAIN
          </Button>
        </div>
      </div>
    )
  }

  return null
}
