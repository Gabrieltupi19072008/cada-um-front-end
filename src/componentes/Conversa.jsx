import { useEffect, useRef, useState } from 'react'
import { Lock, Send } from 'lucide-react'
import cliente from '../api/cliente'

const INTERVALO_ATUALIZACAO_MS = 8000

function formatarDia(data) {
  const hoje = new Date()
  const ontem = new Date()
  ontem.setDate(hoje.getDate() - 1)
  if (data.toDateString() === hoje.toDateString()) return 'HOJE'
  if (data.toDateString() === ontem.toDateString()) return 'ONTEM'
  return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }).toUpperCase()
}

export default function Conversa({ interesseId, podeEnviar }) {
  const [mensagens, setMensagens] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const listaRef = useRef(null)

  function carregar() {
    cliente
      .get(`/interesses/${interesseId}/mensagens`)
      .then((resposta) => setMensagens(resposta.data))
      .catch(() => setErro('Não foi possível carregar a conversa'))
  }

  useEffect(() => {
    setMensagens([])
    setErro('')
    carregar()
    const intervalo = setInterval(carregar, INTERVALO_ATUALIZACAO_MS)
    return () => clearInterval(intervalo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interesseId])

  useEffect(() => {
    const lista = listaRef.current
    if (lista) lista.scrollTop = lista.scrollHeight
  }, [mensagens.length])

  async function enviar(evento) {
    evento.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    setErro('')
    try {
      await cliente.post(`/interesses/${interesseId}/mensagens`, { corpo: texto.trim() })
      setTexto('')
      carregar()
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível enviar a mensagem')
    } finally {
      setEnviando(false)
    }
  }

  let diaAnterior = null

  return (
    <>
      <div className="conversa-mensagens" ref={listaRef}>
        {erro && <p className="aviso aviso--erro">{erro}</p>}
        {mensagens.length === 0 && !erro && (
          <p className="conversa-vazia">
            {podeEnviar ? 'Nenhuma mensagem ainda. Mande um "oi" para começar a combinar os detalhes.' : 'Nenhuma mensagem nesta conversa.'}
          </p>
        )}
        {mensagens.map((mensagem) => {
          const data = new Date(mensagem.criado_em)
          const dia = formatarDia(data)
          const mostrarDia = dia !== diaAnterior
          diaAnterior = dia
          return (
            <div key={mensagem.id} className="conversa-item">
              {mostrarDia && <div className="conversa-dia">{dia}</div>}
              <div className={`bolha ${mensagem.de_mim ? 'bolha--minha' : 'bolha--dela'}`}>
                {!mensagem.de_mim && <b>{mensagem.remetente_nome}</b>}
                {mensagem.corpo}
                <small>{data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
              </div>
            </div>
          )
        })}
      </div>

      {podeEnviar ? (
        <form onSubmit={enviar} className="conversa-rodape">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva uma mensagem..."
            disabled={enviando}
            aria-label="Mensagem"
          />
          <button type="submit" className="conversa-enviar" disabled={enviando || !texto.trim()} aria-label="Enviar">
            <Send size={18} />
          </button>
        </form>
      ) : (
        <div className="conversa-rodape conversa-rodape--fechada">
          <Lock size={15} /> Conversa encerrada (a decisão final já saiu) — histórico só de leitura.
        </div>
      )}
    </>
  )
}
