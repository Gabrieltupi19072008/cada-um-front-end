import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import cliente from '../api/cliente'

const AuthContexto = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [perfil, setPerfil] = useState(() => localStorage.getItem('perfil'))
  const [usuario, setUsuario] = useState(null)

  const recarregarUsuario = useCallback(() => {
    if (!localStorage.getItem('token')) return Promise.resolve()
    return cliente
      .get('/usuarios/me')
      .then((resposta) => setUsuario(resposta.data))
      .catch(() => setUsuario(null))
  }, [])

  useEffect(() => {
    if (token) recarregarUsuario()
    else setUsuario(null)
  }, [token, recarregarUsuario])

  function salvarSessao(dadosToken) {
    localStorage.setItem('token', dadosToken.access_token)
    localStorage.setItem('perfil', dadosToken.perfil)
    setToken(dadosToken.access_token)
    setPerfil(dadosToken.perfil)
  }

  async function entrar(email, senha) {
    const corpo = new URLSearchParams()
    corpo.append('username', email)
    corpo.append('password', senha)

    const resposta = await cliente.post('/auth/login', corpo, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    salvarSessao(resposta.data)
  }

  function sair() {
    localStorage.removeItem('token')
    localStorage.removeItem('perfil')
    setToken(null)
    setPerfil(null)
  }

  const valor = {
    token,
    perfil,
    usuario,
    recarregarUsuario,
    autenticado: Boolean(token),
    entrar,
    sair,
  }

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContexto)
  if (!contexto) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider')
  }
  return contexto
}
