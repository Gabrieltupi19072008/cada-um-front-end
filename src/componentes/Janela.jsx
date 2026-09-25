import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

// Janela (modal) nativa: prende o foco, fecha no Esc e no botão X.
export default function Janela({ aberta, aoFechar, titulo, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const janela = ref.current
    if (!janela) return
    if (aberta && !janela.open) janela.showModal()
    if (!aberta && janela.open) janela.close()
  }, [aberta])

  return (
    <dialog
      ref={ref}
      className="janela"
      onClose={aoFechar}
      onClick={(evento) => evento.target === ref.current && aoFechar()}
      aria-label={titulo}
    >
      {aberta && (
        <div className="janela__conteudo">
          <button type="button" className="janela__fechar" onClick={aoFechar} aria-label="Fechar">
            <X size={20} />
          </button>
          {children}
        </div>
      )}
    </dialog>
  )
}
