import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
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
  const [conversaAberta, setConversaAberta] = useState(null)

  useEffect(() => {
    cliente
      .get('/empresas/me/interesses')
      .then((resposta) => setInteresses(resposta.data))
      .catch(() => setErro('Não foi possível carregar os interesses'))
  }, [])

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Interesses enviados</h2>
      {erro && <p className="aviso aviso--erro">{erro}</p>}
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
