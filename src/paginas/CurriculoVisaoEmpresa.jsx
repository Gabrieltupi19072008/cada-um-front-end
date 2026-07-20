import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ClipboardList, Star, Check } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Botao from '../componentes/Botao'
import Selo from '../componentes/Selo'
import cliente from '../api/cliente'

const ROTULOS_GRAU_TEA = { leve: 'TEA Leve', moderado: 'TEA Moderado', severo: 'TEA Severo' }

function obterIniciais(nome) {
  const partes = nome.trim().split(/\s+/)
  return partes.slice(0, 2).map((parte) => parte[0].toUpperCase()).join('')
}

export default function CurriculoVisaoEmpresa() {
  const { candidatoId } = useParams()
  const navegar = useNavigate()
  const [candidato, setCandidato] = useState(null)
  const [erro, setErro] = useState('')
  const [interesseEnviado, setInteresseEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    cliente
      .get(`/empresas/candidatos/${candidatoId}`)
      .then((resposta) => setCandidato(resposta.data))
      .catch(() => setErro('Não foi possível carregar este currículo'))
  }, [candidatoId])

  async function demonstrarInteresse() {
    setEnviando(true)
    try {
      await cliente.post('/empresas/me/interesses', { candidato_id: Number(candidatoId) })
      setInteresseEnviado(true)
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível enviar o interesse')
    } finally {
      setEnviando(false)
    }
  }

  if (erro) {
    return (
      <Layout tema="empresa">
        <p className="aviso aviso--erro">{erro}</p>
      </Layout>
    )
  }

  if (!candidato) {
    return (
      <Layout tema="empresa">
        <p className="texto-suave">Carregando...</p>
      </Layout>
    )
  }

  return (
    <Layout tema="empresa" largura="largo">
      <Cartao titulo={`Currículo — ${candidato.usuario.nome}`} icone={ClipboardList}>
        <div className="grade-curriculo">
          <div className="curriculo-lateral">
            <div className="avatar-circulo">{obterIniciais(candidato.usuario.nome)}</div>
            <p className="perfil-lateral__nome">{candidato.usuario.nome}</p>
            <p className="perfil-lateral__info">
              {candidato.cidade}
              {candidato.estado ? ` - ${candidato.estado}` : ''}
            </p>
            {candidato.grau_tea && <Selo variante="acento">{ROTULOS_GRAU_TEA[candidato.grau_tea]}</Selo>}
            <h2 style={{ marginTop: 16, fontSize: 13 }}>Habilidades</h2>
            <div className="curriculo-lateral__habilidades">
              {candidato.habilidades.map((habilidade) => (
                <span key={habilidade.id} className="chip">
                  {habilidade.nome}
                </span>
              ))}
              {candidato.habilidades.length === 0 && <p className="texto-suave">Nenhuma informada.</p>}
            </div>
          </div>

          <div>
            <div className="secao-curriculo">
              <h2>Objetivo Profissional</h2>
              <p>{candidato.sobre_mim || 'Não informado.'}</p>
            </div>

            <div className="secao-curriculo">
              <h2>Formação</h2>
              {candidato.formacoes.length === 0 && <p className="texto-suave">Nenhuma formação informada.</p>}
              {candidato.formacoes.map((formacao) => (
                <div className="item-curriculo" key={formacao.id}>
                  <strong>
                    {formacao.curso} — {formacao.instituicao}
                  </strong>
                  <p>
                    {formacao.nivel} · {formacao.ano_inicio || '?'} -{' '}
                    {formacao.em_andamento ? 'em andamento' : formacao.ano_conclusao || '?'}
                  </p>
                </div>
              ))}
            </div>

            <div className="secao-curriculo">
              <h2>Experiência</h2>
              {candidato.experiencias.length === 0 && <p className="texto-suave">Nenhuma experiência informada.</p>}
              {candidato.experiencias.map((experiencia) => (
                <div className="item-curriculo" key={experiencia.id}>
                  <strong>
                    {experiencia.cargo} — {experiencia.empresa}
                  </strong>
                  <p>
                    {experiencia.data_inicio} - {experiencia.emprego_atual ? 'atual' : experiencia.data_fim || '?'}
                  </p>
                </div>
              ))}
            </div>

            <div className="secao-curriculo">
              <h2>Necessidades Especiais</h2>
              <p>{candidato.necessidades_especiais || 'Nenhuma informada.'}</p>
            </div>

            <div className="acoes-form">
              <Botao variante="contorno" icone={ArrowLeft} onClick={() => navegar('/empresa')}>
                Voltar à lista
              </Botao>
              <Botao
                variante="sucesso"
                icone={interesseEnviado ? Check : Star}
                onClick={demonstrarInteresse}
                disabled={enviando || interesseEnviado}
              >
                {interesseEnviado ? 'Interesse enviado!' : enviando ? 'Enviando...' : 'Demonstrar Interesse'}
              </Botao>
            </div>
          </div>
        </div>
      </Cartao>
    </Layout>
  )
}
