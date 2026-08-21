import { useEffect, useRef, useState } from 'react'
import { initAudio } from '../lib/audio.js'
import { useInput } from '../lib/useInput.js'
import { CONSOLES } from '../lib/consoles.js'
import { sfxCorteHoje, sfxLigaHoje, sfxRescan } from './audioTv.js'
import './selecao.css'

const INICIO = { id: 'inicio', nome: 'INÍCIO DE TRANSMISSÃO', skin: 'a casa', pronto: true }

const CORES = {
  inicio: '#5ad0e6',
  atari: '#d4832c',
  ps1: '#46d95a',
  ps2: '#ffc24d',
  ps3: '#dcdcdc',
}

export const CANAIS = [INICIO, ...CONSOLES]

const TROCA_MS = 320

export default function Canais({ canal, naInicio, onTrocar, teclado = true, apenasFaixa = false }) {
  const [trocando, setTrocando] = useState(false)
  const [surgiu, setSurgiu] = useState(false)
  const temporizador = useRef(null)

  useEffect(() => {
    sfxLigaHoje()
    const t = setTimeout(() => setSurgiu(true), 700)
    return () => {
      clearTimeout(t)
      clearTimeout(temporizador.current)
    }
  }, [])

  const irPara = (n) => {
    initAudio()
    const destino = CANAIS[n]
    if (!destino || destino.id === canal) return
    if (destino.id === 'inicio') sfxCorteHoje()
    else sfxRescan()
    setTrocando(true)
    onTrocar(destino.id)
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setTrocando(false), TROCA_MS)
  }

  const i = CANAIS.findIndex((x) => x.id === canal)
  const c = CANAIS[i] || CANAIS[0]
  const mover = (d) => irPara((i + d + CANAIS.length) % CANAIS.length)

  useInput(
    {
      left: naInicio ? undefined : () => mover(-1),
      right: naInicio ? undefined : () => mover(1),
      up: () => mover(-1),
      down: () => mover(1),
      prevTab: () => mover(-1),
      nextTab: () => mover(1),
    },
    teclado,
  )

  return (
    <div
      className={`canais epoca-${canal} ${trocando ? 'trocando' : ''} ${surgiu ? 'surgiu' : ''}`}
      style={{ '--cor': CORES[canal] || '#dfe8ef' }}
    >
      {!apenasFaixa && !naInicio && (
        <div className="canais-placa">
          <span className="canais-num">CH {String(i).padStart(2, '0')}</span>
          <b>{c.nome}</b>
          <em>
            {c.ano} · {c.skin}
          </em>
        </div>
      )}

      {(apenasFaixa || !naInicio) && (
        <ul className="canais-faixa">
          {CANAIS.map((x, k) => (
            <li key={x.id}>
              <button
                className={`num-${x.id} ${k === i ? 'on' : ''}`}
                onClick={() => irPara(k)}
                aria-label={x.nome}
              >
                {String(k).padStart(2, '0')}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!apenasFaixa && (
        <p className="canais-dica">
          {naInicio
            ? '←→ escolhe · Enter abre · ↑↓ troca de canal'
            : '↑↓ ←→ trocam de sala · clique no console para ligar'}
        </p>
      )}
    </div>
  )
}
