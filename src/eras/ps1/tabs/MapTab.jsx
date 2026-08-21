import { useMemo, useState } from 'react'
import { sfxConfirm, sfxMove } from '../../../lib/audio.js'
import { clampIndex, useInput } from '../../../lib/useInput.js'

export default function MapTab({ data, active, onTravel }) {
  const salas = data.mapa.salas
  const [sel, setSel] = useState(0)

  const arquivos = useMemo(() => {
    const m = {}
    for (const e of data.experiencia) m[e.id] = { ...e.arquivo, id: e.id }
    for (const f of data.formacao) m[f.id] = { ...f.arquivo, id: f.id }
    return m
  }, [data])

  const move = (d) => {
    const n = clampIndex(sel + d, salas.length)
    if (n === sel) return
    sfxMove()
    setSel(n)
  }

  const viajar = (i = sel) => {
    const arquivo = arquivos[salas[i].id]
    if (!arquivo) return
    sfxConfirm()
    onTravel(arquivo)
  }

  useInput(
    {
      up: () => move(-1),
      down: () => move(1),
      left: () => move(-1),
      right: () => move(1),
      confirm: () => viajar(),
    },
    active
  )

  const atual = salas[sel]

  return (
    <div className="pane">
      <div className="pane-head">
        <h2>MAP</h2>
        <span>{data.mapa.titulo}</span>
      </div>

      <div className="map-wrap">
        <svg viewBox="20 20 380 240" className="map-svg" role="img" aria-label="Mapa da carreira">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0H0v10" fill="none" stroke="rgba(90,160,190,.10)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect x="20" y="20" width="380" height="240" fill="url(#grid)" />

          {data.mapa.corredores.map((c, i) => (
            <rect
              key={i}
              x={c.x}
              y={c.y}
              width={c.w}
              height={c.h}
              className="map-hall"
            />
          ))}

          {salas.map((s, i) => (
            <g
              key={s.id}
              className={`map-room ${i === sel ? 'on' : ''} ${s.atual ? 'atual' : ''}`}
              onMouseEnter={() => {
                if (i !== sel) {
                  setSel(i)
                  sfxMove()
                }
              }}
              onClick={() => viajar(i)}
            >
              <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="2" />
              <text x={s.x + s.w / 2} y={s.y + s.h / 2 + 3} textAnchor="middle">
                {s.nome}
              </text>
              {s.atual && (
                <circle className="map-you" cx={s.x + s.w - 12} cy={s.y + 12} r="3.5" />
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className="map-info">
        <p>
          <b>{atual.nome}</b> — {atual.legenda}
          {atual.atual && <span className="map-here"> · VOCÊ ESTÁ AQUI</span>}
        </p>
      </div>

      <p className="pane-foot">ENTER PARA ATRAVESSAR</p>
    </div>
  )
}
