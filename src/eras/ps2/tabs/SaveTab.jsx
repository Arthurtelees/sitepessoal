import { useEffect, useState } from 'react'
import { sfxSaConfirm, sfxSaMove } from '../../../lib/audio.js'
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
      setMsg(`${rotulo} COPIADO`)
    } catch {
      setMsg(texto)
    }
  }

  const slots = [
    {
      id: 'pdf',
      slot: 'SLOT 01',
      label: 'CURRÍCULO COMPLETO',
      valor: 'arquivo .pdf',
      run: () => {
        const a = document.createElement('a')
        a.href = `./${data.pdf}`
        a.download = data.pdf
        a.click()
        setMsg('CURRÍCULO SALVO')
      },
    },
    {
      id: 'email',
      slot: 'SLOT 02',
      label: 'E-MAIL',
      valor: data.contato.email,
      run: () => copiar(data.contato.email, 'E-MAIL'),
    },
    {
      id: 'tel',
      slot: 'SLOT 03',
      label: 'TELEFONE',
      valor: data.contato.telefone,
      run: () => copiar(data.contato.telefone, 'TELEFONE'),
    },
    {
      id: 'linkedin',
      slot: 'SLOT 04',
      label: 'LINKEDIN',
      valor: 'abrir perfil',
      run: () => window.open(data.contato.linkedin, '_blank', 'noopener'),
    },
    {
      id: 'github',
      slot: 'SLOT 05',
      label: 'GITHUB',
      valor: 'abrir repositórios',
      run: () => window.open(data.contato.github, '_blank', 'noopener'),
    },
    {
      id: 'site',
      slot: 'SLOT 06',
      label: 'PORTFÓLIO',
      valor: 'abrir site',
      run: () => window.open(data.contato.site, '_blank', 'noopener'),
    },
  ]

  const mover = (d) => {
    const n = clampIndex(sel + d, slots.length)
    if (n === sel) return
    sfxSaMove()
    setSel(n)
  }

  const executar = (i = sel) => {
    sfxSaConfirm()
    slots[i].run()
  }

  useInput({ up: () => mover(-1), down: () => mover(1), confirm: () => executar() }, active)

  return (
    <div className="sa-pane">
      <p className="save-casa">CASA SEGURA — {data.local}</p>

      <ul className="save-slots">
        {slots.map((s, i) => (
          <li
            key={s.id}
            className={i === sel ? 'on' : ''}
            onMouseEnter={() => {
              if (i !== sel) {
                setSel(i)
                sfxSaMove()
              }
            }}
            onClick={() => executar(i)}
          >
            <span className="save-icone" aria-hidden="true" />
            <span className="save-slot">{s.slot}</span>
            <span className="save-label">{s.label}</span>
            <span className="save-valor">{s.valor}</span>
          </li>
        ))}
      </ul>

      <p className={`save-aviso ${msg ? 'show' : ''}`}>{msg || 'ENTER PARA SALVAR NESTE SLOT'}</p>
    </div>
  )
}
