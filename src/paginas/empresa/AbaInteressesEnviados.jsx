import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, FileText, X } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Conversa from '../../componentes/Conversa'
import CaixaConversas, { CabecalhoConversa, ConversaBloqueada } from '../../componentes/CaixaConversas'

const ROTULOS_STATUS = {
  pendente: { texto: 'Pendente', variante: 'alerta' },
  visualizado: { texto: 'Visualizado', variante: 'acento' },
  selecionado: { texto: 'Conversando', variante: 'acento' },
  aceito: { texto: 'Aceito', variante: 'sucesso' },
  recusado: { texto: 'Recusado', variante: 'navy' },
}

export default function AbaInteressesEnviados() {
  const [interesses, setInteresses] = useState([])
  const [erro, setErro] = useState('')
  const [erroResposta, setErroResposta] = useState('')
  const [selecionadoId, setSelecionadoId] = useState(null)
  const navegar = useNavigate()

  function carregar() {
    cliente
      .get('/empresas/me/interesses')
      .then((resposta) => {
        setInteresses(resposta.data)
        setSelecionadoId((atual) => atual ?? resposta.data[0]?.id ?? null)
      })
      .catch(() => setErro('Não foi possível carregar os interesses'))
  }

  useEffect(() => {
    carregar()
  }, [])

  async function responder(id, status) {
    setErroResposta('')
    try {
      await cliente.put(`/empresas/me/interesses/${id}`, { status })
      carregar()
    } catch (erroRequisicao) {
      setErroResposta(erroRequisicao.response?.data?.detail || 'Não foi possível registrar sua resposta. Tente novamente.')
    }
  }

  const selecionado = interesses.find((interesse) => interesse.id === selecionadoId)

  return (
    <div>
      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {erroResposta && <p className="aviso aviso--erro">{erroResposta}</p>}
      {interesses.length === 0 && !erro && (
        <p className="texto-suave">Você ainda não demonstrou interesse em nenhum candidato.</p>
      )}

      {interesses.length > 0 && (
        <CaixaConversas
          itens={interesses.map((interesse) => ({
            id: interesse.id,
            nome: interesse.candidato.usuario.nome,
            fotoUrl: interesse.candidato.usuario.foto_url,
            resumo: interesse.mensagem || 'Sem mensagem',
            selo: ROTULOS_STATUS[interesse.status],
          }))}
          selecionadoId={selecionadoId}
          aoSelecionar={setSelecionadoId}
        >
          {selecionado && (
            <>
              <CabecalhoConversa
                nome={selecionado.candidato.usuario.nome}
                fotoUrl={selecionado.candidato.usuario.foto_url}
                subtitulo={selecionado.mensagem ? `“${selecionado.mensagem}”` : 'Interesse enviado'}
                selo={ROTULOS_STATUS[selecionado.status]}
                acoes={
                  <>
                    <Botao
                      variante="contorno"
                      icone={FileText}
                      onClick={() => navegar(`/empresa/candidatos/${selecionado.candidato.id}`)}
                    >
                      Ver currículo
                    </Botao>
                    {selecionado.status === 'selecionado' && (
                      <>
                        <Botao variante="sucesso" icone={Check} onClick={() => responder(selecionado.id, 'aceito')}>
                          Aceitar
                        </Botao>
                        <Botao variante="contorno" icone={X} onClick={() => responder(selecionado.id, 'recusado')}>
                          Recusar
                        </Botao>
                      </>
                    )}
                  </>
                }
              />
              {['selecionado', 'aceito', 'recusado'].includes(selecionado.status) ? (
                <Conversa interesseId={selecionado.id} podeEnviar={selecionado.status === 'selecionado'} />
              ) : (
                <ConversaBloqueada
                  titulo="Aguardando resposta do candidato"
                  texto="Quando o candidato aceitar o seu contato, a conversa é liberada aqui."
                />
              )}
            </>
          )}
        </CaixaConversas>
      )}
    </div>
  )
}
