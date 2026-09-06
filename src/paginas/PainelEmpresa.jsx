import { useEffect, useState } from 'react'
import { Building2, Search, Folder, Bell, BarChart2, LogOut, UserCheck, ArrowLeft } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Botao from '../componentes/Botao'
import SeletorFoto from '../componentes/SeletorFoto'
import cliente from '../api/cliente'
import { useAuth } from '../contexto/AuthContext'
import AbaBuscarCandidatos from './empresa/AbaBuscarCandidatos'
import AbaMinhasVagas from './empresa/AbaMinhasVagas'
import AbaInteressesEnviados from './empresa/AbaInteressesEnviados'
import AbaCandidaturasRecebidas from './empresa/AbaCandidaturasRecebidas'
import AbaRelatorioCota from './empresa/AbaRelatorioCota'

const SECOES = [
  {
    chave: 'buscar',
    rotulo: 'Buscar Candidatos',
    descricao: 'Encontre candidatos pelo perfil, cidade e habilidades',
    icone: Search,
    Componente: AbaBuscarCandidatos,
  },
  {
    chave: 'vagas',
    rotulo: 'Minhas Vagas',
    descricao: 'Publique e gerencie as vagas da sua empresa',
    icone: Folder,
    Componente: AbaMinhasVagas,
  },
  {
    chave: 'interesses',
    rotulo: 'Interesses Enviados',
    descricao: 'Acompanhe os candidatos que você contatou',
    icone: Bell,
    Componente: AbaInteressesEnviados,
  },
  {
    chave: 'candidaturas',
    rotulo: 'Candidaturas Recebidas',
    descricao: 'Veja quem se candidatou às suas vagas',
    icone: UserCheck,
    Componente: AbaCandidaturasRecebidas,
  },
  {
    chave: 'cota',
    rotulo: 'Relatório de Cota',
    descricao: 'Acompanhe sua meta de contratações',
    icone: BarChart2,
    Componente: AbaRelatorioCota,
  },
]

export default function PainelEmpresa() {
  const [perfil, setPerfil] = useState(null)
  const [erro, setErro] = useState('')
  const [secaoAtiva, setSecaoAtiva] = useState(null)
  const { sair } = useAuth()

  function carregar() {
    cliente
      .get('/empresas/me')
      .then((resposta) => setPerfil(resposta.data))
      .catch(() => setErro('Não foi possível carregar seu perfil'))
  }

  useEffect(() => {
    carregar()
  }, [])

  if (erro) {
    return (
      <Layout tema="empresa">
        <p className="aviso aviso--erro">{erro}</p>
      </Layout>
    )
  }

  if (!perfil) {
    return (
      <Layout tema="empresa">
        <p className="texto-suave">Carregando...</p>
      </Layout>
    )
  }

  const secao = SECOES.find((item) => item.chave === secaoAtiva)
  const BotaoSair = (
    <button
      type="button"
      onClick={sair}
      title="Sair"
      style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
    >
      <LogOut size={18} />
    </button>
  )

  return (
    <Layout tema="empresa" largura="largo" centralizar>
      <Cartao
        titulo={secao ? secao.rotulo : `${perfil.razao_social || perfil.usuario.nome} — Painel Principal`}
        icone={secao ? secao.icone : Building2}
        acoes={BotaoSair}
      >
        {secao ? (
          <>
            <Botao
              variante="contorno"
              icone={ArrowLeft}
              onClick={() => setSecaoAtiva(null)}
              style={{ marginBottom: 16 }}
            >
              Voltar ao início
            </Botao>
            <secao.Componente />
          </>
        ) : (
          <>
            {!perfil.aprovada && (
              <p className="aviso aviso--erro">
                Sua empresa ainda está aguardando aprovação do administrador. Algumas ações ficam bloqueadas até lá.
              </p>
            )}
            <div className="grade-dashboard-candidato">
              <div className="cartao-perfil-lateral">
                <SeletorFoto fotoUrl={perfil.usuario.foto_url} nome={perfil.usuario.nome} aoAtualizar={carregar} />
                <p className="perfil-lateral__nome">{perfil.razao_social || perfil.usuario.nome}</p>
                <p className="perfil-lateral__info">
                  {perfil.setor || 'Setor não informado'}
                  {perfil.cidade ? ` · ${perfil.cidade}` : ''}
                </p>
                <p className="perfil-lateral__progresso-rotulo">
                  {perfil.aprovada ? 'Empresa aprovada' : 'Aguardando aprovação'}
                </p>
              </div>

              <div className="lista-funcionalidades">
                {SECOES.map((item) => (
                  <div className="cartao-funcionalidade" key={item.chave}>
                    <span className="cartao-funcionalidade__icone">
                      <item.icone size={20} />
                    </span>
                    <div className="cartao-funcionalidade__texto">
                      <strong>{item.rotulo}</strong>
                      <p>{item.descricao}</p>
                    </div>
                    <Botao variante="contorno" onClick={() => setSecaoAtiva(item.chave)}>
                      Ver
                    </Botao>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Cartao>
    </Layout>
  )
}
