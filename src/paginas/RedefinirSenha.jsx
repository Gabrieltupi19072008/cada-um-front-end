import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import LayoutPublico from '../componentes/LayoutPublico'
import Aviso from '../componentes/Aviso'
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
    <LayoutPublico>
            <Link to="/login" className="voltar-publico">
              <ArrowLeft size={15} /> Voltar para o login
            </Link>
            <div className="cartao-publico__cabecalho">
              <small>RECUPERAÇÃO DE ACESSO</small>
              <h2>Escolher nova senha</h2>
              <p>Crie uma senha nova para voltar a acessar sua conta.</p>
            </div>

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
                <button type="submit" className="botao-marca" disabled={enviando}>
                  {enviando ? 'Salvando...' : 'Redefinir senha'} <ArrowRight size={20} />
                </button>
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
    </LayoutPublico>
  )
}
