import BarraSuperior from './BarraSuperior'

export default function Layout({ largura = 'padrao', tema, centralizar = false, children }) {
  return (
    <div className={`pagina ${tema ? `tema-${tema}` : ''}`}>
      <BarraSuperior />
      <div
        className={`conteudo-pagina conteudo-pagina--${largura} ${
          centralizar ? 'conteudo-pagina--centralizado' : ''
        }`}
      >
        {children}
      </div>
    </div>
  )
}
