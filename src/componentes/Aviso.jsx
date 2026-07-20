export default function Aviso({ children, variante = 'sucesso' }) {
  return <div className={`aviso aviso--${variante}`}>{children}</div>
}
