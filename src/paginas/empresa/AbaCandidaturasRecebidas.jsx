import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, MessageCircle, UserCheck } from 'lucide-react'
import cliente from '../../api/cliente'
import Selo from '../../componentes/Selo'
import Botao from '../../componentes/Botao'
import Conversa from '../../componentes/Conversa'

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
  const [conversaAberta, setConversaAberta] = useState(null)
  const navegar = useNavigate()

  function carregar() {
    cliente
      .get('/empresas/me/candidaturas')
      .then((resposta) => setCandidaturas(resposta.data))
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

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Candidaturas recebidas</h2>
      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {erroResposta && <p className="aviso aviso--erro">{erroResposta}</p>}
      {candidaturas.length === 0 && !erro && (
        <p className="texto-suave">Ninguém se candidatou diretamente às suas vagas ainda.</p>
      )}
      <div className="lista-candidatos">
        {candidaturas.map((candidatura) => {
          const podeConversar = ['selecionado', 'aceito', 'recusado'].includes(candidatura.status)
          return (
            <div key={candidatura.id} style={{ marginBottom: 8 }}>
              <div className="linha-candidato">
                <div>
                  <p className="linha-candidato__nome">{candidatura.candidato.usuario.nome}</p>
                  <p className="linha-candidato__info">
                    {candidatura.vaga ? `Vaga: ${candidatura.vaga.titulo}` : 'Candidatura direta pela vaga'}
                    {candidatura.mensagem ? ` — "${candidatura.mensagem}"` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Selo variante={ROTULOS_STATUS[candidatura.status].variante}>
                    {ROTULOS_STATUS[candidatura.status].texto}
                  </Selo>
                  <Botao variante="contorno" onClick={() => navegar(`/empresa/candidatos/${candidatura.candidato.id}`)}>
                    Ver currículo
                  </Botao>
                  {podeConversar && (
                    <Botao
                      variante="contorno"
                      icone={MessageCircle}
                      onClick={() => setConversaAberta((atual) => (atual === candidatura.id ? null : candidatura.id))}
                    >
                      {conversaAberta === candidatura.id ? 'Fechar conversa' : 'Conversar'}
                    </Botao>
                  )}
                  {(candidatura.status === 'pendente' || candidatura.status === 'visualizado') && (
                    <>
                      <Botao variante="sucesso" icone={UserCheck} onClick={() => responder(candidatura.id, 'selecionado')}>
                        Selecionar
                      </Botao>
                      <Botao variante="contorno" icone={X} onClick={() => responder(candidatura.id, 'recusado')}>
                        Recusar
                      </Botao>
                    </>
                  )}
                  {candidatura.status === 'selecionado' && (
                    <>
                      <Botao variante="sucesso" icone={Check} onClick={() => responder(candidatura.id, 'aceito')}>
                        Aceitar
                      </Botao>
                      <Botao variante="contorno" icone={X} onClick={() => responder(candidatura.id, 'recusado')}>
                        Recusar
                      </Botao>
                    </>
                  )}
                </div>
              </div>
              {conversaAberta === candidatura.id && (
                <Conversa interesseId={candidatura.id} podeEnviar={candidatura.status === 'selecionado'} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
