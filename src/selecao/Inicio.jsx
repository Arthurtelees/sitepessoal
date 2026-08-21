import { useEffect, useMemo, useRef, useState } from 'react'
import { sfxConfirm, sfxMove } from '../lib/audio.js'
import { useInput } from '../lib/useInput.js'
import { CONSOLES } from '../lib/consoles.js'

const relogio = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function Inicio({ data, ativo = true, onComecar, onTrocar }) {
  const [sel, setSel] = useState(0)
  const [hora, setHora] = useState(relogio)
  const refs = useRef([])
  const contato = data.contato || {}
  const primeira = CONSOLES[0]

  useEffect(() => {
    const t = setInterval(() => setHora(relogio()), 15000)
    return () => clearInterval(t)
  }, [])

  const acoes = useMemo(() => {
    const c = data.contato || {}
    return [
      { id: 'comecar', label: `Começar pelo ${primeira.nome.replace('ATARI 2600', 'Atari 2600')}` },
      { id: 'pdf', label: 'Currículo em PDF', href: `./${data.pdf}`, baixar: true },
      { id: 'linkedin', label: 'LinkedIn', href: c.linkedin },
      { id: 'site', label: 'Site', href: c.site },
      { id: 'github', label: 'GitHub', href: c.github },
    ].filter((a) => a.id === 'comecar' || a.href)
  }, [data, primeira])

  const mover = (d) => {
    const n = (sel + d + acoes.length) % acoes.length
    if (n === sel) return
    sfxMove()
    setSel(n)
  }

  const acionar = (i = sel) => {
    const a = acoes[i]
    if (!a) return
    if (a.id === 'comecar') {
      sfxConfirm()
      onComecar?.()
      return
    }
    refs.current[i]?.click()
  }

  useInput({ left: () => mover(-1), right: () => mover(1), confirm: () => acionar() }, ativo)

  return (
    <div className="hoje">
      <header className="hoje-topo">
        <span className="hoje-sinal">TRANSMISSÃO ABERTA</span>
        <b>ARTHUR TELES</b>
        <span className="hoje-fim">
          {data.local}
          <em>{hora}</em>
        </span>
      </header>

      <section className="hoje-fala">
        <p className="hoje-identidade">{data.cargo}</p>
        <h1>
          Seu currículo,
          <span>em quatro eras.</span>
        </h1>
        <p className="hoje-subtitulo">Escolha uma era e descubra o que está por trás da tela.</p>

        <nav className="hoje-acoes">
          {acoes
            .filter((a) => !a.href)
            .map((a) => (
              <button
                key={a.id}
                type="button"
                className={`hoje-principal ${sel === 0 ? 'on' : ''}`}
                onMouseEnter={() => setSel(0)}
                onClick={() => acionar(0)}
              >
                <i aria-hidden="true" />
                {a.label}
              </button>
            ))}

          <span className="hoje-links">
            {acoes.map((a, i) =>
              a.href ? (
                <a
                  key={a.id}
                  ref={(el) => {
                    refs.current[i] = el
                  }}
                  href={a.href}
                  className={`hoje-link ${i === sel ? 'on' : ''}`}
                  {...(a.baixar
                    ? { download: true }
                    : { target: '_blank', rel: 'noopener noreferrer' })}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => sfxConfirm()}
                >
                  {a.label}
                  <i aria-hidden="true">{a.baixar ? '↓' : '↗'}</i>
                </a>
              ) : null,
            )}
          </span>
        </nav>
      </section>

      <nav className="hoje-eixo" aria-label="linha do tempo">
        {CONSOLES.map((c, i) => (
          <button
            key={c.id}
            type="button"
            style={{ '--i': i }}
            onClick={() => onTrocar?.(c.id)}
            title={`${c.nome} · ${c.skin}`}
          >
            <i aria-hidden="true" />
            <b>{c.ano}</b>
            <em>{c.skin}</em>
          </button>
        ))}
        <span className="hoje-eixo-agora">
          <i aria-hidden="true" />
          <b>hoje</b>
          <em>você está aqui</em>
        </span>
      </nav>

      <p className="hoje-aviso">
        Projeto autoral, sem fins comerciais e sem vínculo, patrocínio ou aprovação de Sony, Atari,
        Capcom, Rockstar Games ou Take-Two. As eras recriadas aqui são homenagem aos jogos que
        fizeram parte da minha infância — em nenhum momento houve intenção de copiar ou de violar o
        direito de ninguém. Marcas e material original pertencem aos seus titulares, e qualquer
        trecho apontado como indevido é retirado a pedido
        {contato.email ? `: ${contato.email}` : ''}.
      </p>
    </div>
  )
}
