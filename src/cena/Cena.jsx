import { useEffect, useState } from 'react'
import { FOTO_DO_AMBIENTE, PALCO_PADRAO, SALAS, geometria } from './salas.js'
import Ligar from './Ligar.jsx'
import './cena.css'

const AMBIENTES = {
  inicio: 'neutro',
  atari: 'anos70',
  ps1: 'anos90',
  ps2: 'anos2000',
  ps3: 'neutro',
  ps4: 'neutro',
  ps5: 'neutro',
}

function Anos70() {
  return (
    <>
      <div className="sala-esq">
        <div className="obj antena">
          <span className="antena-base" />
          <span className="antena-haste esq" />
          <span className="antena-haste dir" />
        </div>
        <div className="obj lampada">
          <span className="lampada-cupula" />
          <span className="lampada-haste" />
          <span className="lampada-pe" />
        </div>
      </div>
      <div className="sala-dir">
        <div className="obj console-atari">
          <span className="atari-corpo">
            <span className="atari-madeira" />
            <span className="atari-chaves" />
          </span>
          <span className="atari-joystick">
            <span className="joy-manete" />
          </span>
        </div>
        <div className="obj cartuchos">
          <span />
          <span />
          <span />
        </div>
        <div className="obj quadro na-parede" style={{ left: '150px' }} />
      </div>
    </>
  )
}

function Anos90() {
  return (
    <>
      <div className="sala-esq">
        <div className="obj fitas">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="obj caixas-jewel">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="obj quadro na-parede" style={{ right: '30px' }} />
      </div>
      <div className="sala-dir">
        <div className="obj console-ps1">
          <span className="ps1-corpo">
            <span className="ps1-tampa" />
            <span className="ps1-botoes" />
          </span>
          <span className="ps1-controle">
            <span className="ctrl-punho esq" />
            <span className="ctrl-punho dir" />
          </span>
          <span className="ps1-cabo" />
        </div>
      </div>
    </>
  )
}

function Anos2000() {
  return (
    <>
      <div className="sala-esq">
        <div className="obj lombadas">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="obj caixa-som">
          <span className="som-cone grande" />
          <span className="som-cone pequeno" />
        </div>
        <div className="obj quadro na-parede" style={{ right: '34px' }} />
      </div>
      <div className="sala-dir">
        <div className="obj console-ps2">
          <span className="ps2-corpo">
            <span className="ps2-bandeja" />
            <span className="ps2-led" />
          </span>
          <span className="ps2-controle">
            <span className="ctrl-punho esq" />
            <span className="ctrl-punho dir" />
          </span>
        </div>
      </div>
    </>
  )
}

function Neutro() {
  return (
    <>
      <div className="sala-esq">
        <div className="obj lombadas neutras">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="obj quadro na-parede" style={{ right: '28px' }} />
      </div>
      <div className="sala-dir">
        <div className="obj controle-solto">
          <span className="ctrl-punho esq" />
          <span className="ctrl-punho dir" />
        </div>
        <div className="obj caneca">
          <span className="caneca-corpo" />
          <span className="caneca-asa" />
          <span className="caneca-vapor" />
        </div>
      </div>
    </>
  )
}

const CENARIOS = {
  anos70: Anos70,
  anos90: Anos90,
  anos2000: Anos2000,
  neutro: Neutro,
}

const SALA_W = 1060
const SALA_H = 596
const SET_W = 684
const SET_H = 526

function geoDesenhada(vw, vh, alvo, comSala) {
  const [cw, ch] = comSala ? [SALA_W, SALA_H] : [SET_W, SET_H]
  const [gx, gy] = comSala ? [184, 30] : [22, 16]
  const scale = Math.min(Math.min(vw / cw, vh / ch), (alvo * vh) / 480)
  const left = (vw - cw * scale) / 2
  const top = (vh - ch * scale) / 2
  return {
    scale,
    tela: { left: left + gx * scale, top: top + gy * scale, w: 640 * scale, h: 480 * scale },
    raio: (comSala ? 26 : 18) * scale,
    palco: PALCO_PADRAO,
    escala: scale,
  }
}

function geoSimples(vw, vh, alvo, palco) {
  const h = alvo * vh
  const w = (h * palco.w) / palco.h
  return {
    scale: h / palco.h,
    tela: { left: (vw - w) / 2, top: (vh - h) / 2, w, h },
    raio: 6,
    palco,
    escala: h / palco.h,
  }
}

function CamadasSimples() {
  return (
    <div className="desenho liso" aria-hidden="true">
      <div className="parede">
        <span className="parede-luz" />
      </div>
    </div>
  )
}

function CamadasFoto({ sala, g }) {
  const mascara = `radial-gradient(ellipse ${g.mascara.rx}px ${g.mascara.ry}px at ${g.mascara.x}px ${g.mascara.y}px, #000 56%, transparent 100%)`
  const fundo = { backgroundImage: `url(${sala.src})` }
  return (
    <div
      className="foto-quadro"
      style={{ left: g.foto.left, top: g.foto.top, width: g.foto.w, height: g.foto.h }}
      aria-hidden="true"
    >
      <div
        className="foto-fundo"
        style={{ ...fundo, filter: `blur(${(sala.borrao * g.zoom).toFixed(2)}px) brightness(0.86) saturate(0.94)` }}
      />
      <div className="foto-nitida" style={{ ...fundo, maskImage: mascara, WebkitMaskImage: mascara }} />
    </div>
  )
}

function CamadasDesenhadas({ amb, scale }) {
  const Cenario = CENARIOS[amb]
  return (
    <div className="desenho" aria-hidden="true">
      <div className="parede">
        <span className="parede-luz" />
        <span className="parede-rodape" />
      </div>

      <div className="cena" style={{ '--scale': scale }}>
        <div className="movel">
          <span className="movel-tampo" />
          <span className="movel-frente" />
        </div>

        <div className="sala">
          <Cenario />
        </div>

        <div className="tvset">
          <div className="tvset-caixa" />
          <div className="tvset-vidro" />
          <div className="tvset-frente">
            <span className="tvset-placa" />
            <span className="tvset-led" />
          </div>
          <div className="tvset-lateral">
            <span className="tvset-grade" />
            <span className="tvset-knob grande" />
            <span className="tvset-knob pequeno" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Cena({ ambiente = 'inicio', vw = 1280, vh = 720, aoLigar, ligando, sobre, children }) {
  const [quebradas, setQuebradas] = useState({})
  const amb = AMBIENTES[ambiente] || 'neutro'
  const chave = FOTO_DO_AMBIENTE[ambiente]
  const sala = quebradas[chave] ? null : SALAS[chave]

  useEffect(() => {
    if (!sala) return
    const img = new Image()
    img.onerror = () => setQuebradas((q) => ({ ...q, [chave]: true }))
    img.src = sala.src
  }, [chave, sala])

  const comSala = vw >= 1100 && vh >= 620
  const alvo = comSala ? 0.5 : 0.86
  const largo = SALAS[chave] && SALAS[chave].palco.w !== PALCO_PADRAO.w
  const g = sala
    ? geometria(sala, vw, vh, alvo)
    : largo
      ? geoSimples(vw, vh, alvo, SALAS[chave].palco)
      : geoDesenhada(vw, vh, alvo, comSala)

  return (
    <div
      className={`viewport amb-${amb} modo-${comSala ? 'sala' : 'set'} ${sala ? 'com-foto' : ''} ${
        aoLigar ? 'apagada' : ''
      } ${ligando ? 'acendendo' : ''}`}
    >
      {sala ? (
        <CamadasFoto key={chave} sala={sala} g={g} />
      ) : largo ? (
        <CamadasSimples key="liso" />
      ) : (
        <CamadasDesenhadas key={amb} amb={amb} scale={g.scale} />
      )}

      <div
        className={`tela ${g.plana ? 'plana' : ''}`}
        style={{
          left: g.tela.left,
          top: g.tela.top,
          width: g.tela.w,
          height: g.tela.h,
          borderRadius: `${g.raio}px`,
        }}
      >
        <div
          className="stage"
          style={{ '--stage-scale': g.escala, width: g.palco.w, height: g.palco.h }}
        >
          {children}
        </div>
        {ligando && <span className="acende-luz" aria-hidden="true" />}
        <span className="tela-brilho" aria-hidden="true" />
      </div>

      {aoLigar && <Ligar caixa={g.botao} vw={vw} onLigar={aoLigar} />}

      {sobre}

      <a className="plain-link" href="./arthur_teles_curriculo.pdf" download>
        currículo em pdf
      </a>
    </div>
  )
}
