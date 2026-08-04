import { useEffect } from 'react'
import { GameState } from '@/lib/types'

export function useMouse(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  gameState: GameState,
  canvasWidth: number,
  onPaddleMove: (x: number) => void,
  paddleWidth: number
) {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameState !== 'playing') return
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newX = Math.max(
        0,
        Math.min(canvasWidth - paddleWidth, x - paddleWidth / 2)
      )
      onPaddleMove(newX)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [
    gameState,
    canvasRef,
    canvasWidth,
    onPaddleMove,
    paddleWidth,
  ])
}
