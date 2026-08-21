import { useMemo, useState } from 'react'
import { sfxSaMove, sfxTerritorio } from '../../../lib/audio.js'
import { clampIndex, useInput } from '../../../lib/useInput.js'

export default function TerritoryTab({ data, active }) {
  const zonas = data.territorios.zonas
  const [sel, setSel] = useState(0)
  const [conquistados, setConquistados] = useState(() => new Set())

  const detalhes = useMemo(() => {
    const m = {}
    for (const e of data.experiencia) m[e.id] = { periodo: e.periodo, premio: e.missao.recompensa }
    for (const f of data.formacao) m[f.id] = { periodo: f.periodo, premio: f.missao.recompensa }
    return m
  }, [data])

  const mover = (d) => {
    const n = clampIndex(sel + d, zonas.length)
    if (n === sel) return
    sfxSaMove()
    setSel(n)
  }

  const conquistar = (i = sel) => {
    const z = zonas[i]
    if (conquistados.has(z.id)) {
      sfxSaMove()
      return
    }
    sfxTerritorio()
    setConquistados((prev) => new Set(prev).add(z.id))
  }

  useInput(
    {
      up: () => mover(-1),
      down: () => mover(1),
      left: () => mover(-1),
      right: () => mover(1),
      confirm: () => conquistar(),
    },
    active
  )

  const z = zonas[sel]
  const d = detalhes[z.id] || {}
  const total = zonas.length
  const feitos = conquistados.size
  const pct = ((feitos / total) * 100).toFixed(0)

  return (
    <div className="sa-pane mapa">
      <div className="mapa-topo">
        <span>{data.territorios.titulo}</span>
        <span className="mapa-contador">
          TERRITÓRIOS {feitos}/{total} · {pct}%
        </span>
      </div>

      <div className="mapa-corpo">
        <div className="mapa-quadro">
          <img src="./sa-mapa.webp" alt="" />
          <svg viewBox="0 0 512 512" className="mapa-svg" role="img" aria-label="Territórios">
            {zonas.map((zona, i) => (
              <g
                key={zona.id}
                className={`mapa-zona ${i === sel ? 'on' : ''} ${
                  conquistados.has(zona.id) ? 'dono' : ''
                }`}
                onMouseEnter={() => {
                  if (i !== sel) {
                    setSel(i)
                    sfxSaMove()
                  }
                }}
                onClick={() => conquistar(i)}
              >
                <rect x={zona.x} y={zona.y} width={zona.w} height={zona.h} />
              </g>
            ))}
          </svg>
        </div>

        <ul className="mapa-lista">
          {zonas.map((zona, i) => (
            <li
              key={zona.id}
              className={`${i === sel ? 'on' : ''} ${conquistados.has(zona.id) ? 'dono' : ''}`}
              onMouseEnter={() => {
                if (i !== sel) {
                  setSel(i)
                  sfxSaMove()
                }
              }}
              onClick={() => conquistar(i)}
            >
              <span className="mapa-bala" />
              <span className="mapa-rotulo">
                <b>{zona.nome}</b>
                <em>{zona.legenda}</em>
              </span>
              {zona.atual && <span className="mapa-aqui">AQUI</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="mapa-rodape">
        <p className="mapa-detalhe">
          {d.periodo ? `${d.periodo} · ${d.premio}` : data.territorios.nota}
        </p>
        <p className="mapa-acao">
          {feitos === total ? (
            <span className="dono">SAN ANDREAS INTEIRO É SEU. 100%.</span>
          ) : conquistados.has(z.id) ? (
            <span className="dono">TERRITÓRIO CONQUISTADO</span>
          ) : (
            <span>ENTER PARA TOMAR O TERRITÓRIO</span>
          )}
        </p>
      </div>
    </div>
  )
}
