import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Building2 } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Botao from '../componentes/Botao'
import Aviso from '../componentes/Aviso'
import Logo from '../componentes/Logo'
import cliente from '../api/cliente'
import { ESTADOS_BRASIL } from '../dados/estadosBrasil'

const ROTULOS_CADASTRO = {
  cpf: 'CPF',
  cidade: 'Cidade',
  estado: 'Estado (UF)',
  telefone: 'Telefone',
  cnpj: 'CNPJ',
  razao_social: 'Razão social',
  setor: 'Setor',
}

const CAMPOS_POR_TIPO = {
  candidato: ['cpf', 'cidade', 'estado', 'telefone'],
  empresa: ['cnpj', 'razao_social', 'setor', 'cidade', 'estado'],
}

export default function Cadastro() {
  const navegar = useNavigate()
  const [tipoCadastro, setTipoCadastro] = useState('candidato')
  const [dados, setDados] = useState({ nome: '', email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)

  function atualizar(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
  }

  async function aoCadastrar(evento) {
    evento.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await cliente.post(`/auth/cadastro/${tipoCadastro}`, dados)
      setSucesso(true)
      setTimeout(() => navegar('/login'), 1500)
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível cadastrar')
    } finally {
      setCarregando(false)
    }
  }

  const camposExtras = CAMPOS_POR_TIPO[tipoCadastro]

  return (
    <Layout largura="cheia">
      <div className="tela-login">
        <div className="login-cartao login-cartao--simples">
          <Cartao>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <Logo tamanho={54} mostrarNome={false} />
            </div>
            <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Criar nova conta</h2>

            {erro && <Aviso variante="erro">{erro}</Aviso>}
            {sucesso && <Aviso variante="sucesso">Conta criada! Redirecionando para o login...</Aviso>}

            <form onSubmit={aoCadastrar}>
              <div className="campo">
                Sou um(a):
                <div className="seletor-tipo">
                  <button
                    type="button"
                    className={tipoCadastro === 'candidato' ? 'ativo' : ''}
                    onClick={() => setTipoCadastro('candidato')}
                  >
                    <User size={15} /> Pessoa com TEA
                  </button>
                  <button
                    type="button"
                    className={tipoCadastro === 'empresa' ? 'ativo' : ''}
                    onClick={() => setTipoCadastro('empresa')}
                  >
                    <Building2 size={15} /> Empresa
                  </button>
                </div>
              </div>

              <label className="campo">
                Nome completo
                <input value={dados.nome} onChange={(e) => atualizar('nome', e.target.value)} required />
              </label>
              <label className="campo">
                E-mail
                <input
                  type="email"
                  value={dados.email}
                  onChange={(e) => atualizar('email', e.target.value)}
                  required
                />
              </label>
              <label className="campo">
                Senha
                <input
                  type="password"
                  value={dados.senha}
                  onChange={(e) => atualizar('senha', e.target.value)}
                  minLength={8}
                  required
                />
                <small className="campo-dica">Mínimo de 8 caracteres, com letras e números</small>
              </label>

              {camposExtras.map((campo) => (
                <label className="campo" key={campo}>
                  {ROTULOS_CADASTRO[campo]}
                  {campo === 'estado' ? (
                    <select value={dados.estado || ''} onChange={(e) => atualizar('estado', e.target.value)}>
                      <option value="">Selecione</option>
                      {ESTADOS_BRASIL.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input value={dados[campo] || ''} onChange={(e) => atualizar(campo, e.target.value)} />
                  )}
                </label>
              ))}

              <Botao type="submit" variante="gradiente" className="botao--bloco" disabled={carregando}>
                {carregando ? 'Enviando...' : 'Criar conta'}
              </Botao>
            </form>

            <p className="login-link">
              Já tem conta?{' '}
              <span onClick={() => navegar('/login')} style={{ cursor: 'pointer', color: 'var(--acento)' }}>
                Entrar
              </span>
            </p>
          </Cartao>
        </div>
      </div>
    </Layout>
  )
}
