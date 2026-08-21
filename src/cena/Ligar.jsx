import { useEffect, useState } from 'react'

const ESPERA = 10000

// só o clique de mouse/toque no console liga: nada de teclado ou gamepad,
// nem foco de Tab chegando aqui, porque um <button> focado dispara com
// Enter/Espaço mesmo sem useInput algum ligado.
export default function Ligar({ caixa, vw, onLigar }) {
  const [dica, setDica] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDica(true), ESPERA)
    return () => clearTimeout(t)
  }, [])

  if (!caixa) {
    return (
      <div className="ligar-reserva" role="button" tabIndex={-1} onClick={onLigar}>
        clique aqui para iniciar o console
      </div>
    )
  }

  const centro = Math.min(Math.max(caixa.left + caixa.w / 2, 170), vw - 170)

  return (
    <>
      <div className="ligar-fora" onClick={() => setDica(true)} aria-hidden="true" />

      <div
        className="ligar"
        role="button"
        tabIndex={-1}
        style={{ left: caixa.left, top: caixa.top, width: caixa.w, height: caixa.h }}
        onClick={onLigar}
        aria-label="Clique aqui para iniciar o console"
      >
        <span className="ligar-luz" aria-hidden="true" />
      </div>

      {dica && (
        <div
          className="ligar-dica"
          style={{ left: centro, top: caixa.top - 16 }}
          onClick={onLigar}
        >
          <p>
            clique aqui para iniciar
            <b>o console</b>
          </p>
          <span className="ligar-seta" aria-hidden="true" />
        </div>
      )}
    </>
  )
}
