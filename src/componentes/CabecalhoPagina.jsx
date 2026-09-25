export default function CabecalhoPagina({ sobretitulo, titulo, descricao, acoes }) {
  return (
    <header className="cabecalho-pagina">
      <div>
        {sobretitulo && <span>{sobretitulo}</span>}
        <h1>{titulo}</h1>
        {descricao && <p>{descricao}</p>}
      </div>
      {acoes && <div className="cabecalho-pagina__acoes">{acoes}</div>}
    </header>
  )
}
