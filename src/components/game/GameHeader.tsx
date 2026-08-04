import { GameStats } from '@/lib/types'
import { Heart } from '@phosphor-icons/react'

interface GameHeaderProps {
  stats: GameStats
  highScore: number
}

export function GameHeader({ stats, highScore }: GameHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 font-mono">
      <div className="flex items-center gap-6">
        <div>
          <div className="text-muted-foreground text-sm">SCORE</div>
          <div className="text-2xl font-bold text-accent">
            {stats.score}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-sm">LEVEL</div>
          <div className="text-2xl font-bold text-primary">
            {stats.level}
          </div>
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
        <div className="text-2xl font-bold text-secondary">
          {highScore}
        </div>
      </div>
    </div>
  )
}
