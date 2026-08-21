import { useCallback, useEffect, useState } from 'react'
import data from '../../data/curriculo.json'
import {
  carregarAmostra,
  initAudio,
  sfxCancel,
  sfxConfirm,
  sfxMove,
  startAmbience,
  stopAmbience,
} from '../../lib/audio.js'
import { useInput } from '../../lib/useInput.js'
import { PowerScreen, WarningScreen } from './Boot.jsx'
import Title from './Title.jsx'
import Door from './Door.jsx'
import Hud from './Hud.jsx'
import DocumentView from './DocumentView.jsx'
import FileTab from './tabs/FileTab.jsx'
import MapTab from './tabs/MapTab.jsx'
import SaveTab from './tabs/SaveTab.jsx'
import ExitTab from './tabs/ExitTab.jsx'
import './ps1.css'

export const TABS = [
  { id: 'file', label: 'FILE' },
  { id: 'map', label: 'MAP' },
  { id: 'save', label: 'SAVE' },
  { id: 'exit', label: 'EXIT' },
]

export default function Ps1({ onSwitchEra, audioReady, onAudioReady }) {
  const [phase, setPhase] = useState(audioReady ? 'warning' : 'power')
  const [tab, setTab] = useState('file')
  const [doc, setDoc] = useState(null)
  const [door, setDoor] = useState(null)

  useEffect(() => {
    carregarAmostra('re2-titulo', './re2-titulo.mp3')
  }, [])

  const throughDoor = useCallback((action) => {
    setDoor({ run: action })
  }, [])

  const onDoorFinish = useCallback(() => {
    setDoor((d) => {
      if (d) d.run()
      return null
    })
  }, [])

  const powerOn = useCallback(() => {
    initAudio()
    onAudioReady?.()
    carregarAmostra('re2-titulo', './re2-titulo.mp3')
    setPhase('warning')
  }, [onAudioReady])

  const startGame = useCallback(() => {
    stopAmbience()
    startAmbience('frio')
    throughDoor(() => {
      setTab('file')
      setPhase('game')
    })
  }, [throughDoor])

  const openDoc = useCallback((arquivo, withDoor = false) => {
    if (withDoor) throughDoor(() => setDoc(arquivo))
    else setDoc(arquivo)
  }, [throughDoor])

  const changeTab = useCallback(
    (dir) => {
      const i = TABS.findIndex((t) => t.id === tab)
      const next = TABS[(i + dir + TABS.length) % TABS.length]
      setTab(next.id)
      sfxMove()
    },
    [tab]
  )

  const navLocked = phase !== 'game' || !!doc || !!door

  useInput(
    {
      prevTab: () => changeTab(-1),
      nextTab: () => changeTab(1),
    },
    !navLocked
  )

  const tabActive = !navLocked

  return (
    <div className="ps1">
      {phase === 'power' && <PowerScreen onPower={powerOn} />}
      {phase === 'warning' && <WarningScreen onDone={() => setPhase('title')} />}
      {phase === 'title' && <Title data={data} onStart={startGame} />}

      {phase === 'game' && (
        <Hud
          data={data}
          tabs={TABS}
          tab={tab}
          onTab={(id) => {
            if (id !== tab) {
              setTab(id)
              sfxConfirm()
            }
          }}
        >
          {tab === 'file' && <FileTab data={data} active={tabActive} onOpen={(a) => openDoc(a)} />}
          {tab === 'map' && (
            <MapTab data={data} active={tabActive} onTravel={(a) => openDoc(a, true)} />
          )}
          {tab === 'save' && <SaveTab data={data} active={tabActive} />}
          {tab === 'exit' && <ExitTab active={tabActive} onSwitchEra={onSwitchEra} />}
        </Hud>
      )}

      {doc && (
        <DocumentView
          arquivo={doc}
          onClose={() => {
            sfxCancel()
            setDoc(null)
          }}
        />
      )}

      {door && <Door onFinish={onDoorFinish} />}
    </div>
  )
}
