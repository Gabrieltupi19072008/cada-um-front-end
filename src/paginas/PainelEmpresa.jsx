import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BarChart3, Briefcase, Plus, Search, UserCheck } from 'lucide-react'
import Layout from '../componentes/Layout'
import CabecalhoPagina from '../componentes/CabecalhoPagina'
import Destaque, { Atalho, IconeDestaque } from '../componentes/Destaque'
import Selo from '../componentes/Selo'
import SeletorFoto from '../componentes/SeletorFoto'
import cliente from '../api/cliente'
import { useAuth } from '../contexto/AuthContext'
import AbaDescricao from './empresa/AbaDescricao'
import AbaBuscarCandidatos from './empresa/AbaBuscarCandidatos'
import AbaMinhasVagas from './empresa/AbaMinhasVagas'
import AbaInteressesEnviados from './empresa/AbaInteressesEnviados'
import AbaCandidaturasRecebidas from './empresa/AbaCandidaturasRecebidas'
import AbaRelatorioCota from './empresa/AbaRelatorioCota'

const SECOES = [
  {
    chave: 'descricao',
    sobretitulo: 'PERFIL DA EMPRESA',
    rotulo: 'Sobre a empresa',
    descricao: 'Escreva um texto que o candidato vê ao clicar no nome da sua empresa.',
    Componente: AbaDescricao,
  },
  {
    chave: 'buscar',
    sobretitulo: 'TALENTOS',
    rotulo: 'Buscar candidatos',
    descricao: 'Encontre candidatos pelo perfil, cidade e habilidades.',
    Componente: AbaBuscarCandidatos,
  },
  {
    chave: 'vagas',
    sobretitulo: 'GERENCIAR VAGAS',
    rotulo: 'Minhas vagas',
    descricao: 'Publique e gerencie as oportunidades da sua empresa.',
    Componente: AbaMinhasVagas,
  },
  {
    chave: 'interesses',
    sobretitulo: 'CONTATOS',
    rotulo: 'Interesses enviados',
    descricao: 'Acompanhe os candidatos que você contatou.',
    Componente: AbaInteressesEnviados,
  },
  {
    chave: 'candidaturas',
    sobretitulo: 'CANDIDATURAS RECEBIDAS',
    rotulo: 'Acompanhe os processos',
    descricao: 'Veja quem se candidatou às suas vagas.',
    Componente: AbaCandidaturasRecebidas,
  },
  {
    chave: 'cota',
    sobretitulo: 'LEI DE COTAS',
    rotulo: 'Relatório de cota',
    descricao: 'Acompanhe sua meta de contratações PcD.',
    Componente: AbaRelatorioCota,
  },
]

const ROTULOS_MODALIDADE = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' }
const ROTULOS_CONTRATO = { clt: 'CLT', pj: 'PJ', estagio: 'Estágio', temporario: 'Temporário' }

export default function PainelEmpresa() {
  const [perfil, setPerfil] = useState(null)
  const [vagas, setVagas] = useState([])
  const [candidaturas, setCandidaturas] = useState([])
  const [cota, setCota] = useState(null)
  const [erro, setErro] = useState('')
  const [parametros] = useSearchParams()
  const { recarregarUsuario } = useAuth()

  const secao = SECOES.find((item) => item.chave === parametros.get('secao'))

  function carregar() {
    cliente
      .get('/empresas/me')
      .then((resposta) => setPerfil(resposta.data))
      .catch(() => setErro('Não foi possível carregar seu perfil'))
  }

  useEffect(() => {
    carregar()
  }, [])

  useEffect(() => {
    if (secao) return
    // Números do painel: complementares, então falhas aqui não bloqueiam a tela.
    cliente.get('/empresas/me/vagas').then((resposta) => setVagas(resposta.data)).catch(() => {})
    cliente.get('/empresas/me/candidaturas').then((resposta) => setCandidaturas(resposta.data)).catch(() => {})
    cliente.get('/empresas/me/cota').then((resposta) => setCota(resposta.data)).catch(() => {})
  }, [secao])

  if (erro) {
    return (
      <Layout tema="empresa" largura="largo">
        <p className="aviso aviso--erro">{erro}</p>
      </Layout>
    )
  }

  if (!perfil) {
    return (
      <Layout tema="empresa" largura="largo">
        <p className="texto-suave">Carregando...</p>
      </Layout>
    )
  }

  if (secao) {
    return (
      <Layout tema="empresa" largura="largo">
        <CabecalhoPagina sobretitulo={secao.sobretitulo} titulo={secao.rotulo} descricao={secao.descricao} />
        {secao.chave === 'descricao' && (
          <section className="painel foto-empresa">
            <SeletorFoto
              fotoUrl={perfil.usuario.foto_url}
              nome={perfil.usuario.nome}
              aoAtualizar={() => {
                carregar()
                recarregarUsuario()
              }}
              tamanho={72}
            />
            <div>
              <b>Logo ou foto da empresa</b>
              <p>Aparece para os candidatos junto com o nome da empresa.</p>
            </div>
          </section>
        )}
        <section className="painel">
          <secao.Componente />
        </section>
      </Layout>
    )
  }

  const nomeEmpresa = perfil.razao_social || perfil.usuario.nome
  const vagasAtivas = vagas.filter((vaga) => vaga.ativa)
  const novas = candidaturas.filter((c) => ['pendente', 'visualizado'].includes(c.status))
  const candidaturasPorVaga = (vagaId) => candidaturas.filter((c) => c.vaga?.id === vagaId).length

  let principal
  let subtitulo = 'Encontre talentos únicos e acompanhe seus processos seletivos.'
  if (novas.length > 0) {
    const primeira = novas[0]
    subtitulo = 'Você tem candidaturas esperando resposta.'
    principal = (
      <Destaque
        tom="acento"
        visual={<IconeDestaque icone={UserCheck} />}
        sobretitulo="NOVIDADE PARA VOCÊ"
        titulo={`${primeira.candidato.usuario.nome} se candidatou`}
        texto={
          [
            primeira.vaga ? `Vaga: ${primeira.vaga.titulo}` : 'Candidatura direta',
            novas.length > 1 && `mais ${novas.length - 1} candidatura(s) nova(s) esperando resposta`,
          ]
            .filter(Boolean)
            .join(' · ')
        }
        acao={{ rotulo: 'Ver candidatura', para: '/empresa?secao=candidaturas' }}
      />
    )
  } else if (vagasAtivas.length === 0) {
    principal = (
      <Destaque
        visual={<IconeDestaque icone={Briefcase} />}
        sobretitulo="SEU PRÓXIMO PASSO"
        titulo="Publique uma vaga"
        texto="Com uma vaga aberta, candidatos podem enviar o currículo direto para você."
        acao={{ rotulo: 'Publicar vaga', para: '/empresa/vagas/nova' }}
      />
    )
  } else {
    principal = (
      <Destaque
        visual={<IconeDestaque icone={Search} />}
        sobretitulo="SEU PRÓXIMO PASSO"
        titulo="Encontre novos talentos"
        texto="Busque candidatos pelo perfil, cidade e habilidades e demonstre interesse."
        acao={{ rotulo: 'Buscar candidatos', para: '/empresa?secao=buscar' }}
      />
    )
  }

  const temCota = cota && cota.vagas_necessarias > 0
  const faltamCota = temCota ? Math.max(0, cota.vagas_necessarias - cota.aceitos) : 0

  return (
    <Layout tema="empresa" largura="inicio">
      <div className="inicio">
        {!perfil.aprovada && (
          <p className="aviso aviso--erro">
            Sua empresa ainda está aguardando aprovação do administrador. Algumas ações ficam bloqueadas até lá.
          </p>
        )}

        <header className="saudacao">
          <span>PAINEL DA EMPRESA</span>
          <h1>Olá, {nomeEmpresa}!</h1>
          <p>{subtitulo}</p>
        </header>

        {principal}

        <Atalho
          para="/empresa?secao=cota"
          visual={
            <span className="atalho__icone">
              <BarChart3 size={20} />
            </span>
          }
          titulo={
            temCota
              ? `Lei de Cotas: ${cota.aceitos} de ${cota.vagas_necessarias} contratações PcD`
              : 'Lei de Cotas'
          }
          texto={
            temCota
              ? faltamCota > 0
                ? `Faltam ${faltamCota} contratação(ões) para cumprir a cota (empresa com ${cota.total_funcionarios} funcionários).`
                : 'Sua empresa cumpre a cota legal. Parabéns!'
              : 'Informe o número de funcionários para calcular sua cota.'
          }
        >
          {temCota && (
            <div className="atalho__barra">
              <div style={{ width: `${Math.min(100, cota.percentual_cumprido)}%` }} />
            </div>
          )}
        </Atalho>

        <section className="painel lista-inicio">
          <header>
            <h2>Suas vagas abertas</h2>
            <Link to="/empresa?secao=vagas">Ver todas →</Link>
          </header>
          {vagasAtivas.length === 0 && <p className="texto-suave">Nenhuma vaga aberta no momento.</p>}
          {vagasAtivas.slice(0, 4).map((vaga) => {
            const total = candidaturasPorVaga(vaga.id)
            return (
              <div className="linha-pessoa" key={vaga.id}>
                <span className="linha-pessoa__avatar">
                  <Briefcase size={19} />
                </span>
                <div>
                  <b>{vaga.titulo}</b>
                  <p>
                    {[ROTULOS_MODALIDADE[vaga.modalidade], vaga.cidade, ROTULOS_CONTRATO[vaga.tipo_contrato]]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <Selo variante={total > 0 ? 'sucesso' : 'navy'}>
                  {total === 0 ? 'Nenhuma ainda' : total === 1 ? '1 candidatura' : `${total} candidaturas`}
                </Selo>
                <Link to="/empresa?secao=candidaturas" className="botao botao--contorno">
                  Ver candidatos
                </Link>
              </div>
            )
          })}
          <div className="lista-inicio__rodape">
            <Link to="/empresa/vagas/nova" className="botao botao--primario">
              <Plus size={16} /> Publicar nova vaga
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  )
}
