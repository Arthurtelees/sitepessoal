export const CONSOLES = [
  { id: 'atari', nome: 'ATARI 2600', skin: 'Breakout', ano: 1977, jogoAno: 1978, midia: 'CARTUCHO', pronto: true, intro: true },
  { id: 'ps1', nome: 'PLAYSTATION', skin: 'Resident Evil 2', ano: 1994, jogoAno: 1998, midia: 'DISCO', pronto: true, intro: true },
  { id: 'ps2', nome: 'PLAYSTATION 2', skin: 'GTA San Andreas', ano: 2000, jogoAno: 2004, midia: 'DISCO', pronto: true, intro: true },
  { id: 'ps3', nome: 'PLAYSTATION 3', skin: 'XrossMediaBar', ano: 2006, pronto: true, intro: true },
]

export const VOLTAR_TV = {
  id: 'inicio',
  nome: 'VOLTAR PRA TELEVISÃO',
  skin: 'Início de transmissão',
  pronto: true,
  tv: true,
}

export const COM_TV = [...CONSOLES, VOLTAR_TV]

export const ERAS_PRONTAS = CONSOLES.filter((c) => c.pronto).map((c) => c.id)

export const temIntro = (id) => CONSOLES.some((c) => c.id === id && c.intro)
