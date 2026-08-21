import { useEffect, useRef } from 'react'
import { sfxDoor } from '../../lib/audio.js'
import { useInput } from '../../lib/useInput.js'

const DURATION = 2200

export default function Door({ onFinish }) {
  const played = useRef(false)

  useEffect(() => {
    if (!played.current) {
      played.current = true
      sfxDoor()
    }
    const t = setTimeout(onFinish, DURATION)
    return () => clearTimeout(t)
  }, [onFinish])

  useInput({ confirm: onFinish, cancel: onFinish })

  return (
    <div className="door-scene" onClick={onFinish}>
      <div className="door-world">
        <div className="door-frame">
          <div className="door-hinge">
            <div className="door-panel">
              <span className="door-inset top" />
              <span className="door-inset bottom" />
              <span className="door-knob" />
            </div>
          </div>
          <div className="door-void" />
        </div>
      </div>
      <div className="door-blackout" />
      <p className="door-skip">pular ▸</p>
    </div>
  )
}
