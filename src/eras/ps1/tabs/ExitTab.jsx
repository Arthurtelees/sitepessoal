import { useState } from 'react'
import { sfxConfirm, sfxDeny, sfxMove, stopAmbience } from '../../../lib/audio.js'
import { clampIndex, useInput } from '../../../lib/useInput.js'
import { COM_TV, CONSOLES } from '../../../lib/consoles.js'

export default function ExitTab({ active, onSwitchEra }) {
  const [sel, setSel] = useState(0)
  const [msg, setMsg] = useState('')

  const move = (d) => {
    const n = clampIndex(sel + d, COM_TV.length)
    if (n === sel) return
    sfxMove()
    setMsg('')
    setSel(n)
  }

  const escolher = (i = sel) => {
    const c = COM_TV[i]
    if (c.id === 'ps1') {
      sfxDeny()
      setMsg('Este disco já está no console.')
      return
    }
    if (!c.pronto) {
      sfxDeny()
      setMsg('A bandeja não abre. Este disco ainda está sendo prensado.')
      return
    }
    sfxConfirm()
    stopAmbience()
    onSwitchEra?.(c.id)
  }

  useInput({ up: () => move(-1), down: () => move(1), confirm: () => escolher() }, active)

  const prontos = CONSOLES.filter((c) => c.pronto).length

  return (
    <div className="pane">
      <div className="pane-head">
        <h2>EXIT</h2>
        <span>TROCAR DE CONSOLE</span>
      </div>

      <ul className="exit-list">
        {COM_TV.map((c, i) => {
          const estado = c.id === 'ps1' ? 'atual' : c.pronto ? 'disponivel' : 'bloqueado'
          const rotulo = c.tv
            ? 'VOLTAR'
            : estado === 'atual'
              ? 'CARREGADO'
              : estado === 'disponivel'
                ? 'INSERIR'
                : 'BLOQUEADO'
          return (
            <li
              key={c.id}
              className={`exit-row ${i === sel ? 'on' : ''} ${estado}`}
              onMouseEnter={() => {
                if (i !== sel) {
                  setSel(i)
                  sfxMove()
                }
              }}
              onClick={() => escolher(i)}
            >
              <span className="exit-disc" aria-hidden="true" />
              <span className="exit-text">
                <b>{c.nome}</b>
                <em>{c.skin}</em>
              </span>
              <span className={`exit-status ${estado}`}>{rotulo}</span>
            </li>
          )
        })}
      </ul>

      <p className="exit-msg">{msg || `${CONSOLES.length} eras. ${prontos} prontas.`}</p>
    </div>
  )
}
