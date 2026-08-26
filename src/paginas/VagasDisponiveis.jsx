import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Briefcase, CheckCircle2 } from 'lucide-react'
import Layout from '../componentes/Layout'
import Botao from '../componentes/Botao'
import Selo from '../componentes/Selo'
import cliente from '../api/cliente'

const ROTULOS_MODALIDADE = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' }
const ROTULOS_CONTRATO = { clt: 'CLT', pj: 'PJ', estagio: 'Estágio', temporario: 'Temporário' }

export default function VagasDisponiveis() {
  const [vagas, setVagas] = useState([])
  const [erro, setErro] = useState('')
  const navegar = useNavigate()
  const [candidatadas, setCandidatadas] = useState(new Set())
  const [enviando, setEnviando] = useState(null)
  const [mensagemConfirmacao, setMensagemConfirmacao] = useState(null)

  useEffect(() => {
    cliente
      .get('/candidatos/vagas')
      .then((resposta) => setVagas(resposta.data))
      .catch(() => setErro('Não foi possível carregar as vagas'))
  }, [])

  async function candidatar(vaga) {
    setEnviando(vaga.id)
    try {
      await cliente.post(`/candidatos/vagas/${vaga.id}/candidatar`)
      setCandidatadas((atual) => new Set(atual).add(vaga.id))
      setMensagemConfirmacao(
        `Currículo enviado! A empresa ${vaga.empresa.razao_social || vaga.empresa.usuario.nome} recebeu seu currículo para a vaga ${vaga.titulo}.`
      )
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível enviar sua candidatura')
    } finally {
      setEnviando(null)
    }
  }

  return (
    <Layout largura="largo">
      <Botao variante="contorno" icone={ArrowLeft} onClick={() => navegar('/candidato')} style={{ marginBottom: 16 }}>
        Voltar ao início
      </Botao>

      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {mensagemConfirmacao && <p className="aviso aviso--sucesso">{mensagemConfirmacao}</p>}
      {!erro && vagas.length === 0 && <p className="texto-suave">Nenhuma vaga disponível no momento.</p>}

      <div className="lista-candidatos">
        {vagas.map((vaga) => (
          <div key={vaga.id} className="linha-candidato">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {vaga.empresa.usuario.foto_url && (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    flex: 'none',
                    backgroundImage: `url(${vaga.empresa.usuario.foto_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}
              <div>
                <p className="linha-candidato__nome">
                  <Briefcase size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  {vaga.titulo}
                </p>
                <p className="linha-candidato__info">
                  <span
                    onClick={() => navegar(`/candidato/empresas/${vaga.empresa.id}`)}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {vaga.empresa.razao_social || vaga.empresa.usuario.nome}
                  </span>{' '}
                  · {vaga.cidade || 'Local não informado'} · {ROTULOS_MODALIDADE[vaga.modalidade]} ·{' '}
                  {ROTULOS_CONTRATO[vaga.tipo_contrato]}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Selo variante="acento">{vaga.area || 'Geral'}</Selo>
              {candidatadas.has(vaga.id) ? (
                <Selo variante="sucesso">
                  <CheckCircle2 size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Candidatura enviada
                </Selo>
              ) : (
                <Botao
                  variante="primario"
                  onClick={() => candidatar(vaga)}
                  disabled={enviando === vaga.id}
                >
                  {enviando === vaga.id ? 'Enviando...' : 'Enviar meu currículo'}
                </Botao>
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
