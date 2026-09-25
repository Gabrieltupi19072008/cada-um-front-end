import { useEffect, useState } from 'react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Aviso from '../../componentes/Aviso'
import SeletorFoto from '../../componentes/SeletorFoto'
import { useAuth } from '../../contexto/AuthContext'
import { ESTADOS_BRASIL } from '../../dados/estadosBrasil'

const CAMPOS = ['razao_social', 'setor', 'total_funcionarios', 'cidade', 'estado', 'site', 'descricao']

function extrairDados(perfil) {
  return Object.fromEntries(CAMPOS.map((campo) => [campo, perfil[campo] ?? '']))
}

export default function AbaDescricao() {
  const [perfil, setPerfil] = useState(null)
  const [dados, setDados] = useState(null)
  const [salvos, setSalvos] = useState(null)
  const [contratando, setContratando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const { recarregarUsuario } = useAuth()

  function carregar() {
    return cliente
      .get('/empresas/me')
      .then((resposta) => {
        setPerfil(resposta.data)
        const extraidos = extrairDados(resposta.data)
        setDados(extraidos)
        setSalvos(extraidos)
      })
      .catch(() => setErro('Não foi possível carregar sua empresa'))
  }

  useEffect(() => {
    carregar()
    cliente
      .get('/empresas/me/vagas')
      .then((resposta) => setContratando(resposta.data.some((vaga) => vaga.ativa)))
      .catch(() => {})
  }, [])

  function atualizar(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
    setSucesso(false)
  }

  async function salvar(evento) {
    evento.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      const corpo = Object.fromEntries(
        CAMPOS.map((campo) => {
          const valor = typeof dados[campo] === 'string' ? dados[campo].trim() : dados[campo]
          if (campo === 'total_funcionarios') return [campo, valor === '' ? null : Number(valor)]
          return [campo, valor === '' ? null : valor]
        })
      )
      const resposta = await cliente.put('/empresas/me', corpo)
      setPerfil(resposta.data)
      const extraidos = extrairDados(resposta.data)
      setDados(extraidos)
      setSalvos(extraidos)
      setSucesso(true)
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível salvar')
    } finally {
      setSalvando(false)
    }
  }

  if (!perfil || !dados) {
    return erro ? <Aviso variante="erro">{erro}</Aviso> : <p className="texto-suave">Carregando...</p>
  }

  const sujo = CAMPOS.some((campo) => String(dados[campo]) !== String(salvos[campo]))
  const nome = perfil.razao_social || perfil.usuario.nome

  return (
    <div className="perfil-empresa">
      <section className="painel perfil-empresa__capa">
        <div className="perfil-empresa__fundo" />
        <div className="perfil-empresa__foto">
          <SeletorFoto
            fotoUrl={perfil.usuario.foto_url}
            nome={perfil.usuario.nome}
            aoAtualizar={() => {
              carregar()
              recarregarUsuario()
            }}
            tamanho={64}
          />
        </div>
        <div className="perfil-empresa__info">
          <h2>{nome}</h2>
          <p>{[perfil.cnpj && `CNPJ ${perfil.cnpj}`, perfil.setor].filter(Boolean).join(' · ') || 'Complete os dados ao lado'}</p>
          <div className="perfil-empresa__selos">
            {perfil.aprovada ? <i>Empresa verificada</i> : <i className="pendente">Aguardando aprovação</i>}
            {contratando && <i>Contratando</i>}
          </div>
        </div>
      </section>

      <form className="painel" onSubmit={salvar}>
        <header className="painel-titulo">
          <div>
            <h2>Informações gerais</h2>
            <p>Dados da empresa que os candidatos veem</p>
          </div>
        </header>

        {erro && <Aviso variante="erro">{erro}</Aviso>}
        {sucesso && !sujo && <Aviso variante="sucesso">Perfil atualizado com sucesso!</Aviso>}

        <div className="grade-formulario">
          <label className="campo campo--largo">
            Razão social
            <input value={dados.razao_social} onChange={(e) => atualizar('razao_social', e.target.value)} />
          </label>
          <label className="campo">
            CNPJ
            <input value={perfil.cnpj || 'Não informado'} disabled />
            <small className="campo-dica">O CNPJ não pode ser alterado por aqui.</small>
          </label>
          <label className="campo">
            Setor
            <input
              value={dados.setor}
              onChange={(e) => atualizar('setor', e.target.value)}
              placeholder="Ex: Tecnologia da Informação"
            />
          </label>
          <label className="campo">
            Número de funcionários
            <input
              type="number"
              min="0"
              value={dados.total_funcionarios}
              onChange={(e) => atualizar('total_funcionarios', e.target.value)}
              placeholder="Ex: 250"
            />
            <small className="campo-dica">Usado para calcular a sua cota PcD.</small>
          </label>
          <label className="campo">
            Site
            <input
              value={dados.site}
              onChange={(e) => atualizar('site', e.target.value)}
              placeholder="https://suaempresa.com.br"
            />
          </label>
          <label className="campo">
            Cidade-sede
            <input value={dados.cidade} onChange={(e) => atualizar('cidade', e.target.value)} />
          </label>
          <label className="campo">
            Estado
            <select value={dados.estado} onChange={(e) => atualizar('estado', e.target.value)}>
              <option value="">Selecione</option>
              {ESTADOS_BRASIL.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </label>
          <label className="campo campo--largo">
            Sobre a empresa
            <textarea
              value={dados.descricao}
              onChange={(e) => atualizar('descricao', e.target.value)}
              placeholder="Conte um pouco sobre a empresa: o que ela faz, sua cultura, o que valoriza em quem contrata..."
              rows={5}
            />
            <small className="campo-dica">Esse texto aparece para o candidato quando ele clica no nome da sua empresa.</small>
          </label>
        </div>

        <div className="nota-inclusao">
          <ShieldCheck size={20} />
          <div>
            <b>Compromisso com inclusão</b>
            <p>Sua empresa está cadastrada como parceira CADA UM e comprometida com a contratação inclusiva.</p>
          </div>
        </div>

        <div className="rodape-formulario">
          <Botao type="submit" variante="primario" disabled={salvando || !sujo}>
            {salvando ? 'Salvando...' : sujo ? 'Salvar alterações' : 'Tudo salvo'} <ArrowRight size={16} />
          </Botao>
        </div>
      </form>
    </div>
  )
}
