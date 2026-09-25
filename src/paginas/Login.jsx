import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import LayoutPublico from '../componentes/LayoutPublico'
import Aviso from '../componentes/Aviso'
import { useAuth } from '../contexto/AuthContext'

export default function Login() {
  const navegar = useNavigate()
  const { entrar } = useAuth()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
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
    <LayoutPublico>
      <form onSubmit={aoEntrar}>
        <div className="cartao-publico__cabecalho">
          <small>Bem-vindo de volta</small>
          <h2>Acesse sua conta</h2>
          <p>Entre com seu e-mail e continue sua jornada.</p>
        </div>

        {erro && <Aviso variante="erro">{erro}</Aviso>}

        <label className="campo-publico">
          E-mail
          <div className="campo-icone">
            <Mail size={19} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              required
            />
          </div>
        </label>
        <label className="campo-publico">
          Senha
          <div className="campo-icone">
            <Lock size={19} />
            <input
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="********"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((atual) => !atual)}
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        <div className="linha-form-publico">
          <Link to="/esqueci-senha">Esqueci minha senha</Link>
        </div>

        <button type="submit" className="botao-marca" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar na plataforma'} <ArrowRight size={20} />
        </button>

        <p className="texto-cadastro">
          Ainda não faz parte? <Link to="/cadastro">Crie sua conta</Link>
        </p>
        <div className="nota-confianca">
          <ShieldCheck size={16} /> Seus dados estão protegidos e seguros.
        </div>
      </form>
    </LayoutPublico>
  )
}
