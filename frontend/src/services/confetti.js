import confetti from 'canvas-confetti'

export function fireworks(cb) {
  const duration = 7 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

  const randomInRange = (min, max) => Math.random() * (max - min) + min

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()
    if (timeLeft <= 0) { return clearInterval(interval) }
    const particleCount = 200 * (timeLeft / duration)
    // since particles fall down, start a bit higher than random
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 } })
  }, 100)
  if(cb) { setTimeout(cb, duration) }
}

export default confetti