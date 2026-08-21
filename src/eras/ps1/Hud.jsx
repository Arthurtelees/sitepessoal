import { useEffect, useState } from 'react'
import Ekg from './Ekg.jsx'
import Retrato from './Retrato.jsx'

function useCareerClock(startIso) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const i = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(i)
  }, [])

  const start = new Date(startIso)
  const now = new Date()
  const months = Math.max(
    0,
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  )
  const base = months * 160 * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const total = base + elapsed
  const hh = Math.floor(total / 3600)
  const mm = Math.floor((total % 3600) / 60)
  const ss = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`
}

export default function Hud({ data, tabs, tab, onTab, children }) {
  const time = useCareerClock(data.carreiraInicio)

  return (
    <div className="hud fade-in">
      <header className="hud-bar">
        <span className="hud-name">{data.nome.toUpperCase()}</span>
        <span className="hud-time">
          TIME <b>{time}</b>
        </span>
      </header>

      <div className="hud-body">
        <aside className="hud-status">
          <div className="portrait">
            <Retrato />
            <div className="portrait-lines" />
          </div>

          <p className="status-role">{data.cargo.toUpperCase()}</p>

          <div className="condition">
            <span>CONDITION</span>
            <strong className="cond-fine">FINE</strong>
          </div>
          <Ekg />

          <ul className="langs">
            {data.idiomas.map((l) => (
              <li key={l.nome}>
                <span className={`dot ${l.status}`} />
                {l.nome}
                <em>{l.nivel}</em>
              </li>
            ))}
          </ul>

          <p className="status-loc">{data.local.toUpperCase()}</p>
        </aside>

        <section className="hud-main">{children}</section>
      </div>

      <footer className="hud-foot">
        <nav className="tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab ${t.id === tab ? 'on' : ''}`}
              onClick={() => onTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <p className="hints">SETAS MOVER · ENTER CONFIRMAR · ESC VOLTAR · Q/E TROCAR ABA</p>
      </footer>
    </div>
  )
}
