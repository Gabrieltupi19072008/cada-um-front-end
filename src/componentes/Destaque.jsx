import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'

// Cartão grande do Início: mostra UMA coisa para fazer agora.
// `tom="novidade"` usa o laranja de aviso (algo chegou para a pessoa responder).
export default function Destaque({ tom = 'acento', visual, sobretitulo, titulo, texto, acao, children }) {
  return (
    <section className={`destaque destaque--${tom}`} aria-label={titulo}>
      <div className="destaque__visual">{visual}</div>
      <div className="destaque__texto">
        <span>{sobretitulo}</span>
        <h2>{titulo}</h2>
        {texto && <p>{texto}</p>}
        {children}
      </div>
      {acao && (
        <Link to={acao.para} className="destaque__acao">
          {acao.rotulo} <ArrowRight size={18} />
        </Link>
      )}
    </section>
  )
}

export function IconeDestaque({ icone: Icone }) {
  return (
    <span className="destaque__icone">
      <Icone size={34} />
    </span>
  )
}

// Linha menor, abaixo do destaque, para a segunda coisa mais importante.
export function Atalho({ para, visual, titulo, texto, children }) {
  return (
    <Link to={para} className="atalho">
      {visual}
      <div className="atalho__texto">
        <b>{titulo}</b>
        <span>{texto}</span>
        {children}
      </div>
      <ChevronRight size={20} />
    </Link>
  )
}
