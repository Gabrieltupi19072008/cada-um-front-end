import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X, MessageCircle, UserCheck } from 'lucide-react'
import Layout from '../componentes/Layout'
import Botao from '../componentes/Botao'
import Selo from '../componentes/Selo'
import Conversa from '../componentes/Conversa'
import cliente from '../api/cliente'

const ROTULOS_STATUS = {
  pendente: { texto: 'Pendente', variante: 'alerta' },
  visualizado: { texto: 'Visualizado', variante: 'acento' },
  selecionado: { texto: 'Selecionado', variante: 'acento' },
  aceito: { texto: 'Aceito', variante: 'sucesso' },
  recusado: { texto: 'Recusado', variante: 'navy' },
}

export default function InteressesRecebidos() {
  const [interesses, setInteresses] = useState([])
  const [erro, setErro] = useState('')
  const [erroResposta, setErroResposta] = useState('')
  const [conversaAberta, setConversaAberta] = useState(null)
  const navegar = useNavigate()

  function carregar() {
    cliente
      .get('/candidatos/me/interesses')
      .then((resposta) => setInteresses(resposta.data))
      .catch(() => setErro('Não foi possível carregar os interesses'))
  }

  useEffect(() => {
    carregar()
  }, [])

  async function responder(id, status) {
    setErroResposta('')
    try {
      await cliente.put(`/candidatos/me/interesses/${id}`, { status })
      carregar()
    } catch (erroRequisicao) {
      setErroResposta(erroRequisicao.response?.data?.detail || 'Não foi possível registrar sua resposta. Tente novamente.')
    }
  }

  return (
    <Layout largura="largo">
      <Botao variante="contorno" icone={ArrowLeft} onClick={() => navegar('/candidato')} style={{ marginBottom: 16 }}>
        Voltar ao início
      </Botao>

      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {erroResposta && <p className="aviso aviso--erro">{erroResposta}</p>}
      {!erro && interesses.length === 0 && <p className="texto-suave">Nenhuma empresa demonstrou interesse ainda.</p>}

      <div className="lista-candidatos">
        {interesses.map((interesse) => {
          const podeConversar = ['selecionado', 'aceito', 'recusado'].includes(interesse.status)
          return (
            <div key={interesse.id} style={{ marginBottom: 8 }}>
              <div className="linha-candidato">
                <div>
                  <p className="linha-candidato__nome">
                    {interesse.empresa.razao_social || interesse.empresa.usuario.nome}
                  </p>
                  <p className="linha-candidato__info">
                    {interesse.vaga ? `Vaga: ${interesse.vaga.titulo}` : 'Contato direto'}
                    {interesse.mensagem ? ` — "${interesse.mensagem}"` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Selo variante={ROTULOS_STATUS[interesse.status].variante}>
                    {ROTULOS_STATUS[interesse.status].texto}
                  </Selo>
                  {podeConversar && (
                    <Botao
                      variante="contorno"
                      icone={MessageCircle}
                      onClick={() => setConversaAberta((atual) => (atual === interesse.id ? null : interesse.id))}
                    >
                      {conversaAberta === interesse.id ? 'Fechar conversa' : 'Conversar'}
                    </Botao>
                  )}
                  {(interesse.status === 'pendente' || interesse.status === 'visualizado') && (
                    <>
                      <Botao variante="sucesso" icone={UserCheck} onClick={() => responder(interesse.id, 'selecionado')}>
                        Selecionar
                      </Botao>
                      <Botao variante="contorno" icone={X} onClick={() => responder(interesse.id, 'recusado')}>
                        Recusar
                      </Botao>
                    </>
                  )}
                  {interesse.status === 'selecionado' && (
                    <Botao variante="contorno" icone={X} onClick={() => responder(interesse.id, 'recusado')}>
                      Recusar
                    </Botao>
                  )}
                </div>
              </div>
              {interesse.status === 'selecionado' && (
                <p className="texto-suave" style={{ marginTop: 4 }}>
                  Vocês estão conversando. A decisão final de contratação é da empresa.
                </p>
              )}
              {conversaAberta === interesse.id && (
                <Conversa interesseId={interesse.id} podeEnviar={interesse.status === 'selecionado'} />
              )}
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
