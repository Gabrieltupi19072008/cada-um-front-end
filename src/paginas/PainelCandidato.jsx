import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, ChevronRight, Circle, Heart, Send } from 'lucide-react'
import Layout from '../componentes/Layout'
import AnelProgresso from '../componentes/AnelProgresso'
import Destaque, { Atalho, IconeDestaque } from '../componentes/Destaque'
import cliente from '../api/cliente'
import { calcularPercentualPerfil, partesPerfil } from '../dados/percentualPerfil'

const ROTULOS_MODALIDADE = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' }
const ROTULOS_CONTRATO = { clt: 'CLT', pj: 'PJ', estagio: 'Estágio', temporario: 'Temporário' }
const CORES_LOGO = ['#6652c5', '#c2410c', '#2f7d3b', '#1d5fa8']

function dataDeHoje() {
  return new Date()
    .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    .toUpperCase()
}

function nomeDaEmpresa(empresa) {
  return empresa.razao_social || empresa.usuario.nome
}

export default function PainelCandidato() {
  const [perfil, setPerfil] = useState(null)
  const [vagas, setVagas] = useState([])
  const [candidaturas, setCandidaturas] = useState([])
  const [interesses, setInteresses] = useState([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    cliente
      .get('/candidatos/me')
      .then((resposta) => setPerfil(resposta.data))
      .catch(() => setErro('Não foi possível carregar seu perfil'))
    // Complementares: se algum falhar, o Início continua funcionando.
    cliente.get('/candidatos/vagas').then((resposta) => setVagas(resposta.data)).catch(() => {})
    cliente.get('/candidatos/me/candidaturas').then((resposta) => setCandidaturas(resposta.data)).catch(() => {})
    cliente.get('/candidatos/me/interesses').then((resposta) => setInteresses(resposta.data)).catch(() => {})
  }, [])

  if (erro) {
    return (
      <Layout largura="inicio">
        <p className="aviso aviso--erro">{erro}</p>
      </Layout>
    )
  }

  if (!perfil) {
    return (
      <Layout largura="inicio">
        <p className="texto-suave">Carregando...</p>
      </Layout>
    )
  }

  const primeiroNome = perfil.usuario.nome.split(' ')[0]
  const percentual = calcularPercentualPerfil(perfil)
  const faltando = partesPerfil(perfil).filter((parte) => !parte.feito)
  const interesseNovo = interesses.find((i) => ['pendente', 'visualizado'].includes(i.status))
  const emAndamento = candidaturas.filter((c) => ['pendente', 'visualizado', 'selecionado'].includes(c.status))

  const destaqueCurriculo = (
    <Destaque
      visual={<AnelProgresso valor={percentual} tamanho={92} />}
      sobretitulo="SEU PRÓXIMO PASSO"
      titulo="Complete seu currículo"
      texto={`Currículos completos aparecem mais nas buscas das empresas. ${
        faltando.length === 1 ? 'Falta 1 parte:' : `Faltam ${faltando.length} partes:`
      }`}
      acao={{ rotulo: 'Continuar currículo', para: '/candidato/curriculo' }}
    >
      <div className="partes-faltando">
        {faltando.map((parte) => (
          <span key={parte.rotulo}>
            <Circle size={14} /> {parte.rotulo}
          </span>
        ))}
      </div>
    </Destaque>
  )

  let principal
  let secundario = null
  let subtitulo = 'Veja o que fazer agora e as vagas que combinam com você.'

  if (interesseNovo) {
    const outros = interesses.filter((i) => ['pendente', 'visualizado'].includes(i.status)).length - 1
    subtitulo = 'Você tem uma resposta esperando.'
    principal = (
      <Destaque
        tom="novidade"
        visual={<IconeDestaque icone={Heart} />}
        sobretitulo="NOVIDADE PARA VOCÊ"
        titulo={`A ${nomeDaEmpresa(interesseNovo.empresa)} quer conhecer você`}
        texto={
          (interesseNovo.mensagem ? `“${interesseNovo.mensagem}”` : 'Veja o contato e decida se quer conversar.') +
          (outros > 0 ? ` E mais ${outros} empresa(s) esperando sua resposta.` : '')
        }
        acao={{ rotulo: 'Ver e responder', para: '/candidato/interesses' }}
      />
    )
    if (percentual < 100) {
      secundario = (
        <Atalho
          para="/candidato/curriculo"
          visual={<AnelProgresso valor={percentual} tamanho={44} />}
          titulo="Depois: complete seu currículo"
          texto={`Falta: ${faltando.map((parte) => parte.rotulo.toLowerCase()).join(', ')}`}
        />
      )
    }
  } else if (percentual < 100) {
    principal = destaqueCurriculo
  } else if (candidaturas.length === 0) {
    principal = (
      <Destaque
        visual={<IconeDestaque icone={Briefcase} />}
        sobretitulo="SEU PRÓXIMO PASSO"
        titulo="Candidate-se a uma vaga"
        texto="Seu currículo está completo. Agora é só escolher uma vaga e enviar."
        acao={{ rotulo: 'Ver vagas', para: '/candidato/vagas' }}
      />
    )
  } else {
    principal = (
      <Destaque
        visual={<IconeDestaque icone={Send} />}
        sobretitulo="ACOMPANHE"
        titulo={
          emAndamento.length === 1 ? '1 candidatura em andamento' : `${emAndamento.length} candidaturas em andamento`
        }
        texto="Quando uma empresa selecionar você, a conversa é liberada nas suas candidaturas."
        acao={{ rotulo: 'Ver candidaturas', para: '/candidato/candidaturas' }}
      />
    )
  }

  return (
    <Layout largura="inicio">
      <div className="inicio">
        <header className="saudacao">
          <span>{dataDeHoje()}</span>
          <h1>Olá, {primeiroNome}!</h1>
          <p>{subtitulo}</p>
        </header>

        {principal}
        {secundario}

        <section className="painel lista-inicio">
          <header>
            <h2>Vagas para você</h2>
            {vagas.length > 0 && (
              <Link to="/candidato/vagas">
                {vagas.length === 1 ? 'Ver a vaga →' : `Ver as ${vagas.length} vagas →`}
              </Link>
            )}
          </header>
          {vagas.length === 0 && <p className="texto-suave">Nenhuma vaga disponível no momento.</p>}
          {vagas.slice(0, 3).map((vaga, indice) => {
            const nomeEmpresa = nomeDaEmpresa(vaga.empresa)
            return (
              <Link to="/candidato/vagas" className="linha-vaga" key={vaga.id}>
                <span className="logo-empresa" style={{ background: CORES_LOGO[indice % CORES_LOGO.length] }}>
                  {nomeEmpresa[0].toUpperCase()}
                </span>
                <div>
                  <small>{nomeEmpresa}</small>
                  <b>{vaga.titulo}</b>
                  <small>
                    {[ROTULOS_MODALIDADE[vaga.modalidade], vaga.cidade, ROTULOS_CONTRATO[vaga.tipo_contrato]]
                      .filter(Boolean)
                      .join(' · ')}
                  </small>
                </div>
                <ChevronRight size={20} />
              </Link>
            )
          })}
        </section>
      </div>
    </Layout>
  )
}
