import { useEffect, useRef } from 'react'

const KEY_MAP = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  Enter: 'confirm',
  NumpadEnter: 'confirm',
  Space: 'confirm',
  KeyZ: 'confirm',
  Escape: 'cancel',
  Backspace: 'cancel',
  KeyX: 'cancel',
  KeyQ: 'prevTab',
  KeyE: 'nextTab',
}

export function useInput(handlers, active = true) {
  const ref = useRef(handlers)
  ref.current = handlers

  useEffect(() => {
    if (!active) return
    const onKey = (e) => {
      if (e.repeat && (e.code === 'Enter' || e.code === 'Space')) return
      let action = KEY_MAP[e.code]
      if (e.code === 'Tab') action = e.shiftKey ? 'prevTab' : 'nextTab'
      if (!action) return
      const fn = ref.current[action]
      if (!fn) return
      e.preventDefault()
      fn(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  useEffect(() => {
    if (!active || !navigator.getGamepads) return
    let raf
    const prev = {}
    const AXIS_DEAD = 0.55
    const BUTTONS = { 0: 'confirm', 1: 'cancel', 12: 'up', 13: 'down', 14: 'left', 15: 'right', 4: 'prevTab', 5: 'nextTab' }

    const fire = (action) => {
      const fn = ref.current[action]
      if (fn) fn()
    }

    const poll = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : []
      for (const pad of pads) {
        if (!pad) continue
        for (const [idx, action] of Object.entries(BUTTONS)) {
          const pressed = !!(pad.buttons[idx] && pad.buttons[idx].pressed)
          const key = `${pad.index}:${idx}`
          if (pressed && !prev[key]) fire(action)
          prev[key] = pressed
        }
        const [ax = 0, ay = 0] = pad.axes
        const dirs = [
          ['axL', ax < -AXIS_DEAD, 'left'],
          ['axR', ax > AXIS_DEAD, 'right'],
          ['axU', ay < -AXIS_DEAD, 'up'],
          ['axD', ay > AXIS_DEAD, 'down'],
        ]
        for (const [name, on, action] of dirs) {
          const key = `${pad.index}:${name}`
          if (on && !prev[key]) fire(action)
          prev[key] = on
        }
      }
      raf = requestAnimationFrame(poll)
    }
    raf = requestAnimationFrame(poll)
    return () => cancelAnimationFrame(raf)
  }, [active])
}

export function clampIndex(i, len) {
  if (len <= 0) return 0
  return Math.max(0, Math.min(len - 1, i))
}
