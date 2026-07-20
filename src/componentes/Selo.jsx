export default function Selo({ children, variante = 'acento' }) {
  return <span className={`selo selo--${variante}`}>{children}</span>
}
