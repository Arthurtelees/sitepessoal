import { useEffect, useMemo, useRef, useState } from 'react'
import {
  sfxLinha,
  sfxParede,
  sfxPerdeu,
  sfxPoder,
  sfxRaquete,
  sfxTijolo,
  sfxVitoria,
} from './audioAtari.js'

const E = 4
const LARG = 160
const ALT = 120
const TOPO = 16
const PAREDE = 4

const RAQ_Y = 108
const RAQ_H = 3
const RAQ_W = 16
const RAQ_LARGA = 30
const BOLA = 3

const COLS = 12
const TW = 12
const TH = 5
const MX = 8
const MY = 22
const GAP = 1

const V_INICIAL = 76
const V_MAX = 138
const V_GANHO = 1.1

const CORES = ['#d0463a', '#d4832c', '#cfc23a', '#4f9e46', '#4a7ad4']
const CORES_FRACAS = ['#7d2a22', '#7f4e1a', '#7a7320', '#2e5e29', '#2c4a80']
const PONTOS = [5, 4, 3, 2, 1]
const RESISTENTES = 2

const PADRAO = [
  '111111111111',
  '110111111011',
  '111011110111',
  '111111111111',
  '011110011110',
]

const PODERES = {
  '1:5': 'triplo',
  '3:2': 'larga',
  '2:9': 'lenta',
}

const ROTULO_PODER = {
  triplo: 'BOLA TRIPLA',
  larga: 'RAQUETE LARGA',
  lenta: 'BOLA LENTA',
}

function criarTijolos(linhas) {
  const t = []
  for (let l = 0; l < linhas; l++) {
    const padrao = PADRAO[l % PADRAO.length]
    for (let c = 0; c < COLS; c++) {
      if (padrao[c] !== '1') continue
      t.push({
        l,
        x: MX + c * TW,
        y: MY + l * (TH + GAP),
        w: TW - 1,
        h: TH,
        hp: l < RESISTENTES ? 2 : 1,
        vivo: true,
        poder: PODERES[`${l}:${c}`] || null,
      })
    }
  }
  return t
}

function bolaNova(x, y, ang, v) {
  return { x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v }
}

function novoEstado(linhas) {
  return {
    fase: 'aviso',
    pontos: 0,
    vidas: 3,
    feitas: [],
    raquete: (LARG - RAQ_W) / 2,
    largura: RAQ_W,
    bolas: [],
    tijolos: criarTijolos(linhas),
    velocidade: V_INICIAL,
    particulas: [],
    efeitos: { larga: 0, lenta: 0 },
    grito: null,
    gritoT: 0,
    tempo: 0,
  }
}

export default function Jogo({ data, onSair }) {
  const tela = useRef(null)
  const sim = useRef(null)
  const teclas = useRef({ esq: false, dir: false, fogo: false, trava: false, sair: false })
  const [ui, setUi] = useState({ fase: 'aviso', pontos: 0, vidas: 3, feitas: [], bolas: 0 })
  const [cartao, setCartao] = useState(null)

  const entradas = useMemo(
    () => [
      ...data.experiencia.map((e) => ({
        id: e.id,
        titulo: e.empresa,
        sub: `${e.cargo} · ${e.periodo}`,
        premio: e.missao.recompensa,
      })),
      ...data.formacao.map((f) => ({
        id: f.id,
        titulo: f.instituicao,
        sub: `${f.curso} · ${f.periodo}`,
        premio: f.missao.recompensa,
      })),
    ],
    [data]
  )

  const palavras = useMemo(() => data.itens.map((i) => i.nome), [data])

  useEffect(() => {
    const baixo = (e) => {
      const c = e.code
      if (c === 'ArrowLeft' || c === 'KeyA') teclas.current.esq = true
      else if (c === 'ArrowRight' || c === 'KeyD') teclas.current.dir = true
      else if (c === 'Space' || c === 'Enter' || c === 'KeyZ') {
        // trava a borda: um toque mais curto que um quadro nao pode se perder
        if (!teclas.current.fogo) teclas.current.trava = true
        teclas.current.fogo = true
      } else if (c === 'Escape') teclas.current.sair = true
      else return
      e.preventDefault()
    }
    const cima = (e) => {
      const c = e.code
      if (c === 'ArrowLeft' || c === 'KeyA') teclas.current.esq = false
      else if (c === 'ArrowRight' || c === 'KeyD') teclas.current.dir = false
      else if (c === 'Space' || c === 'Enter' || c === 'KeyZ') teclas.current.fogo = false
    }
    window.addEventListener('keydown', baixo)
    window.addEventListener('keyup', cima)
    return () => {
      window.removeEventListener('keydown', baixo)
      window.removeEventListener('keyup', cima)
    }
  }, [])

  useEffect(() => {
    if (document.fonts && document.fonts.load) {
      document.fonts.load('11px Silkscreen').catch(() => {})
    }

    sim.current = novoEstado(entradas.length)
    const ctx = tela.current.getContext('2d')
    ctx.imageSmoothingEnabled = false

    let fila = []
    const proximaPalavra = () => {
      if (!fila.length) fila = [...palavras].sort(() => Math.random() - 0.5)
      return fila.pop()
    }

    let raf
    let anterior = performance.now()
    let ultimoUi = ''

    let padAntes = false

    const entrada = () => {
      const t = teclas.current
      let eixo = (t.esq ? -1 : 0) + (t.dir ? 1 : 0)
      let padFogo = false
      const pads = navigator.getGamepads ? navigator.getGamepads() : []
      for (const p of pads) {
        if (!p) continue
        if (p.buttons[14] && p.buttons[14].pressed) eixo -= 1
        if (p.buttons[15] && p.buttons[15].pressed) eixo += 1
        const ax = p.axes[0] || 0
        if (Math.abs(ax) > 0.25) eixo += ax
        if ((p.buttons[0] && p.buttons[0].pressed) || (p.buttons[2] && p.buttons[2].pressed)) {
          padFogo = true
        }
        if (p.buttons[1] && p.buttons[1].pressed) t.sair = true
      }

      if (padFogo && !padAntes) t.trava = true
      padAntes = padFogo

      const disparou = t.trava
      t.trava = false
      return { eixo: Math.max(-1, Math.min(1, eixo)), disparou }
    }

    const soltar = (s) => {
      s.fase = 'jogando'
      const ang = Math.random() * 0.5 - 0.25 - Math.PI / 2
      s.bolas = [bolaNova(s.raquete + s.largura / 2, RAQ_Y - BOLA, ang, s.velocidade)]
    }

    const gritar = (s, texto) => {
      s.grito = texto
      s.gritoT = 1.3
    }

    const aplicarPoder = (s, poder) => {
      sfxPoder()
      gritar(s, ROTULO_PODER[poder])
      if (poder === 'triplo') {
        const extras = []
        for (const b of s.bolas) {
          const base = Math.atan2(b.vy, b.vx)
          extras.push(bolaNova(b.x, b.y, base - 0.42, s.velocidade))
          extras.push(bolaNova(b.x, b.y, base + 0.42, s.velocidade))
        }
        s.bolas = [...s.bolas, ...extras].slice(0, 9)
      } else if (poder === 'larga') {
        s.efeitos.larga = 14
      } else {
        s.efeitos.lenta = 11
      }
    }

    const soltarPalavra = (s, t) => {
      s.particulas.push({
        texto: proximaPalavra(),
        x: t.x + t.w / 2,
        y: t.y + t.h / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: -16 - Math.random() * 8,
        vida: 1.7,
        max: 1.7,
        cor: CORES[t.l % CORES.length],
      })
    }

    const bater = (s, t) => {
      t.hp -= 1
      if (t.hp > 0) {
        sfxTijolo(t.l)
        return
      }

      t.vivo = false
      s.pontos += PONTOS[t.l] ?? 1
      s.velocidade = Math.min(V_MAX, s.velocidade + V_GANHO)
      sfxTijolo(t.l)
      soltarPalavra(s, t)

      if (t.poder) aplicarPoder(s, t.poder)

      if (s.tijolos.some((x) => x.vivo && x.l === t.l)) return

      s.feitas = [...s.feitas, entradas[t.l].id]

      if (s.tijolos.every((x) => !x.vivo)) {
        s.fase = 'venceu'
        s.bolas = []
        setCartao(null)
        sfxVitoria()
      } else {
        s.fase = 'revelando'
        s.bolas = []
        setCartao(entradas[t.l])
        sfxLinha()
      }
    }

    const perderVida = (s) => {
      s.vidas -= 1
      s.efeitos.larga = 0
      s.efeitos.lenta = 0
      sfxPerdeu()
      s.fase = s.vidas <= 0 ? 'fim' : 'pronto'
    }

    const atualizar = (s, dt) => {
      s.tempo += dt
      const { eixo, disparou } = entrada()

      if (teclas.current.sair) {
        teclas.current.sair = false
        onSair()
        return
      }

      const novoFogo = disparou

      if (s.gritoT > 0) {
        s.gritoT -= dt
        if (s.gritoT <= 0) s.grito = null
      }

      for (const p of s.particulas) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 5 * dt
        p.vida -= dt
      }
      s.particulas = s.particulas.filter((p) => p.vida > 0)

      if (s.fase === 'aviso') {
        if (novoFogo) s.fase = 'pronto'
        return
      }

      for (const k of ['larga', 'lenta']) {
        if (s.efeitos[k] > 0) s.efeitos[k] = Math.max(0, s.efeitos[k] - dt)
      }
      s.largura = s.efeitos.larga > 0 ? RAQ_LARGA : RAQ_W

      s.raquete = Math.max(
        PAREDE,
        Math.min(LARG - PAREDE - s.largura, s.raquete + eixo * 128 * dt)
      )

      if (s.fase === 'pronto') {
        if (novoFogo) soltar(s)
        return
      }

      if (s.fase === 'revelando') {
        if (novoFogo) {
          setCartao(null)
          s.fase = 'pronto'
        }
        return
      }

      if (s.fase !== 'jogando') {
        if (novoFogo && (s.fase === 'fim' || s.fase === 'venceu')) {
          setCartao(null)
          Object.assign(s, novoEstado(entradas.length))
          s.fase = 'pronto'
        }
        return
      }

      const alvo = s.velocidade * (s.efeitos.lenta > 0 ? 0.68 : 1)

      for (const b of s.bolas) {
        const m = Math.hypot(b.vx, b.vy) || 1
        b.vx = (b.vx / m) * alvo
        b.vy = (b.vy / m) * alvo
        b.x += b.vx * dt
        b.y += b.vy * dt

        if (b.x - BOLA / 2 < PAREDE) {
          b.x = PAREDE + BOLA / 2
          b.vx = Math.abs(b.vx)
          sfxParede()
        } else if (b.x + BOLA / 2 > LARG - PAREDE) {
          b.x = LARG - PAREDE - BOLA / 2
          b.vx = -Math.abs(b.vx)
          sfxParede()
        }
        if (b.y - BOLA / 2 < TOPO) {
          b.y = TOPO + BOLA / 2
          b.vy = Math.abs(b.vy)
          sfxParede()
        }

        if (
          b.vy > 0 &&
          b.y + BOLA / 2 >= RAQ_Y &&
          b.y - BOLA / 2 <= RAQ_Y + RAQ_H &&
          b.x >= s.raquete &&
          b.x <= s.raquete + s.largura
        ) {
          const rel = (b.x - (s.raquete + s.largura / 2)) / (s.largura / 2)
          const ang = -Math.PI / 2 + rel * 1.08
          b.vx = Math.cos(ang) * alvo
          b.vy = Math.sin(ang) * alvo
          b.y = RAQ_Y - BOLA / 2
          sfxRaquete()
        }

        for (const t of s.tijolos) {
          if (!t.vivo) continue
          if (
            b.x + BOLA / 2 < t.x ||
            b.x - BOLA / 2 > t.x + t.w ||
            b.y + BOLA / 2 < t.y ||
            b.y - BOLA / 2 > t.y + t.h
          ) {
            continue
          }
          const porX = Math.min(
            Math.abs(b.x + BOLA / 2 - t.x),
            Math.abs(t.x + t.w - (b.x - BOLA / 2))
          )
          const porY = Math.min(
            Math.abs(b.y + BOLA / 2 - t.y),
            Math.abs(t.y + t.h - (b.y - BOLA / 2))
          )
          if (porX < porY) b.vx = -b.vx
          else b.vy = -b.vy
          bater(s, t)
          break
        }
      }

      if (s.fase !== 'jogando') return

      s.bolas = s.bolas.filter((b) => b.y - BOLA / 2 <= ALT)
      if (!s.bolas.length) perderVida(s)
    }

    const desenhar = (s) => {
      ctx.globalAlpha = 1
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, LARG * E, ALT * E)

      ctx.fillStyle = '#4a4a4a'
      ctx.fillRect(0, (TOPO - PAREDE) * E, LARG * E, PAREDE * E)
      ctx.fillRect(0, TOPO * E, PAREDE * E, (ALT - TOPO) * E)
      ctx.fillRect((LARG - PAREDE) * E, TOPO * E, PAREDE * E, (ALT - TOPO) * E)

      for (const t of s.tijolos) {
        if (!t.vivo) continue
        const cheio = t.hp > 1 || t.l >= RESISTENTES
        ctx.fillStyle = cheio ? CORES[t.l % CORES.length] : CORES_FRACAS[t.l % CORES_FRACAS.length]
        ctx.fillRect(t.x * E, t.y * E, t.w * E, t.h * E)
        if (t.poder && Math.floor(s.tempo * 5) % 2 === 0) {
          ctx.fillStyle = '#fff'
          ctx.fillRect((t.x + 3) * E, (t.y + 1) * E, (t.w - 6) * E, (t.h - 2) * E)
        }
      }

      ctx.fillStyle = s.efeitos.larga > 0 ? '#7de07d' : '#dcdcdc'
      ctx.fillRect(s.raquete * E, RAQ_Y * E, s.largura * E, RAQ_H * E)

      ctx.fillStyle = s.efeitos.lenta > 0 ? '#9fd4ff' : '#fff'
      for (const b of s.bolas) {
        ctx.fillRect((b.x - BOLA / 2) * E, (b.y - BOLA / 2) * E, BOLA * E, BOLA * E)
      }

      ctx.textAlign = 'center'
      ctx.font = '11px Silkscreen, monospace'
      for (const p of s.particulas) {
        ctx.globalAlpha = Math.min(1, p.vida / p.max) * 0.95
        ctx.fillStyle = p.cor
        ctx.fillText(p.texto, p.x * E, p.y * E)
      }
      ctx.globalAlpha = 1

      if (s.grito) {
        ctx.font = '22px Silkscreen, monospace'
        ctx.fillStyle = '#cfc23a'
        ctx.globalAlpha = Math.min(1, s.gritoT / 0.4)
        ctx.fillText(s.grito, (LARG / 2) * E, 82 * E)
        ctx.globalAlpha = 1
      }
      ctx.textAlign = 'left'
    }

    const passo = (agora) => {
      const dt = Math.min(0.045, (agora - anterior) / 1000)
      anterior = agora
      const s = sim.current
      atualizar(s, dt)
      desenhar(s)

      const chave = `${s.fase}|${s.pontos}|${s.vidas}|${s.feitas.length}|${s.bolas.length}`
      if (chave !== ultimoUi) {
        ultimoUi = chave
        setUi({
          fase: s.fase,
          pontos: s.pontos,
          vidas: s.vidas,
          feitas: s.feitas,
          bolas: s.bolas.length,
        })
      }
      raf = requestAnimationFrame(passo)
    }

    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [entradas, palavras, onSair])

  return (
    <div className="at-jogo">
      <div className="at-hud">
        <span className="at-pontos">{String(ui.pontos).padStart(4, '0')}</span>
        <span className="at-linhas">
          {entradas.map((e) => (
            <i key={e.id} className={ui.feitas.includes(e.id) ? 'on' : ''} />
          ))}
        </span>
        <span className="at-vidas">
          {Array.from({ length: Math.max(0, ui.vidas) }).map((_, i) => (
            <i key={i} />
          ))}
        </span>
      </div>

      <canvas ref={tela} width={LARG * E} height={ALT * E} className="at-tela" />

      {ui.fase === 'aviso' && (
        <div className="at-cartao at-aviso-inicial">
          <p className="at-cartao-topo">ANTES DE COMEÇAR</p>
          <h3>ESTE JOGO TE APRESENTA</h3>
          <ul>
            <li>
              <b>CADA BLOCO QUEBRADO</b> solta uma tecnologia que {data.nome.split(' ')[0]} domina
            </li>
            <li>
              <b>CADA FILEIRA</b> é uma vaga ou formação — derrube inteira e o cartão abre
            </li>
            <li>
              <b>BLOCOS PISCANDO</b> dão poderes: bola tripla, raquete larga, bola lenta
            </li>
            <li>
              As duas fileiras de cima aguentam <b>DOIS TOQUES</b>
            </li>
          </ul>
          <p className="at-cartao-seguir blink">BOTÃO PARA COMEÇAR</p>
        </div>
      )}

      {ui.fase === 'pronto' && <p className="at-aviso blink">APERTE O BOTÃO PARA LANÇAR</p>}

      {cartao && (
        <div className="at-cartao">
          <p className="at-cartao-topo">FILEIRA DERRUBADA</p>
          <h3>{cartao.titulo}</h3>
          <p className="at-cartao-sub">{cartao.sub}</p>
          <p className="at-cartao-premio">{cartao.premio}</p>
          <p className="at-cartao-seguir blink">BOTÃO PARA CONTINUAR</p>
        </div>
      )}

      {ui.fase === 'fim' && (
        <div className="at-cartao">
          <h3 className="at-fim">GAME OVER</h3>
          <p className="at-cartao-sub">
            {ui.pontos} PONTOS · {ui.feitas.length} DE {entradas.length} FILEIRAS
          </p>
          <p className="at-cartao-seguir blink">BOTÃO PARA JOGAR DE NOVO</p>
        </div>
      )}

      {ui.fase === 'venceu' && !cartao && (
        <div className="at-cartao">
          <h3 className="at-venceu">VOCÊ ZEROU</h3>
          <p className="at-cartao-sub">{ui.pontos} PONTOS · CURRÍCULO INTEIRO DERRUBADO</p>
          <p className="at-cartao-seguir blink">BOTÃO PARA JOGAR DE NOVO</p>
        </div>
      )}

      <p className="at-rodape">SETAS OU ANALÓGICO MOVEM · BOTÃO LANÇA · ESC VOLTA</p>
    </div>
  )
}
