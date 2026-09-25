import { ChevronRight } from 'lucide-react'

export default function Metrica({ icone: Icone, valor, rotulo, detalhe, destaque = false, aoClicar }) {
  const conteudo = (
    <>
      <span className="metrica__icone">
        <Icone size={20} />
      </span>
      <div>
        <b>{valor}</b>
        <p>{rotulo}</p>
        {detalhe && <small>{detalhe}</small>}
      </div>
      {aoClicar && <ChevronRight size={17} className="metrica__seta" />}
    </>
  )

  const classe = `metrica ${destaque ? 'metrica--destaque' : ''}`
  if (aoClicar) {
    return (
      <button type="button" className={classe} onClick={aoClicar}>
        {conteudo}
      </button>
    )
  }
  return <div className={classe}>{conteudo}</div>
}
