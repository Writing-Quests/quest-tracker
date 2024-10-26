import confetti from 'canvas-confetti'
import { useEffect } from 'react'

const randomInRange = (min, max) => Math.random() * (max - min) + min

export function fireworks(cb) {
  const duration = 7 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()
    if (timeLeft <= 0) { return clearInterval(interval) }
    const particleCount = 200 * (timeLeft / duration)
    // since particles fall down, start a bit higher than random
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 } })
  }, 200)
  if(cb) { setTimeout(cb, duration) }
}

export default confetti

// Launches confetti fron the center of the screen when mounted
export function Confetti() {
  const count = 200
  const origin = {x: 0.5, y: 0.7}

  function fire(particleRatio, opts) {
    confetti({
      ...opts,
      origin: {
        x: randomInRange(origin.x - 0.1, origin.x + 0.1),
        y: randomInRange(origin.y - 0.1, origin.y + 0.1),
      },
      particleCount: Math.floor(count * particleRatio)
    })
  }

  useEffect(() => {
    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60, })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45, })
  }, [])
  return null
}
