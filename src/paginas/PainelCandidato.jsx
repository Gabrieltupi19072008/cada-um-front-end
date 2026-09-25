import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Heart,
  Send,
  Sparkles,
} from 'lucide-react'
import Layout from '../componentes/Layout'
import AnelProgresso from '../componentes/AnelProgresso'
import Metrica from '../componentes/Metrica'
import cliente from '../api/cliente'
import { calcularPercentualPerfil } from '../dados/percentualPerfil'

const ROTULOS_MODALIDADE = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' }
const ROTULOS_CONTRATO = { clt: 'CLT', pj: 'PJ', estagio: 'Estágio', temporario: 'Temporário' }
const CORES_LOGO = ['#745eea', '#ff755f', '#55a96b', '#efb340']

function dataDeHoje() {
  return new Date()
    .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    .toUpperCase()
}

export default function PainelCandidato() {
  const [perfil, setPerfil] = useState(null)
  const [vagas, setVagas] = useState([])
  const [candidaturas, setCandidaturas] = useState([])
  const [interesses, setInteresses] = useState([])
  const [erro, setErro] = useState('')
  const navegar = useNavigate()

  useEffect(() => {
    cliente
      .get('/candidatos/me')
      .then((resposta) => setPerfil(resposta.data))
      .catch(() => setErro('Não foi possível carregar seu perfil'))
    // Os números do painel são complementares: se algum falhar, o painel continua funcionando.
    cliente.get('/candidatos/vagas').then((resposta) => setVagas(resposta.data)).catch(() => {})
    cliente.get('/candidatos/me/candidaturas').then((resposta) => setCandidaturas(resposta.data)).catch(() => {})
    cliente.get('/candidatos/me/interesses').then((resposta) => setInteresses(resposta.data)).catch(() => {})
  }, [])

  if (erro) {
    return (
      <Layout largura="largo">
        <p className="aviso aviso--erro">{erro}</p>
      </Layout>
    )
  }

  if (!perfil) {
    return (
      <Layout largura="largo">
        <p className="texto-suave">Carregando...</p>
      </Layout>
    )
  }

  const primeiroNome = perfil.usuario.nome.split(' ')[0]
  const percentual = calcularPercentualPerfil(perfil)
  const emAndamento = candidaturas.filter((c) => ['pendente', 'visualizado', 'selecionado'].includes(c.status)).length
  const interessesNovos = interesses.filter((i) => i.status === 'pendente').length

  const passos = [
    {
      icone: FileText,
      titulo: 'Complete seu currículo',
      texto: 'Adicione suas experiências e habilidades',
      feito: percentual === 100,
      para: '/candidato/curriculo',
    },
    {
      icone: GraduationCap,
      titulo: 'Veja uma orientação',
      texto: 'Prepare-se para entrevistas',
      feito: false,
      para: '/candidato/orientacao',
    },
    {
      icone: Briefcase,
      titulo: 'Candidate-se a uma vaga',
      texto: 'Encontre a oportunidade ideal',
      feito: candidaturas.length > 0,
      para: '/candidato/vagas',
    },
  ]

  return (
    <Layout largura="largo">
      <section className="boas-vindas">
        <div>
          <span className="sobretitulo">{dataDeHoje()}</span>
          <h1>
            Olá, {primeiroNome}! <span>Que bom ter você aqui.</span>
          </h1>
          <p>Seu próximo passo profissional pode estar mais perto do que imagina.</p>
        </div>
        <div className="progresso-perfil">
          <AnelProgresso valor={percentual} />
          <div>
            <small>SEU PERFIL</small>
            <b>{percentual === 100 ? 'Está completo!' : 'Está quase completo!'}</b>
            <p>{percentual === 100 ? 'Mantenha seus dados atualizados.' : 'Complete para aumentar suas chances.'}</p>
          </div>
          <button type="button" onClick={() => navegar('/candidato/curriculo')}>
            {percentual === 100 ? 'Ver currículo' : 'Completar perfil'} <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <div className="grade-metricas">
        <Metrica
          icone={Briefcase}
          valor={vagas.length}
          rotulo="Vagas disponíveis"
          detalhe="De empresas parceiras"
          aoClicar={() => navegar('/candidato/vagas')}
        />
        <Metrica
          icone={Send}
          valor={candidaturas.length}
          rotulo="Candidaturas enviadas"
          detalhe={`${emAndamento} em andamento`}
          aoClicar={() => navegar('/candidato/candidaturas')}
        />
        <Metrica
          icone={perfil.visivel_para_empresas ? Eye : EyeOff}
          valor={perfil.visivel_para_empresas ? 'Visível' : 'Oculto'}
          rotulo="Perfil para empresas"
          detalhe="Gerenciar privacidade"
          aoClicar={() => navegar('/candidato/privacidade')}
        />
        <Metrica
          icone={Heart}
          valor={interesses.length}
          rotulo="Empresas interessadas"
          detalhe={interessesNovos > 0 ? `${interessesNovos} novo(s) contato(s)` : 'Nenhum contato novo'}
          destaque
          aoClicar={() => navegar('/candidato/interesses')}
        />
      </div>

      <div className="grade-conteudo">
        <section className="painel">
          <header className="painel-titulo">
            <div>
              <h2>Vagas recomendadas para você</h2>
              <p>As oportunidades mais recentes das empresas parceiras</p>
            </div>
            <button type="button" onClick={() => navegar('/candidato/vagas')}>
              Ver todas <ArrowRight size={16} />
            </button>
          </header>
          {vagas.length === 0 && <p className="texto-suave">Nenhuma vaga disponível no momento.</p>}
          {vagas.slice(0, 3).map((vaga, indice) => {
            const nomeEmpresa = vaga.empresa.razao_social || vaga.empresa.usuario.nome
            return (
              <button type="button" className="linha-vaga" key={vaga.id} onClick={() => navegar('/candidato/vagas')}>
                <span className="logo-empresa" style={{ background: CORES_LOGO[indice % CORES_LOGO.length] }}>
                  {nomeEmpresa[0].toUpperCase()}
                </span>
                <div>
                  <small>{nomeEmpresa}</small>
                  <b>{vaga.titulo}</b>
                  <p>
                    <i>{ROTULOS_MODALIDADE[vaga.modalidade]}</i>
                    {vaga.cidade && <i>{vaga.cidade}</i>}
                    <i>{ROTULOS_CONTRATO[vaga.tipo_contrato]}</i>
                  </p>
                </div>
                <ChevronRight size={20} />
              </button>
            )
          })}
        </section>

        <aside className="painel">
          <header className="painel-titulo">
            <div>
              <h2>Próximos passos</h2>
              <p>Continue evoluindo</p>
            </div>
          </header>
          {passos.map((passo) => (
            <button type="button" className="passo" key={passo.titulo} onClick={() => navegar(passo.para)}>
              <span className={passo.feito ? 'feito' : ''}>
                {passo.feito ? <Check size={19} /> : <passo.icone size={19} />}
              </span>
              <div>
                <b>{passo.titulo}</b>
                <p>{passo.texto}</p>
              </div>
              <ChevronRight size={17} />
            </button>
          ))}
          <div className="dica">
            <Sparkles size={20} />
            <div>
              <b>Dica para você</b>
              <p>Perfis completos chamam mais atenção das empresas.</p>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  )
}
