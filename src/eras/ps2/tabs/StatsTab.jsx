import { useMemo, useState } from 'react'
import { sfxSaMove } from '../../../lib/audio.js'
import { useInput } from '../../../lib/useInput.js'

const VISIVEIS = 8

function anosDeCarreira(inicioIso) {
  const inicio = new Date(inicioIso)
  const dias = (Date.now() - inicio.getTime()) / 86400000
  return Math.max(0, dias / 365.25)
}

export default function StatsTab({ data, active }) {
  const linhas = useMemo(() => {
    const anos = anosDeCarreira(data.carreiraInicio)
    return [
      { grupo: 'COMPETÊNCIAS TÉCNICAS' },
      ...data.itens.map((i) => ({ nome: i.nome, barra: i.nivel, valor: `${i.nivel}%` })),
      { grupo: 'NÚMEROS DA CARREIRA' },
      { nome: 'EMPRESAS', valor: String(data.experiencia.length) },
      { nome: 'ANOS DE EXPERIÊNCIA', valor: anos.toFixed(1) },
      { nome: 'FORMAÇÕES CONCLUÍDAS', valor: String(data.formacao.length) },
      { nome: 'TEMPO OPERACIONAL REDUZIDO', barra: 43, valor: '43%' },
      { nome: 'GANHO DE EFICIÊNCIA', barra: 15, valor: '15%' },
      { nome: 'COMBINAÇÕES DE STACK', valor: String(data.combinacoes.length) },
      { grupo: 'IDIOMAS' },
      ...data.idiomas.map((l) => ({ nome: l.nome, barra: l.barra, valor: l.nivel })),
    ]
  }, [data])

  const selecionaveis = linhas.map((l, i) => (l.grupo ? -1 : i)).filter((i) => i >= 0)
  const [sel, setSel] = useState(selecionaveis[0] ?? 0)
  const [topo, setTopo] = useState(0)

  const progresso = useMemo(() => {
    const soma = data.itens.reduce((acc, i) => acc + i.nivel, 0)
    return soma / data.itens.length
  }, [data])

  const mover = (d) => {
    const pos = selecionaveis.indexOf(sel)
    const alvo = Math.max(0, Math.min(selecionaveis.length - 1, pos + d))
    const novo = selecionaveis[alvo]
    if (novo === sel) return
    setSel(novo)
    sfxSaMove()
    setTopo((t) => {
      if (novo < t) return novo
      if (novo > t + VISIVEIS - 1) return novo - VISIVEIS + 1
      return t
    })
  }

  useInput({ up: () => mover(-1), down: () => mover(1) }, active)

  const janela = linhas.slice(topo, topo + VISIVEIS)

  return (
    <div className="sa-pane">
      <div className="stat-progresso">
        <span className="stat-progresso-label">PROGRESSO</span>
        <span className="stat-progresso-valor">{progresso.toFixed(2)}%</span>
        <span className="stat-progresso-barra">
          <i style={{ width: `${progresso}%` }} />
        </span>
      </div>

      <ul className="stat-lista">
        {janela.map((l, i) => {
          const idx = topo + i
          if (l.grupo) {
            return (
              <li key={`g-${idx}`} className="stat-grupo">
                {l.grupo}
              </li>
            )
          }
          return (
            <li
              key={`${l.nome}-${idx}`}
              className={`stat-linha ${idx === sel ? 'on' : ''}`}
              onMouseEnter={() => {
                if (idx !== sel) {
                  setSel(idx)
                  sfxSaMove()
                }
              }}
            >
              <span className="stat-nome">{l.nome}</span>
              {l.barra != null && (
                <span className="stat-barra">
                  <i style={{ width: `${l.barra}%` }} />
                </span>
              )}
              <span className="stat-valor">{l.valor}</span>
            </li>
          )
        })}
      </ul>

      <div className="sa-scroll">
        {topo > 0 && <span>▲</span>}
        <span className="sa-scroll-pos">
          {Math.min(topo + VISIVEIS, linhas.length)} / {linhas.length}
        </span>
        {topo + VISIVEIS < linhas.length && <span>▼</span>}
      </div>
    </div>
  )
}
