import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import cliente from '../api/cliente'
import Botao from './Botao'

const INTERVALO_ATUALIZACAO_MS = 8000

function obterIniciais(nome) {
  const partes = nome.trim().split(/\s+/)
  return partes.slice(0, 2).map((parte) => parte[0].toUpperCase()).join('')
}

export default function Conversa({ interesseId, podeEnviar }) {
  const [mensagens, setMensagens] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const fimDaListaRef = useRef(null)

  function carregar() {
    cliente
      .get(`/interesses/${interesseId}/mensagens`)
      .then((resposta) => setMensagens(resposta.data))
      .catch(() => setErro('Não foi possível carregar a conversa'))
  }

  useEffect(() => {
    carregar()
    const intervalo = setInterval(carregar, INTERVALO_ATUALIZACAO_MS)
    return () => clearInterval(intervalo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interesseId])

  useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ block: 'nearest' })
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

  return (
    <div
      style={{
        border: '1px solid var(--borda, #e5e1d8)',
        borderRadius: 10,
        padding: 12,
        marginTop: 8,
        background: 'var(--fundo-2, #faf9f5)',
      }}
    >
      {erro && <p className="aviso aviso--erro">{erro}</p>}
      <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {mensagens.length === 0 && !erro && (
          <p className="texto-suave" style={{ fontSize: 13 }}>
            Nenhuma mensagem ainda. Manda um "oi" pra começar a combinar os detalhes.
          </p>
        )}
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: mensagem.de_mim ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 6,
                alignItems: 'flex-end',
                flexDirection: mensagem.de_mim ? 'row-reverse' : 'row',
                maxWidth: '85%',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  flex: 'none',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  background: mensagem.remetente_foto_url ? 'transparent' : 'var(--acento)',
                  backgroundImage: mensagem.remetente_foto_url ? `url(${mensagem.remetente_foto_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!mensagem.remetente_foto_url && obterIniciais(mensagem.remetente_nome)}
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 12,
                  fontSize: 13.5,
                  background: mensagem.de_mim ? 'var(--acento)' : '#fff',
                  color: mensagem.de_mim ? '#fff' : 'var(--texto, #333)',
                  border: mensagem.de_mim ? 'none' : '1px solid var(--borda, #e5e1d8)',
                }}
              >
                {mensagem.corpo}
              </div>
            </div>
            <span className="texto-suave" style={{ fontSize: 10, marginTop: 2 }}>
              {mensagem.remetente_nome} · {new Date(mensagem.criado_em).toLocaleString('pt-BR')}
            </span>
          </div>
        ))}
        <div ref={fimDaListaRef} />
      </div>

      {podeEnviar ? (
        <form onSubmit={enviar} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva uma mensagem..."
            disabled={enviando}
            style={{ flex: 1 }}
          />
          <Botao type="submit" icone={Send} disabled={enviando || !texto.trim()}>
            Enviar
          </Botao>
        </form>
      ) : (
        <p className="texto-suave" style={{ fontSize: 12, marginTop: 8 }}>
          Essa conversa já foi encerrada (a decisão final já saiu) — histórico só de leitura.
        </p>
      )}
    </div>
  )
}
