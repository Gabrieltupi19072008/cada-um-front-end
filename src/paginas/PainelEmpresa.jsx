import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, BarChart3, Briefcase, Mail, ShieldCheck, UserCheck } from 'lucide-react'
import Layout from '../componentes/Layout'
import CabecalhoPagina from '../componentes/CabecalhoPagina'
import Metrica from '../componentes/Metrica'
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

const ROTULOS_STATUS = {
  pendente: { texto: 'Nova', variante: 'sucesso' },
  visualizado: { texto: 'Visualizada', variante: 'acento' },
  selecionado: { texto: 'Selecionado', variante: 'acento' },
  aceito: { texto: 'Aceito', variante: 'sucesso' },
  recusado: { texto: 'Recusado', variante: 'navy' },
}

function obterIniciais(nome) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')
}

export default function PainelEmpresa() {
  const [perfil, setPerfil] = useState(null)
  const [vagas, setVagas] = useState([])
  const [candidaturas, setCandidaturas] = useState([])
  const [interesses, setInteresses] = useState([])
  const [cota, setCota] = useState(null)
  const [erro, setErro] = useState('')
  const [parametros] = useSearchParams()
  const { recarregarUsuario } = useAuth()
  const navegar = useNavigate()

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
    cliente.get('/empresas/me/interesses').then((resposta) => setInteresses(resposta.data)).catch(() => {})
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
        <section className="painel">
          <secao.Componente />
        </section>
      </Layout>
    )
  }

  const nomeEmpresa = perfil.razao_social || perfil.usuario.nome
  const vagasAtivas = vagas.filter((vaga) => vaga.ativa).length
  const candidaturasNovas = candidaturas.filter((c) => c.status === 'pendente').length

  return (
    <Layout tema="empresa" largura="largo">
      {!perfil.aprovada && (
        <p className="aviso aviso--erro">
          Sua empresa ainda está aguardando aprovação do administrador. Algumas ações ficam bloqueadas até lá.
        </p>
      )}

      <section className="boas-vindas">
        <div>
          <span className="sobretitulo">PAINEL DA EMPRESA</span>
          <h1>Olá, {nomeEmpresa}!</h1>
          <p>Encontre talentos únicos e acompanhe seus processos seletivos.</p>
        </div>
        <button type="button" className="acao-destaque" onClick={() => navegar('/empresa/vagas/nova')}>
          <Briefcase size={20} /> Publicar nova vaga
        </button>
      </section>

      <div className="grade-metricas">
        <Metrica
          icone={Briefcase}
          valor={vagasAtivas}
          rotulo="Vagas ativas"
          detalhe={`${vagas.length} no total`}
          aoClicar={() => navegar('/empresa?secao=vagas')}
        />
        <Metrica
          icone={UserCheck}
          valor={candidaturas.length}
          rotulo="Candidaturas recebidas"
          detalhe={`${candidaturasNovas} nova(s)`}
          aoClicar={() => navegar('/empresa?secao=candidaturas')}
        />
        <Metrica
          icone={Mail}
          valor={interesses.length}
          rotulo="Interesses enviados"
          detalhe="Candidatos contatados"
          aoClicar={() => navegar('/empresa?secao=interesses')}
        />
        <Metrica
          icone={BarChart3}
          valor={cota && cota.vagas_necessarias > 0 ? `${cota.percentual_cumprido}%` : '—'}
          rotulo="Meta de inclusão"
          detalhe={
            cota && cota.vagas_necessarias > 0
              ? `${cota.aceitos} de ${cota.vagas_necessarias} vagas da cota`
              : 'Informe o nº de funcionários'
          }
          destaque
          aoClicar={() => navegar('/empresa?secao=cota')}
        />
      </div>

      <div className="grade-conteudo">
        <section className="painel">
          <header className="painel-titulo">
            <div>
              <h2>Candidaturas recentes</h2>
              <p>Talentos que demonstraram interesse</p>
            </div>
            <button type="button" onClick={() => navegar('/empresa?secao=candidaturas')}>
              Ver todas <ArrowRight size={16} />
            </button>
          </header>
          {candidaturas.length === 0 && <p className="texto-suave">Nenhuma candidatura recebida ainda.</p>}
          {candidaturas.slice(0, 4).map((candidatura) => (
            <div className="linha-pessoa" key={candidatura.id}>
              <span className="linha-pessoa__avatar">{obterIniciais(candidatura.candidato.usuario.nome)}</span>
              <div>
                <b>{candidatura.candidato.usuario.nome}</b>
                <p>{candidatura.vaga ? candidatura.vaga.titulo : 'Candidatura direta'}</p>
              </div>
              <Selo variante={ROTULOS_STATUS[candidatura.status].variante}>
                {ROTULOS_STATUS[candidatura.status].texto}
              </Selo>
              <button type="button" onClick={() => navegar(`/empresa/candidatos/${candidatura.candidato.id}`)}>
                Ver perfil
              </button>
            </div>
          ))}
        </section>

        <aside className="painel">
          <header className="painel-titulo">
            <div>
              <h2>Sua empresa</h2>
              <p>{perfil.aprovada ? 'Empresa aprovada' : 'Aguardando aprovação'}</p>
            </div>
          </header>
          <div className="perfil-resumo">
            <SeletorFoto
              fotoUrl={perfil.usuario.foto_url}
              nome={perfil.usuario.nome}
              aoAtualizar={() => {
                carregar()
                recarregarUsuario()
              }}
              tamanho={72}
            />
            <b>{nomeEmpresa}</b>
            <p>
              {perfil.setor || 'Setor não informado'}
              {perfil.cidade ? ` · ${perfil.cidade}` : ''}
            </p>
          </div>
          <div className="nota-cota">
            <span>
              <ShieldCheck size={20} />
            </span>
            <div>
              <b>Compromisso com inclusão</b>
              <p>Acompanhe no relatório de cota quantas contratações PcD sua empresa já fez pela plataforma.</p>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  )
}
