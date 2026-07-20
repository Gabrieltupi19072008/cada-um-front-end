import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Botao from '../componentes/Botao'
import Aviso from '../componentes/Aviso'
import Logo from '../componentes/Logo'
import { useAuth } from '../contexto/AuthContext'

export default function Login() {
  const navegar = useNavigate()
  const { entrar } = useAuth()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function aoEntrar(evento) {
    evento.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await entrar(email, senha)
      navegar('/')
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível entrar')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Layout largura="cheia">
      <div className="tela-login">
        <div className="login-cartao login-cartao--simples">
          <Cartao>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <Logo tamanho={54} mostrarNome={false} />
            </div>
            <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Entrar</h2>

            {erro && <Aviso variante="erro">{erro}</Aviso>}

            <form onSubmit={aoEntrar}>
              <label className="campo">
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </label>
              <label className="campo">
                Senha
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="********"
                  required
                />
              </label>
              <Botao type="submit" variante="gradiente" className="botao--bloco" disabled={carregando}>
                {carregando ? 'Entrando...' : 'Entrar'}
              </Botao>
            </form>

            <p className="login-link">
              <Link to="/esqueci-senha">Esqueceu a senha?</Link>
            </p>

            <Botao
              variante="contorno"
              icone={UserPlus}
              className="botao--bloco"
              onClick={() => navegar('/cadastro')}
              style={{ marginTop: 8 }}
            >
              Cadastre-se
            </Botao>
          </Cartao>
        </div>
      </div>
    </Layout>
  )
}
