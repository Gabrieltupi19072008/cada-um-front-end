import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, FileText, X, UserCheck } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Conversa from '../../componentes/Conversa'
import CaixaConversas, { CabecalhoConversa } from '../../componentes/CaixaConversas'

const ROTULOS_STATUS = {
  pendente: { texto: 'Novo', variante: 'sucesso' },
  visualizado: { texto: 'Visualizado', variante: 'acento' },
  selecionado: { texto: 'Selecionado', variante: 'acento' },
  aceito: { texto: 'Aceito', variante: 'sucesso' },
  recusado: { texto: 'Recusado', variante: 'navy' },
}

export default function AbaCandidaturasRecebidas() {
  const [candidaturas, setCandidaturas] = useState([])
  const [erro, setErro] = useState('')
  const [erroResposta, setErroResposta] = useState('')
  const [selecionadoId, setSelecionadoId] = useState(null)
  const navegar = useNavigate()

  function carregar() {
    cliente
      .get('/empresas/me/candidaturas')
      .then((resposta) => {
        setCandidaturas(resposta.data)
        setSelecionadoId((atual) => atual ?? resposta.data[0]?.id ?? null)
      })
      .catch(() => setErro('Não foi possível carregar as candidaturas'))
  }

  useEffect(() => {
    carregar()
  }, [])

  async function responder(id, status) {
    setErroResposta('')
    try {
      await cliente.put(`/empresas/me/candidaturas/${id}`, { status })
      carregar()
    } catch (erroRequisicao) {
      setErroResposta(erroRequisicao.response?.data?.detail || 'Não foi possível registrar sua resposta. Tente novamente.')
    }
  }

  const selecionada = candidaturas.find((candidatura) => candidatura.id === selecionadoId)

  return (
    <div>
      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {erroResposta && <p className="aviso aviso--erro">{erroResposta}</p>}
      {candidaturas.length === 0 && !erro && (
        <p className="texto-suave">Ninguém se candidatou diretamente às suas vagas ainda.</p>
      )}

      {candidaturas.length > 0 && (
        <CaixaConversas
          itens={candidaturas.map((candidatura) => ({
            id: candidatura.id,
            nome: candidatura.candidato.usuario.nome,
            fotoUrl: candidatura.candidato.usuario.foto_url,
            resumo: candidatura.vaga ? candidatura.vaga.titulo : 'Candidatura direta',
            selo: ROTULOS_STATUS[candidatura.status],
          }))}
          selecionadoId={selecionadoId}
          aoSelecionar={setSelecionadoId}
        >
          {selecionada && (
            <>
              <CabecalhoConversa
                nome={selecionada.candidato.usuario.nome}
                fotoUrl={selecionada.candidato.usuario.foto_url}
                subtitulo={selecionada.vaga ? `Vaga: ${selecionada.vaga.titulo}` : 'Candidatura direta'}
                selo={ROTULOS_STATUS[selecionada.status]}
                acoes={
                  <>
                    <Botao
                      variante="contorno"
                      icone={FileText}
                      onClick={() => navegar(`/empresa/candidatos/${selecionada.candidato.id}`)}
                    >
                      Ver currículo
                    </Botao>
                    {selecionada.status === 'selecionado' && (
                      <>
                        <Botao variante="sucesso" icone={Check} onClick={() => responder(selecionada.id, 'aceito')}>
                          Aceitar
                        </Botao>
                        <Botao variante="contorno" icone={X} onClick={() => responder(selecionada.id, 'recusado')}>
                          Recusar
                        </Botao>
                      </>
                    )}
                  </>
                }
              />
              {selecionada.status === 'pendente' || selecionada.status === 'visualizado' ? (
                <div className="conversa-convite">
                  <b>{selecionada.candidato.usuario.nome} se candidatou!</b>
                  {selecionada.mensagem && <p>“{selecionada.mensagem}”</p>}
                  <p>Selecione o candidato para liberar a conversa e combinar os próximos passos.</p>
                  <div>
                    <Botao variante="primario" icone={UserCheck} onClick={() => responder(selecionada.id, 'selecionado')}>
                      Selecionar e conversar
                    </Botao>
                    <Botao variante="contorno" icone={X} onClick={() => responder(selecionada.id, 'recusado')}>
                      Recusar
                    </Botao>
                  </div>
                </div>
              ) : (
                <Conversa interesseId={selecionada.id} podeEnviar={selecionada.status === 'selecionado'} />
              )}
            </>
          )}
        </CaixaConversas>
      )}
    </div>
  )
}
