import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, ArrowLeft, ArrowRight } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Abas from '../componentes/Abas'
import Botao from '../componentes/Botao'
import Aviso from '../componentes/Aviso'
import cliente from '../api/cliente'
import AbaDadosPessoais from './curriculo/AbaDadosPessoais'
import AbaFormacao from './curriculo/AbaFormacao'
import AbaExperiencia from './curriculo/AbaExperiencia'
import AbaHabilidades from './curriculo/AbaHabilidades'
import AbaTea from './curriculo/AbaTea'

const ABAS = [
  { chave: 'dados', rotulo: 'Dados Pessoais' },
  { chave: 'formacao', rotulo: 'Formação' },
  { chave: 'experiencia', rotulo: 'Experiência' },
  { chave: 'habilidades', rotulo: 'Habilidades' },
  { chave: 'tea', rotulo: 'TEA & Necessidades' },
]

export default function CurriculoCandidato() {
  const [perfil, setPerfil] = useState(null)
  const [erro, setErro] = useState('')
  const [abaAtiva, setAbaAtiva] = useState('dados')
  const navegar = useNavigate()

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

  function irParaAnterior() {
    if (indiceAtual > 0) setAbaAtiva(ABAS[indiceAtual - 1].chave)
  }

  function irParaProxima() {
    if (indiceAtual < ABAS.length - 1) setAbaAtiva(ABAS[indiceAtual + 1].chave)
    else navegar('/candidato')
  }

  return (
    <Layout
      largura="largo"
    >
      <Botao variante="contorno" icone={ArrowLeft} onClick={() => navegar('/candidato')} style={{ marginBottom: 16 }}>
        Voltar ao início
      </Botao>

      <Cartao titulo={`Meu Currículo — ${perfil.usuario.nome}`} icone={ClipboardList}>
        <Abas abas={ABAS} ativa={abaAtiva} aoMudar={setAbaAtiva} />

        {abaAtiva === 'dados' && <AbaDadosPessoais perfil={perfil} aoSalvar={recarregar} />}
        {abaAtiva === 'formacao' && <AbaFormacao perfil={perfil} aoAlterar={recarregar} />}
        {abaAtiva === 'experiencia' && <AbaExperiencia perfil={perfil} aoAlterar={recarregar} />}
        {abaAtiva === 'habilidades' && <AbaHabilidades perfil={perfil} aoAlterar={recarregar} />}
        {abaAtiva === 'tea' && <AbaTea perfil={perfil} aoSalvar={recarregar} />}

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

      <Aviso variante="sucesso">Cada aba = uma seção do currículo (5 abas no total)</Aviso>
    </Layout>
  )
}
