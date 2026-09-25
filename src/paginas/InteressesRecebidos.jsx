import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, UserCheck, X } from 'lucide-react'
import Layout from '../componentes/Layout'
import CabecalhoPagina from '../componentes/CabecalhoPagina'
import Botao from '../componentes/Botao'
import Conversa from '../componentes/Conversa'
import CaixaConversas, { CabecalhoConversa } from '../componentes/CaixaConversas'
import cliente from '../api/cliente'

const ROTULOS_STATUS = {
  pendente: { texto: 'Pendente', variante: 'alerta' },
  visualizado: { texto: 'Visualizado', variante: 'acento' },
  selecionado: { texto: 'Conversando', variante: 'acento' },
  aceito: { texto: 'Aceito', variante: 'sucesso' },
  recusado: { texto: 'Recusado', variante: 'navy' },
}

export default function InteressesRecebidos() {
  const [interesses, setInteresses] = useState([])
  const [erro, setErro] = useState('')
  const [erroResposta, setErroResposta] = useState('')
  const [selecionadoId, setSelecionadoId] = useState(null)
  const navegar = useNavigate()

  function carregar() {
    cliente
      .get('/candidatos/me/interesses')
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
      await cliente.put(`/candidatos/me/interesses/${id}`, { status })
      carregar()
    } catch (erroRequisicao) {
      setErroResposta(erroRequisicao.response?.data?.detail || 'Não foi possível registrar sua resposta. Tente novamente.')
    }
  }

  const selecionado = interesses.find((interesse) => interesse.id === selecionadoId)
  const nomeEmpresa = (interesse) => interesse.empresa.razao_social || interesse.empresa.usuario.nome

  return (
    <Layout largura="largo">
      <CabecalhoPagina
        sobretitulo="EMPRESAS INTERESSADAS"
        titulo="Boas conversas começam aqui"
        descricao="Empresas que encontraram seu perfil e querem conhecer você."
      />

      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {erroResposta && <p className="aviso aviso--erro">{erroResposta}</p>}
      {!erro && interesses.length === 0 && <p className="texto-suave">Nenhuma empresa demonstrou interesse ainda.</p>}

      {interesses.length > 0 && (
        <CaixaConversas
          itens={interesses.map((interesse) => ({
            id: interesse.id,
            nome: nomeEmpresa(interesse),
            fotoUrl: interesse.empresa.usuario.foto_url,
            resumo: interesse.vaga ? `Vaga: ${interesse.vaga.titulo}` : interesse.mensagem || 'Contato direto',
            selo: ROTULOS_STATUS[interesse.status],
          }))}
          selecionadoId={selecionadoId}
          aoSelecionar={setSelecionadoId}
        >
          {selecionado && (
            <>
              <CabecalhoConversa
                nome={nomeEmpresa(selecionado)}
                fotoUrl={selecionado.empresa.usuario.foto_url}
                subtitulo={selecionado.vaga ? `Vaga: ${selecionado.vaga.titulo}` : 'Contato direto'}
                selo={ROTULOS_STATUS[selecionado.status]}
                acoes={
                  <>
                    <Botao
                      variante="contorno"
                      icone={Building2}
                      onClick={() => navegar(`/candidato/empresas/${selecionado.empresa.id}`)}
                    >
                      Ver empresa
                    </Botao>
                    {selecionado.status === 'selecionado' && (
                      <Botao variante="contorno" icone={X} onClick={() => responder(selecionado.id, 'recusado')}>
                        Recusar
                      </Botao>
                    )}
                  </>
                }
              />

              {selecionado.status === 'pendente' || selecionado.status === 'visualizado' ? (
                <div className="conversa-convite">
                  <b>{nomeEmpresa(selecionado)} quer conhecer você!</b>
                  {selecionado.mensagem && <p>“{selecionado.mensagem}”</p>}
                  <p>Se você aceitar, a conversa com a empresa é liberada aqui.</p>
                  <div>
                    <Botao variante="primario" icone={UserCheck} onClick={() => responder(selecionado.id, 'selecionado')}>
                      Aceitar e conversar
                    </Botao>
                    <Botao variante="contorno" icone={X} onClick={() => responder(selecionado.id, 'recusado')}>
                      Recusar
                    </Botao>
                  </div>
                </div>
              ) : (
                <Conversa interesseId={selecionado.id} podeEnviar={selecionado.status === 'selecionado'} />
              )}
            </>
          )}
        </CaixaConversas>
      )}
    </Layout>
  )
}
