import { useEffect, useRef, useState } from 'react'

const SILHUETA =
  'M8,280 L14,240 C22,214 56,200 88,206 L100,208 L100,184 C74,178 66,150 68,116 C70,70 92,42 120,42 C148,42 170,70 172,116 C174,150 166,178 140,184 L140,208 L152,206 C184,200 218,214 226,240 L232,280 Z'

const ALCANCE_X = 7
const ALCANCE_Y = 5

export default function Retrato() {
  const caixa = useRef(null)
  const [olhar, setOlhar] = useState({ x: 0, y: 0 })
  const [semImagem, setSemImagem] = useState(false)

  useEffect(() => {
    const aoMover = (e) => {
      const el = caixa.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)
      const dy = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)
      setOlhar({
        x: Math.max(-1, Math.min(1, dx)),
        y: Math.max(-1, Math.min(1, dy)),
      })
    }
    window.addEventListener('mousemove', aoMover)
    return () => window.removeEventListener('mousemove', aoMover)
  }, [])

  if (semImagem) {
    return (
      <svg className="retrato-silhueta" viewBox="0 0 240 280" aria-hidden="true">
        <path d={SILHUETA} fill="#1b2f56" transform="translate(4,-1)" />
        <path d={SILHUETA} fill="#4d84c8" transform="translate(-4,-3)" />
        <path d={SILHUETA} fill="#070d1e" />
      </svg>
    )
  }

  return (
    <div className="retrato" ref={caixa}>
      <div
        className="retrato-cabeca"
        style={{
          transform: `translate(${-olhar.x * ALCANCE_X}px, ${-olhar.y * ALCANCE_Y}px) scale(1.07)`,
        }}
      >
        <img src="./retrato.png" alt="" onError={() => setSemImagem(true)} />
      </div>
    </div>
  )
}
