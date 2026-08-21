export const SALAS = {
  atari: {
    src: './sala-atari.webp',
    console: { x: 513, y: 500, w: 380, h: 110 },
    w: 1408,
    h: 768,
    tela: { x: 508, y: 188, w: 356, h: 281 },
    tv: { x: 452, y: 126, w: 556, h: 478 },
    palco: { w: 640, h: 480 },
    raio: 24,
    borrao: 2.4,
  },
  ps1: {
    src: './sala-ps1.webp',
    console: { x: 999, y: 492, w: 278, h: 82 },
    w: 1376,
    h: 768,
    tela: { x: 488, y: 160, w: 409, h: 321 },
    tv: { x: 428, y: 112, w: 520, h: 478 },
    palco: { w: 640, h: 480 },
    raio: 16,
    borrao: 2.2,
  },
  ps2: {
    src: './sala-ps2.webp',
    console: { x: 452, y: 392, w: 192, h: 45 },
    w: 1915,
    h: 821,
    tela: { x: 732, y: 89, w: 436, h: 300 },
    tv: { x: 663, y: 42, w: 574, h: 395 },
    palco: { w: 640, h: 480 },
    raio: 9,
    borrao: 2.1,
  },
  ps3: {
    src: './sala-ps3.webp',
    console: { x: 356, y: 490, w: 252, h: 77 },
    w: 1584,
    h: 672,
    tela: { x: 540, y: 117, w: 509, h: 330 },
    tv: { x: 508, y: 78, w: 578, h: 430 },
    palco: { h: 480 },
    alvo: 0.6,
    foco: 1.4,
    plana: true,
    raio: 5,
    borrao: 2.8,
  },
  tv2026: {
    src: './sala-tv2026.webp',
    w: 1916,
    h: 821,
    tela: { x: 487, y: 53, w: 990, h: 534 },
    tv: { x: 470, y: 38, w: 1024, h: 570 },
    palco: { w: 890, h: 480 },
    raio: 5,
    foco: 1.4,
    
  },
}

export const FOTO_DO_AMBIENTE = {
  atari: 'atari',
  ps1: 'ps1',
  ps2: 'ps2',
  inicio: 'tv2026',
  ps3: 'ps3',
}

export const PALCO_PADRAO = { w: 640, h: 480 }

// em painel plano o conteúdo tem que encher o vidro exatamente, então a largura
// do palco sai da proporção da tela e não do que está escrito no arquivo: assim
// mexer no retângulo da tela nunca deixa tarja preta sobrando. Em tubo a folga é
// bem-vinda, que é o underscan que aquelas TVs tinham de verdade.
function palcoDaSala(sala) {
  const p = sala.palco
  if (!sala.plana) return p
  return { w: Math.round((p.h * sala.tela.w) / sala.tela.h), h: p.h }
}

export function geometria(sala, vw, vh, alvo) {
  const cobre = Math.max(vw / sala.w, vh / sala.h)
  const p = palcoDaSala(sala)
  const mira = sala.alvo && alvo > 0.6 ? alvo : sala.alvo || alvo
  const util = Math.min((sala.tela.w * p.h) / p.w, sala.tela.h)
  const zoom = Math.max(cobre, (mira * vh) / util)
  const fw = sala.w * zoom
  const fh = sala.h * zoom
  const cx = (sala.tela.x + sala.tela.w / 2) * zoom
  const cy = (sala.tela.y + sala.tela.h / 2) * zoom
  const left = Math.min(0, Math.max(vw - fw, vw / 2 - cx))
  const top = Math.min(0, Math.max(vh - fh, vh / 2 - cy))
  const foco = sala.foco || 0.62
  const tela = {
    left: left + sala.tela.x * zoom,
    top: top + sala.tela.y * zoom,
    w: sala.tela.w * zoom,
    h: sala.tela.h * zoom,
  }
  // a area clicavel do console e a intersecao da caixa dele com o que a janela
  // mostra da foto: em tela pequena o recorte come parte do movel
  const caixa = sala.console
  let botao = null
  if (caixa) {
    const x0 = Math.max(left + caixa.x * zoom, 0)
    const y0 = Math.max(top + caixa.y * zoom, 0)
    const x1 = Math.min(left + (caixa.x + caixa.w) * zoom, vw)
    const y1 = Math.min(top + (caixa.y + caixa.h) * zoom, vh)
    if (x1 - x0 > 40 && y1 - y0 > 24) {
      botao = { left: x0, top: y0, w: x1 - x0, h: y1 - y0 }
    }
  }

  return {
    zoom,
    botao,
    foto: { left, top, w: fw, h: fh },
    tela,
    raio: sala.raio * zoom,
    palco: p,
    plana: !!sala.plana,
    escala: Math.min(tela.w / p.w, tela.h / p.h),
    mascara: {
      x: (sala.tv.x + sala.tv.w / 2) * zoom,
      y: (sala.tv.y + sala.tv.h / 2) * zoom,
      rx: sala.tv.w * foco * zoom,
      ry: sala.tv.h * foco * zoom,
    },
  }
}
