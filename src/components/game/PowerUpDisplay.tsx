import { ActivePowerUp } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowsOutSimple,
  Target,
  Lightning,
  Heart,
} from '@phosphor-icons/react'

interface PowerUpDisplayProps {
  activePowerUps: ActivePowerUp[]
}

function getPowerUpIcon(type: string) {
  switch (type) {
    case 'wide':
      return <ArrowsOutSimple weight="fill" />
    case 'multi':
      return <Target weight="fill" />
    case 'slow':
      return <Lightning weight="fill" />
    case 'life':
      return <Heart weight="fill" />
    default:
      return null
  }
}

export function PowerUpDisplay({ activePowerUps }: PowerUpDisplayProps) {
  if (activePowerUps.length === 0) return null

  return (
    <div className="flex gap-2 flex-wrap">
      {activePowerUps.map((powerUp, i) => (
        <div key={i} className="flex flex-col gap-1 min-w-24">
          <Badge
            variant="secondary"
            className="flex items-center gap-1 justify-center"
          >
            {getPowerUpIcon(powerUp.type)}
            {powerUp.type.toUpperCase()}
          </Badge>
          <Progress
            value={(powerUp.duration / powerUp.maxDuration) * 100}
            className="h-1"
          />
        </div>
      ))}
    </div>
  )
}
