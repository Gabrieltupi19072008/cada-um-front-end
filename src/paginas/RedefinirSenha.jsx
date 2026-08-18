import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Botao from '../componentes/Botao'
import Aviso from '../componentes/Aviso'
import Logo from '../componentes/Logo'
import cliente from '../api/cliente'

export default function RedefinirSenha() {
  const [parametros] = useSearchParams()
  const token = parametros.get('token') || ''
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    setEnviando(true)
    try {
      await cliente.post('/auth/redefinir-senha', { token, nova_senha: novaSenha })
      setSucesso(true)
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível redefinir sua senha')
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
            <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Escolher nova senha</h2>

            {!token && <Aviso variante="erro">Link inválido. Solicite uma nova redefinição de senha.</Aviso>}

            {token && !sucesso && (
              <form onSubmit={aoEnviar}>
                {erro && <Aviso variante="erro">{erro}</Aviso>}
                <label className="campo">
                  Nova senha
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    minLength={8}
                    required
                  />
                  <small className="campo-dica">Mínimo de 8 caracteres, com letras e números</small>
                </label>
                <label className="campo">
                  Confirmar nova senha
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    minLength={8}
                    required
                  />
                </label>
                <Botao type="submit" variante="gradiente" className="botao--bloco" disabled={enviando}>
                  {enviando ? 'Salvando...' : 'Redefinir senha'}
                </Botao>
              </form>
            )}

            {sucesso && (
              <div>
                <Aviso variante="sucesso">Senha redefinida com sucesso!</Aviso>
                <p className="texto-suave" style={{ textAlign: 'center' }}>
                  Já pode entrar na plataforma com a sua nova senha.
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
