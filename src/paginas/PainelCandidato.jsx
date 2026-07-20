import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, ClipboardList, Search, Bell, Pencil, LogOut } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Botao from '../componentes/Botao'
import BarraProgresso from '../componentes/BarraProgresso'
import cliente from '../api/cliente'
import { useAuth } from '../contexto/AuthContext'

const ROTULOS_GRAU_TEA = {
  leve: 'TEA Leve',
  moderado: 'TEA Moderado',
  severo: 'TEA Severo',
}

function obterIniciais(nome) {
  const partes = nome.trim().split(/\s+/)
  return partes.slice(0, 2).map((parte) => parte[0].toUpperCase()).join('')
}

function calcularPercentualPerfil(perfil) {
  const campos = [
    Boolean(perfil.cidade),
    Boolean(perfil.estado),
    Boolean(perfil.telefone),
    Boolean(perfil.sobre_mim),
    Boolean(perfil.grau_tea),
    perfil.formacoes.length > 0,
    perfil.experiencias.length > 0,
    perfil.habilidades.length > 0,
  ]
  const preenchidos = campos.filter(Boolean).length
  return Math.round((preenchidos / campos.length) * 100)
}

export default function PainelCandidato() {
  const [perfil, setPerfil] = useState(null)
  const [erro, setErro] = useState('')
  const { sair } = useAuth()
  const navegar = useNavigate()

  useEffect(() => {
    cliente
      .get('/candidatos/me')
      .then((resposta) => setPerfil(resposta.data))
      .catch(() => setErro('Não foi possível carregar seu perfil'))
  }, [])

  if (erro) {
    return (
      <Layout>
        <p className="aviso aviso--erro">{erro}</p>
      </Layout>
    )
  }

  if (!perfil) {
    return (
      <Layout>
        <p className="texto-suave">Carregando...</p>
      </Layout>
    )
  }

  const primeiroNome = perfil.usuario.nome.split(' ')[0]
  const percentual = calcularPercentualPerfil(perfil)

  return (
    <Layout largura="largo" centralizar>
      <Cartao
        titulo={`Início — Olá, ${primeiroNome}!`}
        icone={Home}
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
        <div className="grade-dashboard-candidato">
          <div className="cartao-perfil-lateral">
            <div className="avatar-circulo">{obterIniciais(perfil.usuario.nome)}</div>
            <p className="perfil-lateral__nome">{perfil.usuario.nome}</p>
            <p className="perfil-lateral__info">
              {perfil.grau_tea ? ROTULOS_GRAU_TEA[perfil.grau_tea] : 'Grau de TEA não informado'}
              {perfil.cidade ? ` · ${perfil.cidade}` : ''}
            </p>
            <BarraProgresso valor={percentual} cor="sucesso" />
            <p className="perfil-lateral__progresso-rotulo">Perfil {percentual}% completo</p>
            <Botao
              variante="primario"
              icone={Pencil}
              className="botao--bloco"
              style={{ marginTop: 16 }}
              onClick={() => navegar('/candidato/curriculo')}
            >
              Editar currículo
            </Botao>
          </div>

          <div className="lista-funcionalidades">
            <div className="cartao-funcionalidade">
              <span className="cartao-funcionalidade__icone">
                <ClipboardList size={20} />
              </span>
              <div className="cartao-funcionalidade__texto">
                <strong>Meu Currículo</strong>
                <p>Complete seus dados, experiências e habilidades</p>
              </div>
              <Botao variante="contorno" onClick={() => navegar('/candidato/curriculo')}>
                Ver / Editar
              </Botao>
            </div>

            <div className="cartao-funcionalidade">
              <span className="cartao-funcionalidade__icone">
                <Search size={20} />
              </span>
              <div className="cartao-funcionalidade__texto">
                <strong>Vagas Disponíveis</strong>
                <p>Veja vagas publicadas por empresas parceiras</p>
              </div>
              <Botao variante="contorno" onClick={() => navegar('/candidato/vagas')}>
                Ver vagas
              </Botao>
            </div>

            <div className="cartao-funcionalidade">
              <span className="cartao-funcionalidade__icone">
                <Bell size={20} />
              </span>
              <div className="cartao-funcionalidade__texto">
                <strong>Empresas Interessadas</strong>
                <p>Veja quais empresas demonstraram interesse no seu perfil</p>
              </div>
              <Botao variante="contorno" onClick={() => navegar('/candidato/interesses')}>
                Ver contatos
              </Botao>
            </div>
          </div>
        </div>
      </Cartao>
    </Layout>
  )
}
