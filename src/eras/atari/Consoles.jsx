import { useState } from 'react'
import { clampIndex, useInput } from '../../lib/useInput.js'
import { COM_TV } from '../../lib/consoles.js'
import { sfxMenu, sfxSeleciona } from './audioAtari.js'

export default function Consoles({ onSair, onSwitchEra }) {
  const [sel, setSel] = useState(0)
  const [msg, setMsg] = useState('')

  const mover = (d) => {
    const n = clampIndex(sel + d, COM_TV.length)
    if (n === sel) return
    sfxMenu()
    setMsg('')
    setSel(n)
  }

  const escolher = (i = sel) => {
    const c = COM_TV[i]
    if (c.id === 'atari') {
      setMsg('ESTE CARTUCHO JÁ ESTÁ NO SLOT')
      return
    }
    if (!c.pronto) {
      setMsg('CARTUCHO AINDA NÃO EXISTE')
      return
    }
    sfxSeleciona()
    onSwitchEra?.(c.id)
  }

  useInput({
    up: () => mover(-1),
    down: () => mover(1),
    confirm: () => escolher(),
    cancel: onSair,
  })

  return (
    <div className="at-consoles">
      <h2>TROCAR CARTUCHO</h2>
      <ul>
        {COM_TV.map((c, i) => (
          <li
            key={c.id}
            className={`${i === sel ? 'on' : ''} ${c.pronto ? '' : 'off'}`}
            onMouseEnter={() => {
              if (i !== sel) {
                setSel(i)
                sfxMenu()
              }
            }}
            onClick={() => escolher(i)}
          >
            <b>{c.nome}</b>
            <em>{c.pronto ? c.skin : 'EM BREVE'}</em>
          </li>
        ))}
      </ul>
      <p className="at-consoles-msg">{msg || 'ESC VOLTA AO MENU'}</p>
    </div>
  )
}
