import { useCallback, useEffect, useState } from 'react'
import data from '../../data/curriculo.json'
import {
  carregarAmostra,
  initAudio,
  sfxSaBack,
  sfxSaConfirm,
  sfxSaMove,
  startAmbience,
  stopAmbience,
} from '../../lib/audio.js'
import { clampIndex, useInput } from '../../lib/useInput.js'
import Ps2Power from './Ps2Power.jsx'
import Intro from '../../selecao/Intro.jsx'
import Menu from './Menu.jsx'
import StatsTab from './tabs/StatsTab.jsx'
import BriefTab from './tabs/BriefTab.jsx'
import TerritoryTab from './tabs/TerritoryTab.jsx'
import SaveTab from './tabs/SaveTab.jsx'
import QuitTab from './tabs/QuitTab.jsx'
import './ps2.css'

const INTROS_SA = ['sa-logo', 'sa-titulos']

const SECOES = [
  { id: 'stats', nome: 'Estatísticas' },
  { id: 'brief', nome: 'Missões' },
  { id: 'map', nome: 'Territórios' },
  { id: 'save', nome: 'Salvar' },
  { id: 'quit', nome: 'Consoles' },
]

export default function Ps2({ onSwitchEra, audioReady, onAudioReady }) {
  const [phase, setPhase] = useState(audioReady ? 'sa' : 'power')
  const [indice, setIndice] = useState(0)
  const [modo, setModo] = useState('lista')

  useEffect(() => {
    carregarAmostra('sa-menu', './sa-menu.wav')
  }, [])

  const powerOn = useCallback(() => {
    initAudio()
    onAudioReady?.()
    carregarAmostra('sa-menu', './sa-menu.wav')
    setPhase('sa')
  }, [onAudioReady])

  const entrarNoMenu = useCallback(() => {
    stopAmbience()
    startAmbience('quente')
    setPhase('menu')
  }, [])

  const mover = (d) => {
    const n = clampIndex(indice + d, SECOES.length)
    if (n === indice) return
    sfxSaMove()
    setIndice(n)
  }

  const entrar = (i = indice) => {
    setIndice(i)
    sfxSaConfirm()
    setModo('secao')
  }

  const voltar = () => {
    sfxSaBack()
    setModo('lista')
  }

  const naLista = phase === 'menu' && modo === 'lista'
  const naSecao = phase === 'menu' && modo === 'secao'

  useInput(
    { up: () => mover(-1), down: () => mover(1), confirm: () => entrar() },
    naLista
  )

  useInput({ cancel: voltar }, naSecao)

  const secao = SECOES[indice]

  return (
    <div className="ps2">
      {phase === 'power' && <Ps2Power onPower={powerOn} />}
      {phase === 'sa' && <Intro videos={INTROS_SA} audioReady onFim={entrarNoMenu} />}

      {phase === 'menu' && (
        <Menu
          secoes={SECOES}
          indice={indice}
          modo={modo}
          onIndice={(i) => {
            if (i !== indice) {
              setIndice(i)
              sfxSaMove()
            }
          }}
          onEntrar={entrar}
        >
          {secao.id === 'stats' && <StatsTab data={data} active={naSecao} />}
          {secao.id === 'brief' && <BriefTab data={data} active={naSecao} />}
          {secao.id === 'map' && <TerritoryTab data={data} active={naSecao} />}
          {secao.id === 'save' && <SaveTab data={data} active={naSecao} />}
          {secao.id === 'quit' && <QuitTab active={naSecao} onSwitchEra={onSwitchEra} />}
        </Menu>
      )}
    </div>
  )
}
