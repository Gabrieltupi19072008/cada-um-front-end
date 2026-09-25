import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Mail, ShieldCheck } from 'lucide-react'
import LayoutPublico from '../componentes/LayoutPublico'
import Aviso from '../componentes/Aviso'
import cliente from '../api/cliente'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(evento) {
    evento?.preventDefault()
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
    <LayoutPublico>
      <Link to="/login" className="voltar-publico">
        <ArrowLeft size={15} /> Voltar para o login
      </Link>
      <div className="cartao-publico__cabecalho">
        <small>RECUPERAÇÃO DE ACESSO</small>
        <h2>{resultado ? 'Confira seu e-mail' : 'Esqueceu sua senha?'}</h2>
        <p>
          {resultado
            ? 'Enviamos um link seguro para você criar uma nova senha.'
            : 'Sem problema. Vamos ajudar você a voltar para sua conta.'}
        </p>
      </div>

      {erro && <Aviso variante="erro">{erro}</Aviso>}

      {resultado ? (
        <div className="sucesso-recuperacao">
          <span>
            <Mail size={22} />
          </span>
          <b>{resultado.mensagem}</b>
          <p>Confira também sua caixa de spam e clique no link para escolher uma senha nova.</p>
          <button type="button" onClick={() => aoEnviar()} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar novamente'}
          </button>
        </div>
      ) : (
        <form onSubmit={aoEnviar}>
          <label className="campo-publico">
            Seu e-mail
            <div className="campo-icone">
              <Mail size={19} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
          </label>
          <button type="submit" className="botao-marca" disabled={enviando} style={{ marginTop: 22 }}>
            {enviando ? 'Enviando...' : 'Enviar link de recuperação'} <ArrowRight size={20} />
          </button>
          <div className="nota-confianca">
            <ShieldCheck size={16} /> Por segurança, nunca pediremos sua senha por e-mail.
          </div>
        </form>
      )}
    </LayoutPublico>
  )
}
