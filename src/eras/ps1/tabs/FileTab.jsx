import { useMemo, useState } from 'react'
import { sfxConfirm, sfxMove } from '../../../lib/audio.js'
import { clampIndex, useInput } from '../../../lib/useInput.js'

export function buildFiles(data) {
  return [
    {
      id: 'dossie',
      titulo: 'DOSSIÊ — ARTHUR TELES',
      sub: 'perfil profissional',
      cabecalho: 'Arquivo pessoal · Leitura recomendada',
      paginas: [data.resumo],
    },
    ...data.experiencia.map((e) => ({
      id: e.id,
      titulo: e.arquivo.titulo,
      sub: `${e.periodo}`,
      atual: e.atual,
      ...e.arquivo,
    })),
    ...data.formacao.map((f) => ({
      id: f.id,
      titulo: f.arquivo.titulo,
      sub: `${f.periodo}`,
      ...f.arquivo,
    })),
  ]
}

export default function FileTab({ data, active, onOpen }) {
  const arquivos = useMemo(() => buildFiles(data), [data])
  const [sel, setSel] = useState(0)
  const [lidos, setLidos] = useState(() => new Set())

  const move = (d) => {
    const n = clampIndex(sel + d, arquivos.length)
    if (n === sel) return
    sfxMove()
    setSel(n)
  }

  const open = (i = sel) => {
    sfxConfirm()
    setLidos((prev) => new Set(prev).add(arquivos[i].id))
    onOpen(arquivos[i])
  }

  useInput({ up: () => move(-1), down: () => move(1), confirm: () => open() }, active)

  return (
    <div className="pane">
      <div className="pane-head">
        <h2>FILE</h2>
        <span>
          {lidos.size} / {arquivos.length} LIDOS
        </span>
      </div>

      <ul className="file-list">
        {arquivos.map((a, i) => (
          <li
            key={a.id}
            className={`file-row ${i === sel ? 'on' : ''}`}
            onMouseEnter={() => {
              if (i !== sel) {
                setSel(i)
                sfxMove()
              }
            }}
            onClick={() => open(i)}
          >
            <span className="file-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M6 2h8l5 5v15H6z" />
                <path d="M14 2v6h5" />
                <path d="M9 12h7M9 15h7M9 18h4" />
              </svg>
            </span>
            <span className="file-text">
              <b>{a.titulo}</b>
              <em>{a.sub}</em>
            </span>
            {a.atual && <span className="file-tag">ATIVO</span>}
            {!lidos.has(a.id) && <span className="file-new">●</span>}
          </li>
        ))}
      </ul>

      <p className="pane-foot">ENTER PARA LER O ARQUIVO</p>
    </div>
  )
}
