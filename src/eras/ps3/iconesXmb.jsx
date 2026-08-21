const traco = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const ICONES = {
  perfil: (
    <g {...traco}>
      <circle cx="12" cy="9" r="4.4" />
      <path d="M4.4 20.4c0-4.2 3.4-6.6 7.6-6.6s7.6 2.4 7.6 6.6" />
    </g>
  ),
  experiencia: (
    <g {...traco}>
      <rect x="3.2" y="7.4" width="17.6" height="12.4" rx="1.6" />
      <path d="M9 7.4V5.6a1.6 1.6 0 0 1 1.6-1.6h2.8A1.6 1.6 0 0 1 15 5.6v1.8M3.2 13h17.6M10.4 13v2.2h3.2V13" />
    </g>
  ),
  formacao: (
    <g {...traco}>
      <path d="M12 4 2.6 8.6 12 13.2l9.4-4.6z" />
      <path d="M6.4 10.8v5.4c0 1.7 2.5 3 5.6 3s5.6-1.3 5.6-3v-5.4M20.2 9.6v5.8" />
    </g>
  ),
  competencias: (
    <g {...traco}>
      <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="1.4" />
      <rect x="9.8" y="9.8" width="4.4" height="4.4" rx="0.6" />
      <path d="M9.2 6.2V3.4M14.8 6.2V3.4M9.2 20.6v-2.8M14.8 20.6v-2.8M6.2 9.2H3.4M6.2 14.8H3.4M20.6 9.2h-2.8M20.6 14.8h-2.8" />
    </g>
  ),
  idiomas: (
    <g {...traco}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M3.6 12h16.8M12 3.6c2.4 2.3 2.4 14.1 0 16.8M12 3.6c-2.4 2.3-2.4 14.1 0 16.8" />
    </g>
  ),
  curriculo: (
    <g {...traco}>
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 3.6v2.6M12 17.8v2.6" />
    </g>
  ),
  consoles: (
    <g {...traco}>
      <rect x="2.6" y="6.4" width="18.8" height="11.2" rx="2.4" />
      <path d="M7.4 12H10M8.7 10.7v2.6" />
      <circle cx="15.4" cy="11.2" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="17.6" cy="13.2" r="0.9" fill="currentColor" stroke="none" />
    </g>
  ),
}

export default function IconeXmb({ id, tamanho = 34 }) {
  return (
    <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} aria-hidden="true">
      {ICONES[id] || null}
    </svg>
  )
}
