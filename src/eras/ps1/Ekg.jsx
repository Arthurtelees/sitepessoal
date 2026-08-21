import { useEffect, useRef } from 'react'

export default function Ekg({ width = 166, height = 36, color = '#46d95a', speed = 46 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const period = 92
    const amp = height * 0.4
    const mid = height / 2
    let offset = 0
    let last = performance.now()
    let raf

    const beat = (t) => {
      const g = (c, w, a) => a * Math.exp(-Math.pow((t - c) / w, 2))
      return (
        g(0.3, 0.022, 0.16) -
        g(0.45, 0.011, 0.22) +
        g(0.485, 0.009, 1.0) -
        g(0.53, 0.015, 0.34) +
        g(0.7, 0.05, 0.26)
      )
    }

    const draw = (now) => {
      const dt = (now - last) / 1000
      last = now
      offset = (offset + speed * dt) % period

      ctx.clearRect(0, 0, width, height)

      ctx.strokeStyle = 'rgba(70, 217, 90, 0.14)'
      ctx.setLineDash([2, 4])
      ctx.beginPath()
      ctx.moveTo(0, mid)
      ctx.lineTo(width, mid)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.strokeStyle = color
      ctx.lineWidth = 1.6
      ctx.shadowColor = color
      ctx.shadowBlur = 5
      ctx.beginPath()
      for (let x = 0; x <= width; x++) {
        const t = (((x + offset) / period) % 1 + 1) % 1
        const y = mid - beat(t) * amp
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [width, height, color, speed])

  return <canvas ref={ref} width={width} height={height} className="ekg" aria-hidden="true" />
}
