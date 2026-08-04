import { useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { GameState, GameStats } from '@/lib/types'

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>('menu')
  const [highScoreValue, setHighScoreValue] = useKV<number>(
    'dxball-highscore',
    0
  )
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    lives: 3,
    level: 1,
    highScore: 0,
  })

  const updateScore = useCallback((points: number) => {
    setStats(prev => ({ ...prev, score: prev.score + points }))
  }, [])

  const loseLife = useCallback(() => {
    setStats(prev => {
      const newLives = prev.lives - 1
      return { ...prev, lives: newLives }
    })
  }, [])

  const nextLevel = useCallback(() => {
    setStats(prev => ({
      ...prev,
      level: prev.level + 1,
      lives: prev.lives + 1,
    }))
  }, [])

  const resetGame = useCallback(() => {
    setStats({ score: 0, lives: 3, level: 1, highScore: 0 })
  }, [])

  return {
    gameState,
    setGameState,
    highScoreValue,
    setHighScoreValue,
    stats,
    setStats,
    updateScore,
    loseLife,
    nextLevel,
    resetGame,
  }
}
