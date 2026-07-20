import { useId } from 'react'

export default function Logo({ tamanho = 32, mostrarNome = true, tamanhoFonte }) {
  const id = useId()
  const clipId = `${id}-silhueta`
  const maskTl = `${id}-tl`
  const maskTr = `${id}-tr`
  const maskBl = `${id}-bl`
  const maskBr = `${id}-br`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <rect x="-25" y="-25" width="50" height="50" rx="11" />
          </clipPath>
          <mask id={maskTl}>
            <rect x="-25" y="-25" width="27" height="27" fill="#fff" />
            <circle cx="2" cy="-11.5" r="6" fill="#fff" />
            <circle cx="-11.5" cy="2" r="6" fill="#fff" />
          </mask>
          <mask id={maskTr}>
            <rect x="2" y="-25" width="23" height="27" fill="#fff" />
            <circle cx="2" cy="-11.5" r="6" fill="#000" />
            <circle cx="13.5" cy="2" r="6" fill="#000" />
          </mask>
          <mask id={maskBl}>
            <rect x="-25" y="2" width="27" height="23" fill="#fff" />
            <circle cx="-11.5" cy="2" r="6" fill="#000" />
            <circle cx="2" cy="13.5" r="6" fill="#000" />
          </mask>
          <mask id={maskBr}>
            <rect x="2" y="2" width="23" height="23" fill="#fff" />
            <circle cx="13.5" cy="2" r="6" fill="#fff" />
            <circle cx="2" cy="13.5" r="6" fill="#fff" />
          </mask>
        </defs>
        <g transform="translate(50,50) rotate(45)">
          <g clipPath={`url(#${clipId})`}>
            <rect x="-30" y="-30" width="60" height="60" fill="#f2c744" mask={`url(#${maskTl})`} />
            <rect x="-30" y="-30" width="60" height="60" fill="#f0665a" mask={`url(#${maskTr})`} />
            <rect x="-30" y="-30" width="60" height="60" fill="#7c5cc0" mask={`url(#${maskBl})`} />
            <rect x="-30" y="-30" width="60" height="60" fill="#6dbe45" mask={`url(#${maskBr})`} />
          </g>
        </g>
        <circle cx="43" cy="30" r="3.3" fill="#3a3630" />
        <circle cx="57" cy="30" r="3.3" fill="#3a3630" />
        <path d="M43 37 Q50 43 57 37" stroke="#3a3630" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      </svg>
      {mostrarNome && (
        <span
          style={{
            fontWeight: 800,
            letterSpacing: -0.3,
            fontSize: tamanhoFonte || tamanho * 0.62,
            display: 'flex',
          }}
        >
          <span style={{ color: '#f0665a' }}>C</span>
          <span style={{ color: '#f2c744' }}>A</span>
          <span style={{ color: '#6dbe45' }}>D</span>
          <span style={{ color: '#7c5cc0' }}>A</span>
          <span style={{ color: 'var(--titulo)' }}>&middot;</span>
          <span style={{ color: '#f0665a' }}>U</span>
          <span style={{ color: '#f2c744' }}>M</span>
        </span>
      )}
    </div>
  )
}
