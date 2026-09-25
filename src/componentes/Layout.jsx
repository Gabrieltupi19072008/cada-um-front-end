import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Briefcase,
  Building2,
  FileText,
  GraduationCap,
  Heart,
  Home,
  Lock,
  LogOut,
  Mail,
  Menu,
  Search,
  Send,
  ShieldCheck,
  User,
  UserCheck,
  X,
} from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../contexto/AuthContext'

const ROTULOS_PERFIL = { candidato: 'Candidato', empresa: 'Empresa', admin: 'Admin' }
const ICONES_PERFIL = { candidato: User, empresa: Building2, admin: ShieldCheck }

// `ativoEm` lista prefixos de rota extras que também acendem o item no menu.
const MENUS = {
  candidato: [
    { rotulo: 'Visão geral', icone: Home, para: '/candidato' },
    { rotulo: 'Orientação', icone: GraduationCap, para: '/candidato/orientacao' },
    { rotulo: 'Meu currículo', icone: FileText, para: '/candidato/curriculo' },
    { rotulo: 'Vagas disponíveis', icone: Briefcase, para: '/candidato/vagas', ativoEm: ['/candidato/empresas'] },
    { rotulo: 'Candidaturas', icone: Send, para: '/candidato/candidaturas' },
    { rotulo: 'Empresas interessadas', icone: Heart, para: '/candidato/interesses' },
    { rotulo: 'Privacidade', icone: Lock, para: '/candidato/privacidade' },
  ],
  empresa: [
    { rotulo: 'Visão geral', icone: Home, para: '/empresa' },
    { rotulo: 'Sobre a empresa', icone: Building2, para: '/empresa?secao=descricao' },
    { rotulo: 'Buscar candidatos', icone: Search, para: '/empresa?secao=buscar', ativoEm: ['/empresa/candidatos'] },
    { rotulo: 'Minhas vagas', icone: Briefcase, para: '/empresa?secao=vagas', ativoEm: ['/empresa/vagas'] },
    { rotulo: 'Interesses enviados', icone: Mail, para: '/empresa?secao=interesses' },
    { rotulo: 'Candidaturas', icone: UserCheck, para: '/empresa?secao=candidaturas' },
    { rotulo: 'Relatório de cota', icone: BarChart3, para: '/empresa?secao=cota' },
  ],
  admin: [{ rotulo: 'Visão geral', icone: Home, para: '/admin' }],
}

function itemEstaAtivo(item, localizacao) {
  const atual = localizacao.pathname + localizacao.search
  if (atual === item.para) return true
  return (item.ativoEm || []).some((prefixo) => localizacao.pathname.startsWith(prefixo))
}

function obterIniciais(nome) {
  const partes = (nome || '?').trim().split(/\s+/)
  return partes
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')
}

export default function Layout({ largura = 'padrao', tema, children }) {
  const { perfil, usuario, sair } = useAuth()
  const localizacao = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)

  const perfilAtual = MENUS[perfil] ? perfil : 'candidato'
  const temaAtual = tema || (perfilAtual === 'candidato' ? null : perfilAtual)
  const IconePerfil = ICONES_PERFIL[perfilAtual]

  return (
    <div className={`app-shell ${temaAtual ? `tema-${temaAtual}` : ''}`}>
      <aside className={`sidebar ${menuAberto ? 'sidebar--aberta' : ''}`}>
        <div className="sidebar-logo">
          <Link to="/" aria-label="Início">
            <Logo />
          </Link>
          <button type="button" onClick={() => setMenuAberto(false)} aria-label="Fechar menu">
            <X size={22} />
          </button>
        </div>

        <div className="selo-perfil">
          <span>
            <IconePerfil size={20} />
          </span>
          <div>
            <small>ÁREA DE ACESSO</small>
            <b>{ROTULOS_PERFIL[perfilAtual]}</b>
          </div>
        </div>

        <nav>
          <small>MENU PRINCIPAL</small>
          {MENUS[perfilAtual].map((item) => (
            <Link
              key={item.para}
              to={item.para}
              className={itemEstaAtivo(item, localizacao) ? 'ativo' : ''}
              onClick={() => setMenuAberto(false)}
            >
              <item.icone size={19} />
              {item.rotulo}
            </Link>
          ))}
        </nav>

        <button type="button" className="sidebar-sair" onClick={sair}>
          <LogOut size={19} /> Sair da conta
        </button>
      </aside>

      {menuAberto && (
        <button type="button" className="fundo-menu" onClick={() => setMenuAberto(false)} aria-label="Fechar menu" />
      )}

      <div className="app-principal">
        <header className="barra-topo">
          <button type="button" className="botao-menu-mobile" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">
            <Menu size={22} />
          </button>
          <div className="topo-usuario">
            {usuario?.foto_url ? (
              <span className="avatar avatar--foto" style={{ backgroundImage: `url(${usuario.foto_url})` }} />
            ) : (
              <span className="avatar">{obterIniciais(usuario?.nome)}</span>
            )}
            <div>
              <b>{usuario?.nome || ' '}</b>
              <small>{ROTULOS_PERFIL[perfilAtual]}</small>
            </div>
          </div>
        </header>

        <main className={`conteudo-pagina conteudo-pagina--${largura}`}>{children}</main>
      </div>
    </div>
  )
}
