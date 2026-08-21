import { useCallback, useState } from 'react'
import data from '../../data/curriculo.json'
import { initAudio } from '../../lib/audio.js'
import { useInput } from '../../lib/useInput.js'
import Xmb from './Xmb.jsx'
import './ps3.css'

function TelaPower({ onLigar }) {
  useInput({ confirm: onLigar, cancel: onLigar, up: onLigar, down: onLigar })

  return (
    <div className="ps3-power" onClick={onLigar} role="button" tabIndex={0}>
      <span className="ps3-power-led" />
      <p className="blink">PRESSIONE QUALQUER TECLA PARA LIGAR</p>
      <span>teclado, mouse ou controle · use fones</span>
    </div>
  )
}

export default function Ps3({ onSwitchEra, audioReady, onAudioReady }) {
  const [fase, setFase] = useState(audioReady ? 'xmb' : 'power')

  const ligar = useCallback(() => {
    initAudio()
    onAudioReady?.()
    setFase('xmb')
  }, [onAudioReady])

  return (
    <div className="ps3">
      {fase === 'power' && <TelaPower onLigar={ligar} />}
      {fase === 'xmb' && <Xmb data={data} onSwitchEra={onSwitchEra} />}
    </div>
  )
}
