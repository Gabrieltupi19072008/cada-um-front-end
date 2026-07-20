export default function Botao({ variante = 'primario', icone: Icone, className = '', children, ...props }) {
  return (
    <button className={`botao botao--${variante} ${className}`} {...props}>
      {Icone && <Icone size={16} />}
      {children}
    </button>
  )
}
