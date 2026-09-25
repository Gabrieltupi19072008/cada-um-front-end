import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from 'lucide-react'
import Layout from '../componentes/Layout'
import CabecalhoPagina from '../componentes/CabecalhoPagina'
import AnelProgresso from '../componentes/AnelProgresso'
import SeletorFoto from '../componentes/SeletorFoto'
import Botao from '../componentes/Botao'
import Aviso from '../componentes/Aviso'
import cliente from '../api/cliente'
import { useAuth } from '../contexto/AuthContext'
import { calcularPercentualPerfil } from '../dados/percentualPerfil'
import AbaDadosPessoais from './curriculo/AbaDadosPessoais'
import AbaExperiencia from './curriculo/AbaExperiencia'
import AbaHabilidades from './curriculo/AbaHabilidades'
import AbaTea from './curriculo/AbaTea'

const ABAS = [
  { chave: 'dados', rotulo: 'Dados pessoais', resumo: 'Informações básicas', titulo: 'Dados pessoais' },
  { chave: 'experiencia', rotulo: 'Experiência', resumo: 'Sua trajetória', titulo: 'Experiência profissional' },
  { chave: 'habilidades', rotulo: 'Habilidades', resumo: 'Seus talentos', titulo: 'Habilidades e talentos' },
  { chave: 'tea', rotulo: 'TEA & necessidades', resumo: 'Como te apoiar', titulo: 'Conforto e necessidades' },
]

export default function CurriculoCandidato() {
  const [perfil, setPerfil] = useState(null)
  const [erro, setErro] = useState('')
  const [abaAtiva, setAbaAtiva] = useState('dados')
  const [pendencias, setPendencias] = useState({ dados: false, tea: false })
  const [chavesReset, setChavesReset] = useState({ dados: 0, tea: 0 })
  const navegar = useNavigate()
  const { recarregarUsuario } = useAuth()

  const marcarPendenciaDados = useCallback((sujo) => {
    setPendencias((atual) => (atual.dados === sujo ? atual : { ...atual, dados: sujo }))
  }, [])

  const marcarPendenciaTea = useCallback((sujo) => {
    setPendencias((atual) => (atual.tea === sujo ? atual : { ...atual, tea: sujo }))
  }, [])

  function recarregar() {
    return cliente
      .get('/candidatos/me')
      .then((resposta) => setPerfil(resposta.data))
      .catch(() => setErro('Não foi possível carregar seu currículo'))
  }

  useEffect(() => {
    recarregar()
  }, [])

  if (erro) {
    return (
      <Layout>
        <Aviso variante="erro">{erro}</Aviso>
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

  const indiceAtual = ABAS.findIndex((aba) => aba.chave === abaAtiva)

  function sairDaAbaAtual(prosseguir) {
    if (pendencias[abaAtiva]) {
      const confirmou = window.confirm(
        'Você tem alterações não salvas nesta aba. Se sair agora, elas serão perdidas. Deseja continuar?'
      )
      if (!confirmou) return
      setChavesReset((atual) => ({ ...atual, [abaAtiva]: atual[abaAtiva] + 1 }))
      setPendencias((atual) => ({ ...atual, [abaAtiva]: false }))
    }
    prosseguir()
  }

  function mudarAba(novaChave) {
    sairDaAbaAtual(() => setAbaAtiva(novaChave))
  }

  function irParaAnterior() {
    if (indiceAtual > 0) sairDaAbaAtual(() => setAbaAtiva(ABAS[indiceAtual - 1].chave))
  }

  function irParaProxima() {
    if (indiceAtual < ABAS.length - 1) sairDaAbaAtual(() => setAbaAtiva(ABAS[indiceAtual + 1].chave))
    else sairDaAbaAtual(() => navegar('/candidato'))
  }

  const percentual = calcularPercentualPerfil(perfil)

  return (
    <Layout largura="largo">
      <CabecalhoPagina
        sobretitulo="MEU CURRÍCULO"
        titulo="Conte sua história profissional"
        descricao="Você controla o que deseja compartilhar com as empresas."
      />

      <section className="layout-curriculo">
        <aside className="curriculo-etapas">
          <div className="curriculo-resumo">
            <SeletorFoto
              fotoUrl={perfil.usuario.foto_url}
              nome={perfil.usuario.nome}
              aoAtualizar={() => {
                recarregar()
                recarregarUsuario()
              }}
              tamanho={72}
            />
            <h3>{perfil.usuario.nome}</h3>
            <div className="curriculo-resumo__progresso">
              <AnelProgresso valor={percentual} tamanho={46} />
              <p>{percentual === 100 ? 'Seu currículo está completo!' : 'Complete as etapas para aparecer em mais buscas.'}</p>
            </div>
          </div>
          {ABAS.map((aba, indice) => (
            <button
              type="button"
              key={aba.chave}
              className={abaAtiva === aba.chave ? 'ativa' : ''}
              onClick={() => mudarAba(aba.chave)}
            >
              <span>{indice < indiceAtual ? <Check size={15} /> : indice + 1}</span>
              <div>
                <b>{aba.rotulo}</b>
                <small>{aba.resumo}</small>
              </div>
            </button>
          ))}
          <div className="nota-privacidade">
            <ShieldCheck size={20} />
            <p>
              <b>Você está no controle</b>
              Informações sobre TEA só aparecem para empresas quando você permite.
            </p>
          </div>
        </aside>

        <section className="painel curriculo-formulario">
          <header>
            <span>
              ETAPA {indiceAtual + 1} DE {ABAS.length}
            </span>
            <h2>{ABAS[indiceAtual].titulo}</h2>
          </header>

          <div style={{ display: abaAtiva === 'dados' ? 'block' : 'none' }}>
            <AbaDadosPessoais
              key={`dados-${chavesReset.dados}`}
              perfil={perfil}
              aoSalvar={recarregar}
              aoMudancaPendente={marcarPendenciaDados}
            />
          </div>
          <div style={{ display: abaAtiva === 'experiencia' ? 'block' : 'none' }}>
            <AbaExperiencia perfil={perfil} aoAlterar={recarregar} />
          </div>
          <div style={{ display: abaAtiva === 'habilidades' ? 'block' : 'none' }}>
            <AbaHabilidades perfil={perfil} aoAlterar={recarregar} />
          </div>
          <div style={{ display: abaAtiva === 'tea' ? 'block' : 'none' }}>
            <AbaTea
              key={`tea-${chavesReset.tea}`}
              perfil={perfil}
              aoSalvar={recarregar}
              aoMudancaPendente={marcarPendenciaTea}
            />
          </div>

          <footer>
            <Botao variante="contorno" icone={ArrowLeft} onClick={irParaAnterior} disabled={indiceAtual === 0}>
              Anterior
            </Botao>
            <Botao variante="primario" onClick={irParaProxima}>
              {indiceAtual === ABAS.length - 1 ? 'Concluir' : 'Próxima etapa'} <ArrowRight size={16} />
            </Botao>
          </footer>
        </section>
      </section>
    </Layout>
  )
}
