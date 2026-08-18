import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Botao from '../componentes/Botao'
import Aviso from '../componentes/Aviso'
import Logo from '../componentes/Logo'
import cliente from '../api/cliente'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const resposta = await cliente.post('/auth/esqueci-senha', { email })
      setResultado(resposta.data)
    } catch {
      setErro('Não foi possível processar o pedido. Tente novamente.')
    } finally {
      setEnviando(false)
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
            <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Recuperar senha</h2>

            {erro && <Aviso variante="erro">{erro}</Aviso>}

            {!resultado && (
              <form onSubmit={aoEnviar}>
                <label className="campo">
                  Seu e-mail
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </label>
                <Botao type="submit" variante="gradiente" className="botao--bloco" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Enviar link de redefinição'}
                </Botao>
              </form>
            )}

            {resultado && (
              <div>
                <Aviso variante="sucesso">{resultado.mensagem}</Aviso>
                <p className="texto-suave" style={{ textAlign: 'center' }}>
                  Confira sua caixa de entrada (e o spam) e clique no link para escolher uma senha nova.
                </p>
              </div>
            )}

            <p className="login-link" style={{ marginTop: 16 }}>
              <Link to="/login">
                <ArrowLeft size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Voltar ao login
              </Link>
            </p>
          </Cartao>
        </div>
      </div>
    </Layout>
  )
}
