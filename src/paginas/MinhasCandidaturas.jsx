import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import Layout from '../componentes/Layout'
import CabecalhoPagina from '../componentes/CabecalhoPagina'
import Botao from '../componentes/Botao'
import Conversa from '../componentes/Conversa'
import CaixaConversas, { CabecalhoConversa, ConversaBloqueada } from '../componentes/CaixaConversas'
import cliente from '../api/cliente'

const ROTULOS_STATUS = {
  pendente: { texto: 'Em análise', variante: 'alerta' },
  visualizado: { texto: 'Em análise', variante: 'alerta' },
  selecionado: { texto: 'Selecionado(a)!', variante: 'acento' },
  aceito: { texto: 'Aceita', variante: 'sucesso' },
  recusado: { texto: 'Não seguiu', variante: 'navy' },
}

export default function MinhasCandidaturas() {
  const [candidaturas, setCandidaturas] = useState([])
  const [erro, setErro] = useState('')
  const [selecionadoId, setSelecionadoId] = useState(null)
  const navegar = useNavigate()

  useEffect(() => {
    cliente
      .get('/candidatos/me/candidaturas')
      .then((resposta) => {
        setCandidaturas(resposta.data)
        setSelecionadoId(resposta.data[0]?.id ?? null)
      })
      .catch(() => setErro('Não foi possível carregar suas candidaturas'))
  }, [])

  const selecionada = candidaturas.find((candidatura) => candidatura.id === selecionadoId)
  const nomeEmpresa = (candidatura) => candidatura.empresa.razao_social || candidatura.empresa.usuario.nome

  return (
    <Layout largura="largo">
      <CabecalhoPagina
        sobretitulo="MINHAS CANDIDATURAS"
        titulo="Acompanhe cada oportunidade"
        descricao="Veja com clareza em que etapa está cada processo."
      />

      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {!erro && candidaturas.length === 0 && (
        <p className="texto-suave">Você ainda não se candidatou a nenhuma vaga.</p>
      )}

      {candidaturas.length > 0 && (
        <CaixaConversas
          itens={candidaturas.map((candidatura) => ({
            id: candidatura.id,
            nome: nomeEmpresa(candidatura),
            fotoUrl: candidatura.empresa.usuario.foto_url,
            resumo: candidatura.vaga ? candidatura.vaga.titulo : 'Vaga',
            selo: ROTULOS_STATUS[candidatura.status],
          }))}
          selecionadoId={selecionadoId}
          aoSelecionar={setSelecionadoId}
        >
          {selecionada && (
            <>
              <CabecalhoConversa
                nome={nomeEmpresa(selecionada)}
                fotoUrl={selecionada.empresa.usuario.foto_url}
                subtitulo={selecionada.vaga ? `Vaga: ${selecionada.vaga.titulo}` : 'Vaga'}
                selo={ROTULOS_STATUS[selecionada.status]}
                acoes={
                  <Botao
                    variante="contorno"
                    icone={Building2}
                    onClick={() => navegar(`/candidato/empresas/${selecionada.empresa.id}`)}
                  >
                    Ver empresa
                  </Botao>
                }
              />
              {['selecionado', 'aceito', 'recusado'].includes(selecionada.status) ? (
                <Conversa interesseId={selecionada.id} podeEnviar={selecionada.status === 'selecionado'} />
              ) : (
                <ConversaBloqueada
                  titulo="Sua candidatura está em análise"
                  texto="Quando a empresa selecionar você, a conversa é liberada aqui."
                />
              )}
            </>
          )}
        </CaixaConversas>
      )}
    </Layout>
  )
}
