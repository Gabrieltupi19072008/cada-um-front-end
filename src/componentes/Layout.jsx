import BarraSuperior from './BarraSuperior'

export default function Layout({ largura = 'padrao', tema, children }) {
  return (
    <div className={`pagina ${tema ? `tema-${tema}` : ''}`}>
      <BarraSuperior />
      <div className={`conteudo-pagina conteudo-pagina--${largura}`}>{children}</div>
    </div>
  )
}
