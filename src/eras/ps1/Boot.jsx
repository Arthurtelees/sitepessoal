import { useEffect } from 'react'
import { useInput } from '../../lib/useInput.js'

export function PowerScreen({ onPower }) {
  useInput({ confirm: onPower, cancel: onPower, up: onPower, down: onPower })

  return (
    <div className="scr scr-power" onClick={onPower} role="button" tabIndex={0}>
      <div className="power-led" />
      <p className="power-text blink">PRESSIONE QUALQUER TECLA PARA LIGAR</p>
      <p className="power-sub">teclado, mouse ou controle · use fones</p>
    </div>
  )
}

export function WarningScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 6000)
    return () => clearTimeout(t)
  }, [onDone])

  useInput({ confirm: onDone, cancel: onDone })

  return (
    <div className="scr scr-warning fade-in" onClick={onDone}>
      <h2>AVISO</h2>
      <p>
        Este currículo contém cenas explícitas de código legado, integrações com sistemas que
        ninguém documentou e pelo menos uma resolução de conflito em produção numa sexta-feira.
      </p>
      <p>Recomendado para recrutadores de todas as idades.</p>
      <span className="warning-skip blink">▼</span>
    </div>
  )
}
