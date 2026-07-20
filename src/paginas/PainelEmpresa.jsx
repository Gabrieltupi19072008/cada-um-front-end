import { useEffect, useState } from 'react'
import { Building2, Search, Folder, Bell, BarChart2, LogOut } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Abas from '../componentes/Abas'
import cliente from '../api/cliente'
import { useAuth } from '../contexto/AuthContext'
import AbaBuscarCandidatos from './empresa/AbaBuscarCandidatos'
import AbaMinhasVagas from './empresa/AbaMinhasVagas'
import AbaInteressesEnviados from './empresa/AbaInteressesEnviados'
import AbaRelatorioCota from './empresa/AbaRelatorioCota'

const ABAS = [
  { chave: 'buscar', rotulo: 'Buscar Candidatos', icone: Search },
  { chave: 'vagas', rotulo: 'Minhas Vagas', icone: Folder },
  { chave: 'interesses', rotulo: 'Interesses Enviados', icone: Bell },
  { chave: 'cota', rotulo: 'Relatório de Cota', icone: BarChart2 },
]

export default function PainelEmpresa() {
  const [perfil, setPerfil] = useState(null)
  const [erro, setErro] = useState('')
  const [abaAtiva, setAbaAtiva] = useState('buscar')
  const { sair } = useAuth()

  useEffect(() => {
    cliente
      .get('/empresas/me')
      .then((resposta) => setPerfil(resposta.data))
      .catch(() => setErro('Não foi possível carregar seu perfil'))
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

  return (
    <Layout tema="empresa" largura="largo">
      <Cartao
        titulo={`${perfil.razao_social || perfil.usuario.nome} — Painel Principal`}
        icone={Building2}
        acoes={
          <button
            type="button"
            onClick={sair}
            title="Sair"
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
          >
            <LogOut size={18} />
          </button>
        }
      >
        {!perfil.aprovada && (
          <p className="aviso aviso--erro">
            Sua empresa ainda está aguardando aprovação do administrador. Algumas ações ficam bloqueadas até lá.
          </p>
        )}
        <Abas abas={ABAS} ativa={abaAtiva} aoMudar={setAbaAtiva} />
        {abaAtiva === 'buscar' && <AbaBuscarCandidatos />}
        {abaAtiva === 'vagas' && <AbaMinhasVagas />}
        {abaAtiva === 'interesses' && <AbaInteressesEnviados />}
        {abaAtiva === 'cota' && <AbaRelatorioCota />}
      </Cartao>
    </Layout>
  )
}
