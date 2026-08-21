import { useMemo, useState } from 'react'
import { sfxSaMove } from '../../../lib/audio.js'
import { clampIndex, useInput } from '../../../lib/useInput.js'

export default function BriefTab({ data, active }) {
  const missoes = useMemo(
    () => [
      ...data.experiencia.map((e) => ({
        id: e.id,
        rotulo: e.empresa,
        sub: e.periodo,
        cargo: e.cargo,
        ...e.missao,
      })),
      ...data.formacao.map((f) => ({
        id: f.id,
        rotulo: f.instituicao,
        sub: f.periodo,
        cargo: f.curso,
        ...f.missao,
      })),
    ],
    [data]
  )

  const [sel, setSel] = useState(0)

  const mover = (d) => {
    const n = clampIndex(sel + d, missoes.length)
    if (n === sel) return
    sfxSaMove()
    setSel(n)
  }

  useInput({ up: () => mover(-1), down: () => mover(1) }, active)

  const m = missoes[sel]

  return (
    <div className="sa-pane brief">
      <ul className="brief-lista">
        {missoes.map((mi, i) => (
          <li
            key={mi.id}
            className={`${i === sel ? 'on' : ''} ${mi.status}`}
            onMouseEnter={() => {
              if (i !== sel) {
                setSel(i)
                sfxSaMove()
              }
            }}
          >
            <span className="brief-bala" />
            <span className="brief-rotulo">{mi.rotulo}</span>
          </li>
        ))}
      </ul>

      <article className="brief-card">
        <header>
          <p className="brief-codinome">{m.codinome}</p>
          <p className="brief-meta">
            {m.rotulo} · {m.sub}
          </p>
          <p className="brief-cargo">{m.cargo}</p>
        </header>

        <ul className="brief-objetivos">
          {m.objetivos.map((o) => (
            <li key={o}>
              <span className="check">✓</span>
              {o}
            </li>
          ))}
        </ul>

        <footer>
          <span className={`brief-status ${m.status}`}>
            {m.status === 'completa' ? 'MISSÃO COMPLETA' : 'MISSÃO EM ANDAMENTO'}
          </span>
          <span className="brief-recompensa">RECOMPENSA: {m.recompensa}</span>
        </footer>
      </article>
    </div>
  )
}
