import { useEffect, useState } from 'react'
import { sfxMove, sfxSave } from '../../../lib/audio.js'
import { clampIndex, useInput } from '../../../lib/useInput.js'

export default function SaveTab({ data, active }) {
  const [sel, setSel] = useState(0)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(''), 2600)
    return () => clearTimeout(t)
  }, [msg])

  const copiar = async (texto, rotulo) => {
    try {
      await navigator.clipboard.writeText(texto)
      setMsg(`${rotulo} COPIADO.`)
    } catch {
      setMsg(texto)
    }
  }

  const opcoes = [
    {
      id: 'pdf',
      label: 'SALVAR CURRÍCULO',
      hint: 'arquivo .pdf',
      run: () => {
        const a = document.createElement('a')
        a.href = `./${data.pdf}`
        a.download = data.pdf
        a.click()
        setMsg('CURRÍCULO SALVO.')
      },
    },
    {
      id: 'email',
      label: 'E-MAIL',
      hint: data.contato.email,
      run: () => copiar(data.contato.email, 'E-MAIL'),
    },
    {
      id: 'tel',
      label: 'TELEFONE',
      hint: data.contato.telefone,
      run: () => copiar(data.contato.telefone, 'TELEFONE'),
    },
    {
      id: 'linkedin',
      label: 'LINKEDIN',
      hint: 'abrir perfil',
      run: () => window.open(data.contato.linkedin, '_blank', 'noopener'),
    },
    {
      id: 'github',
      label: 'GITHUB',
      hint: 'abrir repositórios',
      run: () => window.open(data.contato.github, '_blank', 'noopener'),
    },
    {
      id: 'site',
      label: 'PORTFÓLIO',
      hint: 'abrir site',
      run: () => window.open(data.contato.site, '_blank', 'noopener'),
    },
  ]

  const move = (d) => {
    const n = clampIndex(sel + d, opcoes.length)
    if (n === sel) return
    sfxMove()
    setSel(n)
  }

  const executar = (i = sel) => {
    sfxSave()
    opcoes[i].run()
  }

  useInput({ up: () => move(-1), down: () => move(1), confirm: () => executar() }, active)

  return (
    <div className="pane">
      <div className="pane-head">
        <h2>SAVE</h2>
        <span>INK RIBBON x99</span>
      </div>

      <div className="save-wrap">
        <svg className="typewriter" viewBox="0 0 130 84" aria-hidden="true">
          <rect x="44" y="4" width="42" height="23" />
          <path className="thin" d="M50 11h30M50 17h22" />
          <rect x="28" y="27" width="74" height="13" rx="6.5" />
          <circle cx="23" cy="33.5" r="5" />
          <circle cx="107" cy="33.5" r="5" />
          <path d="M30 40h70l10 24H20z" />
          <path className="thin" d="M33 47h64M31 55h68" />
          <rect className="fill" x="15" y="64" width="100" height="7" rx="2" />
        </svg>

        <ul className="save-list">
          {opcoes.map((o, i) => (
            <li
              key={o.id}
              className={i === sel ? 'on' : ''}
              onMouseEnter={() => {
                if (i !== sel) {
                  setSel(i)
                  sfxMove()
                }
              }}
              onClick={() => executar(i)}
            >
              <span className="cursor">{i === sel ? '▸' : ' '}</span>
              <b>{o.label}</b>
              <em>{o.hint}</em>
            </li>
          ))}
        </ul>
      </div>

      <p className={`save-msg ${msg ? 'show' : ''}`}>{msg || ' '}</p>
    </div>
  )
}
