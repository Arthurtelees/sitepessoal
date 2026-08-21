import { useMemo, useState } from 'react'
import { clampIndex, useInput } from '../../lib/useInput.js'
import { sfxMenu, sfxSeleciona } from './audioAtari.js'

export default function Curriculo({ data, onSair }) {
  const [i, setI] = useState(0)

  const cartoes = useMemo(() => {
    const lista = [
      {
        id: 'perfil',
        cor: 'branco',
        titulo: data.nome.toUpperCase(),
        sub: `${data.cargo} · ${data.local}`,
        paragrafo: data.resumo,
      },
      ...data.experiencia.map((e) => ({
        id: e.id,
        cor: 'laranja',
        titulo: e.empresa.toUpperCase(),
        sub: `${e.cargo} · ${e.periodo}`,
        itens: e.missao.objetivos,
        marca: e.missao.recompensa,
      })),
      ...data.formacao.map((f) => ({
        id: f.id,
        cor: 'verde',
        titulo: f.instituicao.toUpperCase(),
        sub: `${f.curso} · ${f.periodo}`,
        itens: f.missao.objetivos,
        marca: f.missao.recompensa,
      })),
      {
        id: 'skills',
        cor: 'azul',
        titulo: 'COMPETÊNCIAS',
        sub: `${data.itens.length} itens no inventário`,
        grade: data.itens.map((x) => x.nome),
      },
      {
        id: 'contato',
        cor: 'amarelo',
        titulo: 'CONTATO',
        sub: data.local,
        linhas: [
          ['E-MAIL', data.contato.email],
          ['TELEFONE', data.contato.telefone],
          ['LINKEDIN', 'linkedin.com/in/arthur-teles-179145202'],
          ['GITHUB', 'github.com/Arthurtelees'],
        ],
        acao: 'BOTÃO BAIXA O CURRÍCULO EM PDF',
      },
    ]
    return lista
  }, [data])

  const mover = (d) => {
    const n = clampIndex(i + d, cartoes.length)
    if (n === i) return
    sfxMenu()
    setI(n)
  }

  const agir = () => {
    if (cartoes[i].id !== 'contato') return
    sfxSeleciona()
    const a = document.createElement('a')
    a.href = `./${data.pdf}`
    a.download = data.pdf
    a.click()
  }

  useInput({
    left: () => mover(-1),
    right: () => mover(1),
    up: () => mover(-1),
    down: () => mover(1),
    confirm: agir,
    cancel: onSair,
  })

  const c = cartoes[i]

  return (
    <div className="at-cur">
      <header className={`at-cur-topo ${c.cor}`}>
        <h2>{c.titulo}</h2>
        <p>{c.sub}</p>
      </header>

      <div className="at-cur-corpo">
        {c.paragrafo && <p className="at-cur-texto">{c.paragrafo}</p>}

        {c.itens && (
          <ul className="at-cur-itens">
            {c.itens.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        )}

        {c.grade && (
          <ul className="at-cur-grade">
            {c.grade.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        )}

        {c.linhas && (
          <ul className="at-cur-linhas">
            {c.linhas.map(([r, v]) => (
              <li key={r}>
                <b>{r}</b>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        )}

        {c.marca && <p className={`at-cur-marca ${c.cor}`}>{c.marca}</p>}
        {c.acao && <p className="at-cur-acao blink">{c.acao}</p>}
      </div>

      <footer className="at-cur-pe">
        <span className="at-cur-pontos">
          {cartoes.map((x, k) => (
            <i key={x.id} className={k === i ? 'on' : ''} />
          ))}
        </span>
        <span>
          {i + 1}/{cartoes.length} · SETAS VIRAM A PÁGINA · ESC VOLTA
        </span>
      </footer>
    </div>
  )
}
