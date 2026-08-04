import { useEffect, useRef } from 'react'
import { GameState } from '@/lib/types'

export function useKeyboard(
  gameState: GameState,
  onPause: () => void,
  onResume: () => void
) {
  const keysPressed = useRef<Set<string>>(new Set())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key)
      if (e.key === ' ' && gameState === 'playing') {
        onPause()
      } else if (e.key === ' ' && gameState === 'paused') {
        onResume()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState, onPause, onResume])

  return keysPressed
}
