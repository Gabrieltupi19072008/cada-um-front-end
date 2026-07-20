export default function BarraProgresso({ valor, cor = 'acento' }) {
  const percentual = Math.min(100, Math.max(0, valor))
  return (
    <div className="barra-progresso-fundo">
      <div
        className={`barra-progresso-preenchimento barra-progresso--${cor}`}
        style={{ width: `${percentual}%` }}
      />
    </div>
  )
}
