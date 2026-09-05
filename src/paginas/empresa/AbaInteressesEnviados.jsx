import { useEffect, useState } from 'react'
import { Check, X, MessageCircle } from 'lucide-react'
import cliente from '../../api/cliente'
import Selo from '../../componentes/Selo'
import Botao from '../../componentes/Botao'
import Conversa from '../../componentes/Conversa'

const ROTULOS_STATUS = {
  pendente: { texto: 'Pendente', variante: 'alerta' },
  visualizado: { texto: 'Visualizado', variante: 'acento' },
  selecionado: { texto: 'Selecionado', variante: 'acento' },
  aceito: { texto: 'Aceito', variante: 'sucesso' },
  recusado: { texto: 'Recusado', variante: 'navy' },
}

export default function AbaInteressesEnviados() {
  const [interesses, setInteresses] = useState([])
  const [erro, setErro] = useState('')
  const [erroResposta, setErroResposta] = useState('')
  const [conversaAberta, setConversaAberta] = useState(null)

  function carregar() {
    cliente
      .get('/empresas/me/interesses')
      .then((resposta) => setInteresses(resposta.data))
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

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Interesses enviados</h2>
      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {erroResposta && <p className="aviso aviso--erro">{erroResposta}</p>}
      {interesses.length === 0 && !erro && (
        <p className="texto-suave">Você ainda não demonstrou interesse em nenhum candidato.</p>
      )}
      <div className="lista-candidatos">
        {interesses.map((interesse) => {
          const podeConversar = ['selecionado', 'aceito', 'recusado'].includes(interesse.status)
          return (
            <div key={interesse.id} style={{ marginBottom: 8 }}>
              <div className="linha-candidato">
                <div>
                  <p className="linha-candidato__nome">{interesse.candidato.usuario.nome}</p>
                  <p className="linha-candidato__info">{interesse.mensagem || 'Sem mensagem'}</p>
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
                  {interesse.status === 'selecionado' && (
                    <>
                      <Botao variante="sucesso" icone={Check} onClick={() => responder(interesse.id, 'aceito')}>
                        Aceitar
                      </Botao>
                      <Botao variante="contorno" icone={X} onClick={() => responder(interesse.id, 'recusado')}>
                        Recusar
                      </Botao>
                    </>
                  )}
                </div>
              </div>
              {conversaAberta === interesse.id && (
                <Conversa interesseId={interesse.id} podeEnviar={interesse.status === 'selecionado'} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
