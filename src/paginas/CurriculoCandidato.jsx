import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, ArrowLeft, ArrowRight } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Abas from '../componentes/Abas'
import Botao from '../componentes/Botao'
import Aviso from '../componentes/Aviso'
import cliente from '../api/cliente'
import AbaDadosPessoais from './curriculo/AbaDadosPessoais'
import AbaExperiencia from './curriculo/AbaExperiencia'
import AbaHabilidades from './curriculo/AbaHabilidades'
import AbaTea from './curriculo/AbaTea'

const ABAS = [
  { chave: 'dados', rotulo: 'Dados Pessoais' },
  { chave: 'experiencia', rotulo: 'Experiência' },
  { chave: 'habilidades', rotulo: 'Habilidades' },
  { chave: 'tea', rotulo: 'TEA & Necessidades' },
]

export default function CurriculoCandidato() {
  const [perfil, setPerfil] = useState(null)
  const [erro, setErro] = useState('')
  const [abaAtiva, setAbaAtiva] = useState('dados')
  const [pendencias, setPendencias] = useState({ dados: false, tea: false })
  const [chavesReset, setChavesReset] = useState({ dados: 0, tea: 0 })
  const navegar = useNavigate()

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

  return (
    <Layout
      largura="largo"
    >
      <Botao variante="contorno" icone={ArrowLeft} onClick={() => navegar('/candidato')} style={{ marginBottom: 16 }}>
        Voltar ao início
      </Botao>

      <Cartao titulo={`Meu Currículo — ${perfil.usuario.nome}`} icone={ClipboardList}>
        <Abas abas={ABAS} ativa={abaAtiva} aoMudar={mudarAba} />

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

        <div className="acoes-form" style={{ marginTop: 24 }}>
          <Botao variante="contorno" icone={ArrowLeft} onClick={irParaAnterior} disabled={indiceAtual === 0}>
            Anterior
          </Botao>
          <Botao
            variante={indiceAtual === ABAS.length - 1 ? 'primario' : 'contorno'}
            icone={ArrowRight}
            onClick={irParaProxima}
          >
            {indiceAtual === ABAS.length - 1 ? 'Concluir' : 'Próximo'}
          </Botao>
        </div>
      </Cartao>

      <Aviso variante="sucesso">Cada aba = uma seção do currículo (4 abas no total)</Aviso>
    </Layout>
  )
}
