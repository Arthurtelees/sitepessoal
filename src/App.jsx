import { useCallback, useEffect, useState } from 'react'
import Atari from './eras/atari/Atari.jsx'
import Ps1 from './eras/ps1/Ps1.jsx'
import Ps2 from './eras/ps2/Ps2.jsx'
import Ps3 from './eras/ps3/Ps3.jsx'
import Canais from './selecao/Canais.jsx'
import { sfxAcende } from './selecao/audioTv.js'
import Inicio from './selecao/Inicio.jsx'
import data from './data/curriculo.json'
import Intro from './selecao/Intro.jsx'
import Cena from './cena/Cena.jsx'
import { ERAS_PRONTAS, temIntro } from './lib/consoles.js'


const VARREDURA = {
  atari: 'crt-forte',
  ps1: 'crt-forte',
  ps2: 'crt-soft',
}

function eraDoHash() {
  const alvo = window.location.hash.replace('#', '')
  return ERAS_PRONTAS.includes(alvo) ? alvo : null
}

export default function App() {
  const [janela, setJanela] = useState({ vw: 1280, vh: 720 })
  const [needsRotate, setNeedsRotate] = useState(false)
  const [canal, setCanal] = useState('inicio')
  const [era, setEra] = useState(eraDoHash)
  const [fase, setFase] = useState(() => {
    const alvo = eraDoHash()
    if (!alvo) return 'selecao'
    return 'sala'
  })
  const [audioReady, setAudioReady] = useState(false)

  useEffect(() => {
    const fit = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setJanela({ vw: w, vh: h })
      setNeedsRotate(h > w && w < 620)
    }
    fit()
    window.addEventListener('resize', fit)
    window.addEventListener('orientationchange', fit)
    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('orientationchange', fit)
    }
  }, [])

  useEffect(() => {
    const alvo = fase === 'selecao' || !era ? '' : `#${era}`
    if (window.location.hash === alvo) return
    window.history.replaceState(null, '', alvo || window.location.pathname + window.location.search)
  }, [fase, era])

  useEffect(() => {
    const aoTrocarHash = () => {
      const alvo = eraDoHash()
      setEra(alvo)
      setFase(!alvo ? 'selecao' : 'sala')
    }
    window.addEventListener('hashchange', aoTrocarHash)
    return () => window.removeEventListener('hashchange', aoTrocarHash)
  }, [])

  const onAudioReady = useCallback(() => setAudioReady(true), [])

  // só chega aqui por ação do usuário, então o áudio já está liberado e a intro pode tocar sozinha
  const abrirEra = useCallback((id) => {
    setAudioReady(true)
    if (id === 'inicio') {
      setEra(null)
      setCanal('inicio')
      setFase('selecao')
      return
    }
    setEra(id)
    // trocar de era por dentro tambem passa pela sala: ligar o console e a
    // unica porta de entrada, venha de onde vier
    setFase('sala')
  }, [])

  const entrarNaEra = useCallback(() => setFase('era'), [])

  const trocarCanal = useCallback((id) => setCanal(id), [])

  // o clique no console é o gesto que o navegador exige para liberar o áudio,
  // então a intro entra direto tocando com som: nunca pede um segundo clique
  const acender = useCallback((id) => {
    setAudioReady(true)
    setEra(id)
    sfxAcende(id === 'atari' || id === 'ps1' || id === 'ps2')
    setFase('ligando')
  }, [])

  useEffect(() => {
    if (fase !== 'ligando') return
    const tubo = era === 'atari' || era === 'ps1' || era === 'ps2'
    const t = setTimeout(() => setFase(temIntro(era) ? 'intro' : 'era'), tubo ? 1000 : 700)
    return () => clearTimeout(t)
  }, [fase, era])

  if (needsRotate) {
    return (
      <div className="rotate-prompt">
        <div className="phone" />
        <h2>VIRE O APARELHO</h2>
        <p>
          Este currículo roda em 4:3, do jeito que a televisão da época mandava.
          <br />
          <br />
          Com pressa?{' '}
          <a href="./arthur_teles_curriculo.pdf" download>
            baixe o PDF
          </a>
          .
        </p>
      </div>
    )
  }

  const eraProps = { onSwitchEra: abrirEra, audioReady, onAudioReady }
  const ambiente = fase === 'selecao' ? canal : era || 'inicio'
  const varredura = VARREDURA[ambiente] || 'crt-off'

  return (
    <Cena
      ambiente={ambiente}
      vw={janela.vw}
      vh={janela.vh}
      ligando={fase === 'ligando'}
      aoLigar={
        fase === 'sala'
          ? () => acender(era)
          : fase === 'selecao' && canal !== 'inicio'
            ? () => acender(canal)
            : undefined
      }
      sobre={
        fase === 'selecao' ? (
          <Canais canal={canal} naInicio={canal === 'inicio'} onTrocar={trocarCanal} />
        ) : null
      }
    >
      {fase === 'selecao' && canal === 'inicio' && (
        <Inicio data={data} onComecar={() => setCanal('atari')} onTrocar={setCanal} />
      )}

      {fase === 'intro' && era && (
        <Intro
          key={era}
          videos={[era]}
          audioReady={audioReady}
          pular={era !== 'ps3'}
          preencher={era === 'ps3'}
          onGesto={onAudioReady}
          onFim={entrarNaEra}
        />
      )}

      {fase === 'era' && era === 'atari' && <Atari {...eraProps} />}
      {fase === 'era' && era === 'ps1' && <Ps1 {...eraProps} />}
      {fase === 'era' && era === 'ps2' && <Ps2 {...eraProps} />}
      {fase === 'era' && era === 'ps3' && <Ps3 {...eraProps} />}

      {fase !== 'sala' && (
        <div className={`crt ${varredura}`}>
          <div className="crt-flicker" />
        </div>
      )}
    </Cena>
  )
}
