import { useEffect, useMemo, useRef, useState } from 'react'
import { useInput } from '../../lib/useInput.js'
import { COM_TV } from '../../lib/consoles.js'
import IconeXmb from './iconesXmb.jsx'
import Onda from './Onda.jsx'
import { sfxXmbCategoria, sfxXmbEntra, sfxXmbLiga, sfxXmbMove, sfxXmbVolta } from './audioPs3.js'

const CAT_X = 160
const CAT_ESP = 72
const ITEM_Y = 223
const BARRA_Y = 126

function relogio() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getDate()}/${d.getMonth() + 1} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function montarCategorias(data) {
  const contato = data.contato || {}
  return [
    {
      id: 'perfil',
      nome: 'Perfil',
      itens: [
        { id: 'resumo', nome: data.nome, sub: `${data.cargo} · ${data.local}`, corpo: [data.resumo] },
        contato.email && { id: 'email', nome: 'E-mail', sub: contato.email, corpo: [contato.email] },
        contato.telefone && {
          id: 'tel',
          nome: 'Telefone',
          sub: contato.telefone,
          corpo: [contato.telefone],
        },
        contato.linkedin && {
          id: 'in',
          nome: 'LinkedIn',
          sub: 'abrir em nova aba',
          href: contato.linkedin,
        },
        contato.github && {
          id: 'gh',
          nome: 'GitHub',
          sub: 'abrir em nova aba',
          href: contato.github,
        },
        contato.site && {
          id: 'site',
          nome: 'Site profissional',
          sub: 'abrir em nova aba',
          href: contato.site,
        },
      ].filter(Boolean),
    },
    {
      id: 'experiencia',
      nome: 'Experiência',
      itens: data.experiencia.map((e) => ({
        id: e.id,
        nome: e.empresa,
        sub: `${e.cargo} · ${e.periodo}`,
        corpo: e.arquivo.paginas,
        selo: e.atual ? 'EM ANDAMENTO' : null,
      })),
    },
    {
      id: 'formacao',
      nome: 'Formação',
      itens: data.formacao.map((f) => ({
        id: f.id,
        nome: f.curso,
        sub: `${f.instituicao} · ${f.periodo}`,
        corpo: f.arquivo.paginas,
      })),
    },
    {
      id: 'competencias',
      nome: 'Competências',
      itens: data.itens.map((i) => ({
        id: i.id,
        nome: i.nome,
        sub: `${i.tipo} · ${i.nivel}%`,
        barra: i.nivel,
        corpo: [i.desc],
      })),
    },
    {
      id: 'idiomas',
      nome: 'Idiomas',
      itens: data.idiomas.map((l) => ({
        id: l.nome,
        nome: l.nome,
        sub: l.nivel,
        barra: l.barra,
        corpo: [`${l.nome} — ${l.nivel}.`],
      })),
    },
    {
      id: 'curriculo',
      nome: 'Currículo',
      itens: [
        {
          id: 'pdf',
          nome: 'Baixar em PDF',
          sub: 'uma página, sem gráficos',
          href: `./${data.pdf}`,
          baixar: true,
        },
      ],
    },
    {
      id: 'consoles',
      nome: 'Consoles',
      itens: COM_TV.filter((c) => c.id !== 'ps3').map((c) => ({
        id: c.id,
        nome: c.nome,
        sub: c.pronto ? c.skin : 'em produção',
        era: c.pronto ? c.id : null,
      })),
    },
  ]
}

export default function Xmb({ data, onSwitchEra }) {
  const categorias = useMemo(() => montarCategorias(data), [data])
  const [cat, setCat] = useState(1)
  const [item, setItem] = useState(0)
  const [aberto, setAberto] = useState(null)
  const [hora, setHora] = useState(relogio)
  const [entrando, setEntrando] = useState(true)
  const refs = useRef([])

  useEffect(() => {
    const t = setInterval(() => setHora(relogio()), 20000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    sfxXmbLiga()
    const t = setTimeout(() => setEntrando(false), 1650)
    return () => clearTimeout(t)
  }, [])

  const c = categorias[cat]
  const it = c.itens[item]

  const moverCat = (d) => {
    const n = Math.max(0, Math.min(categorias.length - 1, cat + d))
    if (n === cat) return
    sfxXmbCategoria()
    setCat(n)
    setItem(0)
  }

  const moverItem = (d) => {
    const n = Math.max(0, Math.min(c.itens.length - 1, item + d))
    if (n === item) return
    sfxXmbMove()
    setItem(n)
  }

  const abrir = () => {
    if (!it) return
    if (it.href) {
      sfxXmbEntra()
      refs.current[item]?.click()
      return
    }
    if (it.era) {
      sfxXmbEntra()
      onSwitchEra?.(it.era)
      return
    }
    sfxXmbEntra()
    setAberto(it)
  }

  const fechar = () => {
    sfxXmbVolta()
    setAberto(null)
  }

  useInput(
    {
      left: () => moverCat(-1),
      right: () => moverCat(1),
      up: () => moverItem(-1),
      down: () => moverItem(1),
      confirm: abrir,
    },
    !aberto && !entrando,
  )

  useInput({ cancel: fechar, confirm: fechar }, !!aberto)

  return (
    <div className={`xmb ${entrando ? 'entrando' : ''}`}>
      <Onda parado={!!aberto} />

      <div className="xmb-topo">
        <span className="xmb-sinal" />
        <span className="xmb-hora">{hora}</span>
      </div>

      <div className="xmb-barra" style={{ transform: `translateX(${CAT_X - cat * CAT_ESP}px)` }}>
        {categorias.map((x, i) => (
          <button
            key={x.id}
            className={`xmb-cat ${i === cat ? 'on' : ''}`}
            style={{ left: i * CAT_ESP }}
            onClick={() => (i === cat ? abrir() : moverCat(i - cat))}
          >
            <IconeXmb id={x.id} tamanho={i === cat ? 38 : 30} />
            <em>{x.nome}</em>
          </button>
        ))}
      </div>

      <div className="xmb-coluna" style={{ transform: `translateY(${-item * 1}px)` }}>
        {c.itens.map((x, i) => {
          const dist = i - item
          const y = ITEM_Y + (dist === 0 ? 0 : dist > 0 ? 52 + (dist - 1) * 36 : dist * 36 - 16)
          return (
            <div
              key={x.id}
              className={`xmb-item ${i === item ? 'on' : ''}`}
              style={{ top: y, opacity: Math.abs(dist) > 5 ? 0 : 1 }}
              onMouseEnter={() => i !== item && moverItem(i - item)}
              onClick={() => (i === item ? abrir() : moverItem(i - item))}
            >
              <span className="xmb-item-icone">
                <IconeXmb id={c.id} tamanho={i === item ? 30 : 22} />
              </span>
              <span className="xmb-item-txt">
                <b>{x.nome}</b>
                {i === item && <em>{x.sub}</em>}
                {i === item && x.selo && <span className="xmb-selo">{x.selo}</span>}
              </span>
              {x.href && (
                <a
                  ref={(el) => {
                    refs.current[i] = el
                  }}
                  href={x.href}
                  className="xmb-oculto"
                  {...(x.baixar
                    ? { download: true }
                    : { target: '_blank', rel: 'noopener noreferrer' })}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>

      {aberto && (
        <div className="xmb-painel" onClick={fechar}>
          <div className="xmb-painel-caixa" onClick={(e) => e.stopPropagation()}>
            <header>
              <h2>{aberto.nome}</h2>
              <p>{aberto.sub}</p>
            </header>
            {typeof aberto.barra === 'number' && (
              <div className="xmb-barra-nivel">
                <span style={{ width: `${aberto.barra}%` }} />
              </div>
            )}
            <div className="xmb-painel-corpo">
              {(aberto.corpo || []).map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
            <p className="xmb-painel-pe">◯ voltar</p>
          </div>
        </div>
      )}

      <p className="xmb-dica">
        {aberto ? 'ESC ou ENTER volta' : '←→ categoria · ↑↓ item · ENTER abre'}
      </p>
    </div>
  )
}
