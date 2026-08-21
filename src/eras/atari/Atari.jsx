import { useCallback, useEffect, useState } from 'react'
import data from '../../data/curriculo.json'
import { initAudio } from '../../lib/audio.js'
import { clampIndex, useInput } from '../../lib/useInput.js'
import { sfxMenu, sfxSeleciona } from './audioAtari.js'
import Jogo from './Jogo.jsx'
import Curriculo from './Curriculo.jsx'
import Consoles from './Consoles.jsx'
import './atari.css'

const OPCOES = [
  { id: 'jogo', rotulo: 'JOGAR BREAKOUT' },
  { id: 'curriculo', rotulo: 'LER O CURRÍCULO' },
  { id: 'consoles', rotulo: 'TROCAR CARTUCHO' },
]

export default function Atari({ onSwitchEra, audioReady, onAudioReady }) {
  const [fase, setFase] = useState(audioReady ? 'menu' : 'desligado')
  const [sel, setSel] = useState(0)

  const ligar = useCallback(() => {
    initAudio()
    onAudioReady?.()
    setFase('menu')
  }, [onAudioReady])

  const mover = (d) => {
    const n = clampIndex(sel + d, OPCOES.length)
    if (n === sel) return
    sfxMenu()
    setSel(n)
  }

  const entrar = (i = sel) => {
    sfxSeleciona()
    setSel(i)
    setFase(OPCOES[i].id)
  }

  const voltar = useCallback(() => setFase('menu'), [])

  useInput({ confirm: ligar, cancel: ligar }, fase === 'desligado')
  useInput(
    { up: () => mover(-1), down: () => mover(1), confirm: () => entrar() },
    fase === 'menu'
  )

  return (
    <div className="atari">
      {fase === 'desligado' && (
        <div className="at-desligado" onClick={ligar} role="button" tabIndex={0}>
          <span className="at-led" />
          <p className="blink">APERTE PARA LIGAR O CONSOLE</p>
          <p className="at-sub">teclado, mouse ou controle · use fones</p>
        </div>
      )}

      {fase === 'menu' && (
        <div className="at-menu">
          <h1>
            {data.nome.split(' ')[0]}
            <span>{data.nome.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="at-menu-sub">CARTUCHO DE CURRÍCULO · {data.cargo.toUpperCase()}</p>

          <ul>
            {OPCOES.map((o, i) => (
              <li
                key={o.id}
                className={i === sel ? 'on' : ''}
                onMouseEnter={() => {
                  if (i !== sel) {
                    setSel(i)
                    sfxMenu()
                  }
                }}
                onClick={() => entrar(i)}
              >
                <i />
                {o.rotulo}
              </li>
            ))}
          </ul>

          <p className="at-menu-pe">SETAS ESCOLHEM · BOTÃO SELECIONA</p>
        </div>
      )}

      {fase === 'jogo' && <Jogo data={data} onSair={voltar} />}
      {fase === 'curriculo' && <Curriculo data={data} onSair={voltar} />}
      {fase === 'consoles' && <Consoles onSair={voltar} onSwitchEra={onSwitchEra} />}
    </div>
  )
}
