import { useState } from 'react'
import { sfxSaBack, sfxSaConfirm, sfxSaMove, stopAmbience } from '../../../lib/audio.js'
import { clampIndex, useInput } from '../../../lib/useInput.js'
import { COM_TV, CONSOLES } from '../../../lib/consoles.js'

export default function QuitTab({ active, onSwitchEra }) {
  const [sel, setSel] = useState(0)
  const [msg, setMsg] = useState('')

  const mover = (d) => {
    const n = clampIndex(sel + d, COM_TV.length)
    if (n === sel) return
    sfxSaMove()
    setMsg('')
    setSel(n)
  }

  const escolher = (i = sel) => {
    const c = COM_TV[i]
    if (c.id === 'ps2') {
      sfxSaBack()
      setMsg('Este disco já está rodando.')
      return
    }
    if (!c.pronto) {
      sfxSaBack()
      setMsg('Console ainda não lançado. Volte depois.')
      return
    }
    sfxSaConfirm()
    stopAmbience()
    onSwitchEra?.(c.id)
  }

  useInput({ up: () => mover(-1), down: () => mover(1), confirm: () => escolher() }, active)

  const prontas = CONSOLES.filter((c) => c.pronto).length

  return (
    <div className="sa-pane">
      <p className="quit-intro">O mesmo currículo, em outra geração.</p>

      <ul className="quit-lista">
        {COM_TV.map((c, i) => {
          const estado = c.id === 'ps2' ? 'atual' : c.pronto ? 'disponivel' : 'bloqueado'
          const rotulo = c.tv
            ? 'VOLTAR'
            : estado === 'atual'
              ? 'RODANDO'
              : estado === 'disponivel'
                ? 'TROCAR'
                : 'EM BREVE'
          return (
            <li
              key={c.id}
              className={`${i === sel ? 'on' : ''} ${estado}`}
              onMouseEnter={() => {
                if (i !== sel) {
                  setSel(i)
                  sfxSaMove()
                }
              }}
              onClick={() => escolher(i)}
            >
              <span className="quit-nome">{c.nome}</span>
              <span className="quit-skin">{c.skin}</span>
              <span className={`quit-estado ${estado}`}>{rotulo}</span>
            </li>
          )
        })}
      </ul>

      <p className="quit-msg">{msg || `${prontas} eras prontas. Faltam ${CONSOLES.length - prontas}.`}</p>
    </div>
  )
}
