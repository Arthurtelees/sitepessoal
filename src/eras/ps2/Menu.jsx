function Cursor() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0 14.6 9.2 12 12 9.4 9.2Z" />
      <path d="M12 24 9.4 14.8 12 12 14.6 14.8Z" />
      <path d="M0 12 9.2 9.4 12 12 9.2 14.6Z" />
      <path d="M24 12 14.8 14.6 12 12 14.8 9.4Z" />
    </svg>
  )
}

export default function Menu({ secoes, indice, modo, onIndice, onEntrar, children }) {
  return (
    <div className="sa">
      <img className="sa-capa" src="./sa-capa.webp" alt="" />
      <h1 className="sa-cabecalho">{modo === 'lista' ? 'Menu Principal' : secoes[indice].nome}</h1>

      {modo === 'lista' ? (
        <ul className="sa-lista">
          {secoes.map((s, i) => (
            <li key={s.id}>
              <button
                className={i === indice ? 'on' : ''}
                onMouseEnter={() => onIndice(i)}
                onClick={() => onEntrar(i)}
              >
                <span className="sa-rotulo">
                  <span className="sa-cursor">
                    <Cursor />
                  </span>
                  {s.nome}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="sa-secao">{children}</div>
      )}

      <p className="sa-hints">
        {modo === 'lista'
          ? 'SETAS NAVEGAR · ENTER SELECIONAR'
          : 'SETAS NAVEGAR · ENTER SELECIONAR · ESC VOLTAR'}
      </p>
    </div>
  )
}
