import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'

export default function RotaProtegida({ perfilExigido, children }) {
  const { autenticado, perfil } = useAuth()

  if (!autenticado) {
    return <Navigate to="/login" replace />
  }

  if (perfilExigido && perfil !== perfilExigido) {
    return <Navigate to="/" replace />
  }

  return children
}
