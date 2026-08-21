import { useEffect, useState } from 'react'
import {
  initAudio,
  sfxCancel,
  sfxConfirm,
  sfxMove,
  sfxStart,
  sfxTituloRe2,
} from '../../lib/audio.js'
import { clampIndex, useInput } from '../../lib/useInput.js'

export default function Title({ data, onStart }) {
  const [stage, setStage] = useState('press')
  const [sel, setSel] = useState(0)

  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPronto(true), 1500)
    if (sfxTituloRe2(false)) return () => clearTimeout(t)
    const espera = setTimeout(sfxTituloRe2, 380)
    return () => {
      clearTimeout(t)
      clearTimeout(espera)
    }
  }, [])

  const options = [
    { id: 'start', label: 'NOVO JOGO', hint: 'abrir o currículo' },
    { id: 'load', label: 'CARREGAR', hint: 'baixar o PDF' },
    { id: 'about', label: 'SOBRE', hint: 'o que é isto' },
  ]

  const press = () => {
    initAudio()
    sfxStart()
    setStage('menu')
  }

  const mover = (d) => {
    const n = clampIndex(sel + d, options.length)
    if (n === sel) return
    sfxMove()
    setSel(n)
  }

  const choose = () => {
    const opt = options[sel]
    if (opt.id === 'start') {
      sfxConfirm()
      onStart()
    } else if (opt.id === 'load') {
      sfxConfirm()
      const a = document.createElement('a')
      a.href = `./${data.pdf}`
      a.download = data.pdf
      a.click()
    } else {
      sfxConfirm()
      setStage('about')
    }
  }

  useInput(
    {
      confirm: press,
      cancel: press,
    },
    stage === 'press'
  )

  useInput(
    {
      up: () => mover(-1),
      down: () => mover(1),
      confirm: choose,
    },
    stage === 'menu'
  )

  useInput(
    {
      confirm: () => {
        sfxCancel()
        setStage('menu')
      },
      cancel: () => {
        sfxCancel()
        setStage('menu')
      },
    },
    stage === 'about'
  )

  return (
    <div className="scr scr-title" onClick={stage === 'press' ? press : undefined}>
      <div className="title-clarao" aria-hidden="true" />
      <div className="title-fog fog-a" />
      <div className="title-fog fog-b" />

      <div className="title-block">
        <p className="title-over">{data.nome.toUpperCase()}</p>
        <h1 className="title-main">
          RESIDENT <span>DEV</span>
        </h1>
        <p className="title-under">{data.cargo} · {data.local}</p>
      </div>

      {stage === 'press' && pronto && <p className="title-press blink">PRESSIONE START</p>}

      {stage === 'menu' && (
        <ul className="title-menu fade-in">
          {options.map((o, i) => (
            <li
              key={o.id}
              className={i === sel ? 'on' : ''}
              onMouseEnter={() => {
                if (i !== sel) {
                  setSel(i)
                  sfxMove()
                }
              }}
              onClick={choose}
            >
              <span className="cursor">{i === sel ? '▸' : ' '}</span>
              {o.label}
              <em>{o.hint}</em>
            </li>
          ))}
        </ul>
      )}

      {stage === 'about' && (
        <div className="title-about fade-in">
          <p>
            Currículo de <strong>{data.nome}</strong> reinterpretado como as interfaces de cada
            geração de PlayStation. Esta é a era <strong>PS1</strong>, no formato dos menus de
            survival horror de 1998.
          </p>
          <p>
            Projeto autoral, sem vínculo com Sony, Capcom ou qualquer detentor de marca. Quase todo
            o som é sintetizado no navegador; as exceções são material original, cedido pelo autor
            do projeto, e saem a pedido de quem detém o direito.
          </p>
          <p className="dim">PS2 disponível. PS3 · PS4 · PS5 em construção.</p>
          <span className="blink">▼ voltar</span>
        </div>
      )}

      <p className="title-hint">
        {stage === 'menu' ? '↑↓ navegar · ENTER confirmar' : 'ENTER · X · qualquer tecla'}
      </p>
    </div>
  )
}
