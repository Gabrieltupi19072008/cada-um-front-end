import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexto/AuthContext'
import RotaProtegida from './componentes/RotaProtegida'
import Login from './paginas/Login'
import Cadastro from './paginas/Cadastro'
import EsqueciSenha from './paginas/EsqueciSenha'
import PainelCandidato from './paginas/PainelCandidato'
import CurriculoCandidato from './paginas/CurriculoCandidato'
import VagasDisponiveis from './paginas/VagasDisponiveis'
import InteressesRecebidos from './paginas/InteressesRecebidos'
import PainelEmpresa from './paginas/PainelEmpresa'
import CurriculoVisaoEmpresa from './paginas/CurriculoVisaoEmpresa'
import PublicarVaga from './paginas/PublicarVaga'
import PainelAdmin from './paginas/PainelAdmin'
import './App.css'

function RedirecionarInicio() {
  const { autenticado, perfil } = useAuth()

  if (!autenticado) {
    return <Navigate to="/login" replace />
  }
  if (perfil === 'candidato') return <Navigate to="/candidato" replace />
  if (perfil === 'empresa') return <Navigate to="/empresa" replace />
  if (perfil === 'admin') return <Navigate to="/admin" replace />

  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RedirecionarInicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />

          <Route
            path="/candidato"
            element={
              <RotaProtegida perfilExigido="candidato">
                <PainelCandidato />
              </RotaProtegida>
            }
          />
          <Route
            path="/candidato/curriculo"
            element={
              <RotaProtegida perfilExigido="candidato">
                <CurriculoCandidato />
              </RotaProtegida>
            }
          />
          <Route
            path="/candidato/vagas"
            element={
              <RotaProtegida perfilExigido="candidato">
                <VagasDisponiveis />
              </RotaProtegida>
            }
          />
          <Route
            path="/candidato/interesses"
            element={
              <RotaProtegida perfilExigido="candidato">
                <InteressesRecebidos />
              </RotaProtegida>
            }
          />

          <Route
            path="/empresa"
            element={
              <RotaProtegida perfilExigido="empresa">
                <PainelEmpresa />
              </RotaProtegida>
            }
          />
          <Route
            path="/empresa/candidatos/:candidatoId"
            element={
              <RotaProtegida perfilExigido="empresa">
                <CurriculoVisaoEmpresa />
              </RotaProtegida>
            }
          />
          <Route
            path="/empresa/vagas/nova"
            element={
              <RotaProtegida perfilExigido="empresa">
                <PublicarVaga />
              </RotaProtegida>
            }
          />

          <Route
            path="/admin"
            element={
              <RotaProtegida perfilExigido="admin">
                <PainelAdmin />
              </RotaProtegida>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
