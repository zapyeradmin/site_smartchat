import React, { useEffect, useRef } from 'react'

type BinaryRainProps = {
  color?: string
  speed?: number
  density?: number
  opacity?: number
  className?: string
}

export const BinaryRain: React.FC<BinaryRainProps> = ({
  color = 'rgba(99, 102, 241, 0.8)',
  speed = 1,
  density = 0.9,
  opacity = 0.35,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    const columnWidth = 16
    const columns = Math.floor(width / columnWidth)
    const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -height)

    const resize = () => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }

    const handleResize = () => {
      resize()
    }
    window.addEventListener('resize', handleResize)

    const draw = () => {
      if (!ctx) return
      ctx.fillStyle = `rgba(0,0,0,${Math.min(0.12, opacity)})`
      ctx.fillRect(0, 0, width, height)

      ctx.font = '14px Inter, ui-sans-serif, system-ui'
      for (let i = 0; i < drops.length; i++) {
        const x = i * columnWidth + 4
        const y = drops[i]
        const len = 8 + Math.floor(Math.random() * 8)
        for (let j = 0; j < len; j++) {
          const char = Math.random() > 0.5 ? '1' : '0'
          const alpha = Math.max(0.1, 1 - j / len)
          ctx.fillStyle = color.replace(/\d?\.\d+\)$/,'') + `${alpha})`
          ctx.fillText(char, x, y + j * 16)
        }
        drops[i] += (8 + Math.random() * 12) * speed
        if (drops[i] > height + 32 || Math.random() < 0.002 * density) {
          drops[i] = Math.random() * -height
        }
      }
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [color, speed, density, opacity])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', opacity }}
    />
  )
}