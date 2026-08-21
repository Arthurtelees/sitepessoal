import { useInput } from '../../lib/useInput.js'

export default function Ps2Power({ onPower }) {
  useInput({ confirm: onPower, cancel: onPower, up: onPower, down: onPower })

  return (
    <div className="ps2-power" onClick={onPower} role="button" tabIndex={0}>
      <div className="ps2-led" />
      <p className="ps2-power-text blink">PRESSIONE QUALQUER TECLA PARA LIGAR</p>
      <p className="ps2-power-sub">teclado, mouse ou controle · use fones</p>
    </div>
  )
}
