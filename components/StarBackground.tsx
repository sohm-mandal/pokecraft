'use client'

import { useEffect, useRef } from 'react'

export function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function draw() {
      if (!ctx || !canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const area = canvas.width * canvas.height
      const count = Math.floor(area / 2800)

      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random()
        const opacity = Math.random() * 0.28 + 0.12

        if (size > 0.93) {
          // Sparkle cross
          const r = Math.random() * 4 + 3
          const o = opacity + 0.25
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(Math.random() * Math.PI)
          ctx.strokeStyle = `rgba(180, 130, 70, ${o})`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.moveTo(-r, 0); ctx.lineTo(r, 0)
          ctx.moveTo(0, -r); ctx.lineTo(0, r)
          ctx.stroke()
          ctx.restore()
        } else if (size > 0.75) {
          // Medium dot
          const r = Math.random() * 2 + 1.5
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(160, 110, 55, ${opacity + 0.2})`
          ctx.fill()
        } else {
          // Small dot
          const r = Math.random() * 1.4 + 0.8
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(26, 26, 24, ${opacity + 0.1})`
          ctx.fill()
        }
      }
    }

    draw()

    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
