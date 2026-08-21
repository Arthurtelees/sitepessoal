import { useCallback, useEffect, useRef, useState } from 'react'
import { initAudio, sfxCancel, sfxConfirm, sfxMove } from '../lib/audio.js'
import { useInput } from '../lib/useInput.js'

const LIMITE_SEM_METADADO = 15000

const OPCOES = [
  { id: 'nao', label: 'CONTINUAR ASSISTINDO' },
  { id: 'sim', label: 'PULAR' },
]

export default function Intro({ videos, audioReady, pular = true, preencher = false, onGesto, onFim }) {
  const ref = useRef(null)
  const [i, setI] = useState(0)
  const [limite, setLimite] = useState(LIMITE_SEM_METADADO)
  const [precisaGesto, setPrecisaGesto] = useState(!audioReady)
  const [confirmando, setConfirmando] = useState(false)
  const [opcao, setOpcao] = useState(0)
  const encerrado = useRef(false)

  const terminar = useCallback(() => {
    if (encerrado.current) return
    encerrado.current = true
    onFim()
  }, [onFim])

  const proximo = useCallback(() => {
    if (i + 1 >= videos.length) terminar()
    else setI(i + 1)
  }, [i, videos.length, terminar])

  const iniciar = () => {
    initAudio()
    onGesto?.()
    setPrecisaGesto(false)
  }

  const pedirParaPular = () => {
    if (!pular) return
    ref.current?.pause()
    setOpcao(0)
    setConfirmando(true)
    sfxConfirm()
  }

  const voltarAoVideo = () => {
    setConfirmando(false)
    sfxCancel()
    ref.current?.play().catch(() => {})
  }

  const escolherOpcao = (k = opcao) => {
    if (OPCOES[k].id === 'sim') {
      sfxConfirm()
      terminar()
    } else {
      voltarAoVideo()
    }
  }

  useEffect(() => {
    setLimite(LIMITE_SEM_METADADO)
  }, [i])

  useEffect(() => {
    if (precisaGesto) return
    const v = ref.current
    if (!v) return
    let vivo = true
    v.play().catch(() => {
      if (!vivo) return
      v.muted = true
      v.play().catch(proximo)
    })
    return () => {
      vivo = false
    }
  }, [precisaGesto, i, proximo])

  useEffect(() => {
    if (precisaGesto || confirmando) return
    const t = setTimeout(proximo, limite)
    return () => clearTimeout(t)
  }, [precisaGesto, confirmando, i, limite, proximo])

  useInput({ confirm: iniciar, cancel: iniciar }, precisaGesto)

  useInput(
    { confirm: pedirParaPular, cancel: pedirParaPular },
    pular && !precisaGesto && !confirmando
  )

  useInput(
    {
      left: () => {
        if (opcao !== 0) sfxMove()
        setOpcao(0)
      },
      right: () => {
        if (opcao !== 1) sfxMove()
        setOpcao(1)
      },
      up: () => {
        if (opcao !== 0) sfxMove()
        setOpcao(0)
      },
      down: () => {
        if (opcao !== 1) sfxMove()
        setOpcao(1)
      },
      confirm: () => escolherOpcao(),
      cancel: voltarAoVideo,
    },
    confirmando
  )

  const aoCarregarMetadado = (e) => {
    const d = e.currentTarget.duration
    if (Number.isFinite(d) && d > 0) setLimite(d * 1000 + 6000)
  }

  const nome = videos[i]

  return (
    <div
      className="intro"
      onClick={precisaGesto ? iniciar : confirmando || !pular ? undefined : pedirParaPular}
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        key={nome}
        ref={ref}
        className={`intro-video ${preencher ? 'preenche' : ''}`}
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
        onLoadedMetadata={aoCarregarMetadado}
        onEnded={proximo}
        onError={proximo}
      >
        <source src={`./intro-${nome}.webm`} type="video/webm" />
        <source src={`./intro-${nome}.mp4`} type="video/mp4" />
      </video>

      {precisaGesto && (
        <div className="intro-gesto">
          <span className="intro-play" />
          <p className="blink">CLIQUE PARA LIGAR O CONSOLE</p>
        </div>
      )}

      {!precisaGesto && !confirmando && (
        <p className="intro-skip">
          {pular ? 'ENTER OU CLIQUE PARA PULAR' : 'INICIANDO O SISTEMA'}
        </p>
      )}

      {confirmando && (
        <div
          className="intro-confirma"
          onClick={(e) => {
            e.stopPropagation()
            voltarAoVideo()
          }}
        >
          <div className="intro-caixa" onClick={(e) => e.stopPropagation()}>
            <p className="intro-pergunta">Pular a introdução?</p>
            <div className="intro-opcoes">
              {OPCOES.map((o, k) => (
                <button
                  key={o.id}
                  className={`${k === opcao ? 'on' : ''} ${o.id}`}
                  onMouseEnter={() => {
                    if (k !== opcao) {
                      setOpcao(k)
                      sfxMove()
                    }
                  }}
                  onClick={() => escolherOpcao(k)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
