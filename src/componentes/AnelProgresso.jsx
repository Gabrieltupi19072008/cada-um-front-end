export default function AnelProgresso({ valor, tamanho = 52 }) {
  const percentual = Math.min(100, Math.max(0, Math.round(valor)))
  return (
    <div
      className="anel-progresso"
      style={{ width: tamanho, height: tamanho, '--percentual': `${percentual}%` }}
      role="img"
      aria-label={`${percentual}% completo`}
    >
      <b>{percentual}%</b>
    </div>
  )
}
