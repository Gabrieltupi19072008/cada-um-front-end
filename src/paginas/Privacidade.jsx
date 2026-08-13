import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Botao from '../componentes/Botao'
import Aviso from '../componentes/Aviso'
import cliente from '../api/cliente'

export default function Privacidade() {
  const [perfil, setPerfil] = useState(null)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const navegar = useNavigate()

  useEffect(() => {
    cliente
      .get('/candidatos/me')
      .then((resposta) => setPerfil(resposta.data))
      .catch(() => setErro('Não foi possível carregar seu perfil'))
  }, [])

  async function alternarVisibilidade() {
    setSalvando(true)
    try {
      const novoValor = !perfil.visivel_para_empresas
      await cliente.put('/candidatos/me', { visivel_para_empresas: novoValor })
      setPerfil((atual) => ({ ...atual, visivel_para_empresas: novoValor }))
    } finally {
      setSalvando(false)
    }
  }

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

  return (
    <Layout largura="padrao">
      <Botao variante="contorno" icone={ArrowLeft} onClick={() => navegar('/candidato')} style={{ marginBottom: 16 }}>
        Voltar ao início
      </Botao>
      <Cartao titulo="Privacidade e visibilidade" icone={ShieldCheck}>
        <Aviso variante="sucesso">
          De acordo com a LGPD, você decide quem pode ver o seu perfil. Isso pode ser mudado a qualquer momento.
        </Aviso>
        <div className="linha-toggle">
          <div className="linha-toggle__texto">
            <h3>Meu perfil está visível para empresas</h3>
            <p>
              Empresas aprovadas podem te encontrar na busca de candidatos e ver seu currículo. Você pode
              desligar isso quando quiser — mesmo oculto, você continua podendo se candidatar às vagas.
            </p>
          </div>
          <label className="interruptor">
            <input
              type="checkbox"
              checked={perfil.visivel_para_empresas}
              onChange={alternarVisibilidade}
              disabled={salvando}
            />
            <span className="interruptor-trilho"></span>
          </label>
        </div>
        <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginTop: 16 }}>
          Status atual:{' '}
          <b style={{ color: perfil.visivel_para_empresas ? 'var(--sucesso)' : 'var(--texto-suave)' }}>
            {perfil.visivel_para_empresas ? 'visível para empresas' : 'oculto — só você e o Admin veem'}
          </b>
        </p>
      </Cartao>
    </Layout>
  )
}
