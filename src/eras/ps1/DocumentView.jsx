import { useEffect, useRef, useState } from 'react'
import { sfxConfirm, sfxMove, sfxType } from '../../lib/audio.js'
import { useInput } from '../../lib/useInput.js'

const CPS = 95

export default function DocumentView({ arquivo, onClose }) {
  const [page, setPage] = useState(0)
  const [shown, setShown] = useState(0)
  const timer = useRef(null)

  const paginas = arquivo.paginas || []
  const texto = paginas[page] || ''
  const done = shown >= texto.length
  const last = page >= paginas.length - 1

  useEffect(() => {
    setShown(0)
  }, [page, arquivo])

  useEffect(() => {
    if (shown >= texto.length) return
    timer.current = setTimeout(() => {
      const next = Math.min(texto.length, shown + 2)
      if (next % 6 === 0) sfxType()
      setShown(next)
    }, 2000 / CPS)
    return () => clearTimeout(timer.current)
  }, [shown, texto])

  const advance = () => {
    if (!done) {
      setShown(texto.length)
      return
    }
    if (!last) {
      sfxMove()
      setPage((p) => p + 1)
      return
    }
    sfxConfirm()
    onClose()
  }

  useInput({
    confirm: advance,
    down: advance,
    right: advance,
    cancel: onClose,
    left: () => {
      if (page > 0) {
        sfxMove()
        setPage((p) => p - 1)
      }
    },
  })

  return (
    <div className="doc-overlay" onClick={advance}>
      <article className="doc-sheet">
        <div className="doc-stain" />
        <h3 className="doc-title">{arquivo.titulo}</h3>
        {arquivo.cabecalho && <p className="doc-head">{arquivo.cabecalho}</p>}

        <div className="doc-body">
          {texto.slice(0, shown)}
          {!done && <span className="doc-caret">▌</span>}
        </div>

        {done && arquivo.destaque && last && (
          <p className="doc-destaque fade-in">{arquivo.destaque}</p>
        )}

        <footer className="doc-foot">
          <span className="doc-page">
            {page + 1} / {paginas.length}
          </span>
          {done && (
            <span className="doc-next blink">{last ? '■ FECHAR' : '▼ CONTINUAR'}</span>
          )}
        </footer>
      </article>
    </div>
  )
}
