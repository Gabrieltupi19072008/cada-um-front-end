export default function Cartao({ titulo, icone: Icone, acoes, children, className = '' }) {
  return (
    <div className={`cartao-painel ${className}`}>
      {titulo && (
        <div className="cartao-cabecalho">
          <span className="cartao-cabecalho__titulo">
            {Icone && <Icone size={18} />}
            {titulo}
          </span>
          {acoes && <div className="cartao-cabecalho__acoes">{acoes}</div>}
        </div>
      )}
      <div className="cartao-corpo">{children}</div>
    </div>
  )
}
