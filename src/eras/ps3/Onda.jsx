import { useEffect, useRef } from 'react'

const TAU = Math.PI * 2
const PASSO = 10

const FITAS = [
  { yA: 0.34, ampA: 22, freqA: 0.7, faseA: 0.2, yB: 0.47, ampB: 28, freqB: 0.6, faseB: 1.1, alfa: 0.045, vel: 0.028, luz: 0 },
  { yA: 0.4, ampA: 24, freqA: 0.9, faseA: 2.1, yB: 0.5, ampB: 18, freqB: 1.2, faseB: 3.4, alfa: 0.065, vel: -0.04, luz: 0.34 },
  { yA: 0.44, ampA: 18, freqA: 1.1, faseA: 4.2, yB: 0.52, ampB: 22, freqB: 0.8, faseB: 5.1, alfa: 0.08, vel: 0.052, luz: 0.62 },
  { yA: 0.48, ampA: 15, freqA: 1.4, faseA: 1.4, yB: 0.54, ampB: 20, freqB: 1, faseB: 2.6, alfa: 0.055, vel: -0.066, luz: 0.24 },
  { yA: 0.52, ampA: 22, freqA: 0.8, faseA: 3.7, yB: 0.62, ampB: 26, freqB: 0.7, faseB: 4.9, alfa: 0.04, vel: 0.034, luz: 0 },
  { yA: 0.56, ampA: 16, freqA: 1.3, faseA: 5.5, yB: 0.6, ampB: 13, freqB: 1.6, faseB: 0.7, alfa: 0.05, vel: -0.024, luz: 0.42 },
]

const N_POEIRA = 62

export default function Onda({ parado = false }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const pai = canvas.parentElement
    const L = Math.round(pai.clientWidth) || 688
    const A = Math.round(pai.clientHeight) || 480
    canvas.width = L
    canvas.height = A
    const ctx = canvas.getContext('2d')
    const curva = (x, y0, amp, freq, fase, t, vel) => {
      const p = (x / L) * TAU * freq + fase + t * vel * TAU
      return y0 * A + Math.sin(p) * amp + Math.sin(p * 2.7 + fase) * amp * 0.22
    }
    let raf
    let t = 0
    let anterior = 0

    const poeira = Array.from({ length: N_POEIRA }, () => ({
      x: Math.random() * L,
      y: Math.random() * A,
      r: 0.6 + Math.random() * 1.7,
      a: 0.1 + Math.random() * 0.42,
      vx: 3 + Math.random() * 9,
      vy: -2 - Math.random() * 7,
    }))

    const desenhar = (agora) => {
      const dt = anterior ? Math.min(0.05, (agora - anterior) / 1000) : 0
      anterior = agora
      if (!parado) t += dt
      ctx.clearRect(0, 0, L, A)

      for (const f of FITAS) {
        ctx.beginPath()
        for (let x = 0; x <= L; x += PASSO) {
          const y = curva(x, f.yA, f.ampA, f.freqA, f.faseA, t, f.vel)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        for (let x = L; x >= 0; x -= PASSO) {
          ctx.lineTo(x, curva(x, f.yB, f.ampB, f.freqB, f.faseB, t, f.vel * 0.82))
        }
        ctx.closePath()
        ctx.fillStyle = `rgba(255,255,255,${f.alfa})`
        ctx.fill()

        if (f.luz > 0) {
          ctx.beginPath()
          for (let x = 0; x <= L; x += PASSO) {
            const y = curva(x, f.yA, f.ampA, f.freqA, f.faseA, t, f.vel)
            if (x === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.strokeStyle = `rgba(255,255,255,${f.luz * 0.5})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      for (const p of poeira) {
        if (!parado) {
          p.x += p.vx * dt
          p.y += p.vy * dt
          if (p.x > L + 6) p.x = -6
          if (p.y < -6) p.y = A + 6
        }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
        g.addColorStop(0, `rgba(255,255,255,${p.a})`)
        g.addColorStop(0.4, `rgba(255,255,255,${p.a * 0.35})`)
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 3, 0, TAU)
        ctx.fill()
      }

      raf = requestAnimationFrame(desenhar)
    }

    raf = requestAnimationFrame(desenhar)
    return () => cancelAnimationFrame(raf)
  }, [parado])

  return <canvas ref={ref} className="xmb-onda" aria-hidden="true" />
}
