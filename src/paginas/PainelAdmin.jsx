import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2, Check, Download, ShieldCheck, User } from 'lucide-react'
import Layout from '../componentes/Layout'
import Botao from '../componentes/Botao'
import BarraProgresso from '../componentes/BarraProgresso'
import SeletorFoto from '../componentes/SeletorFoto'
import Selo from '../componentes/Selo'
import CabecalhoPagina from '../componentes/CabecalhoPagina'
import Destaque, { IconeDestaque } from '../componentes/Destaque'
import cliente from '../api/cliente'
import { useAuth } from '../contexto/AuthContext'

export default function PainelAdmin() {
  const [meuUsuario, setMeuUsuario] = useState(null)
  const [estatisticas, setEstatisticas] = useState(null)
  const [pendentes, setPendentes] = useState([])
  const [cotas, setCotas] = useState([])
  const [erro, setErro] = useState('')
  const [dadosReceita, setDadosReceita] = useState({})
  const [consultandoReceita, setConsultandoReceita] = useState({})
  const [erroReceita, setErroReceita] = useState({})
  const { recarregarUsuario } = useAuth()
  const [parametros] = useSearchParams()
  const secao = parametros.get('secao')

  async function consultarReceita(empresaId) {
    setConsultandoReceita((atual) => ({ ...atual, [empresaId]: true }))
    setErroReceita((atual) => ({ ...atual, [empresaId]: '' }))
    try {
      const resposta = await cliente.get(`/admin/empresas/${empresaId}/cnpj-receita`)
      setDadosReceita((atual) => ({ ...atual, [empresaId]: resposta.data }))
    } catch (erroRequisicao) {
      setErroReceita((atual) => ({
        ...atual,
        [empresaId]: erroRequisicao.response?.data?.detail || 'Não foi possível consultar a Receita',
      }))
    } finally {
      setConsultandoReceita((atual) => ({ ...atual, [empresaId]: false }))
    }
  }

  function carregarMeuUsuario() {
    cliente.get('/usuarios/me').then((resposta) => setMeuUsuario(resposta.data))
  }

  async function carregarTudo() {
    try {
      const [estatisticasResp, empresasResp, candidatosResp, cotaResp] = await Promise.all([
        cliente.get('/admin/estatisticas'),
        cliente.get('/admin/empresas', { params: { aprovada: false } }),
        cliente.get('/admin/candidatos', { params: { aprovado: false } }),
        cliente.get('/admin/relatorio-cota'),
      ])
      setEstatisticas(estatisticasResp.data)
      setPendentes([
        ...empresasResp.data.map((e) => ({
          tipo: 'empresa',
          id: e.id,
          nome: e.razao_social || e.usuario.nome,
          subtitulo: 'Aguardando aprovação',
          cnpj: e.cnpj,
        })),
        ...candidatosResp.data.map((c) => ({
          tipo: 'candidato',
          id: c.id,
          nome: c.usuario.nome,
          subtitulo: 'Perfil em revisão',
        })),
      ])
      setCotas(cotaResp.data)
    } catch {
      setErro('Não foi possível carregar o painel')
    }
  }

  useEffect(() => {
    carregarTudo()
    carregarMeuUsuario()
  }, [])

  async function aprovar(item) {
    await cliente.put(`/admin/${item.tipo}s/${item.id}/aprovar`)
    carregarTudo()
  }

  async function exportarRelatorio() {
    const resposta = await cliente.get('/admin/relatorio-cota/exportar', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([resposta.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'relatorio_cota.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  if (erro) {
    return (
      <Layout tema="admin" largura="inicio">
        <p className="aviso aviso--erro">{erro}</p>
      </Layout>
    )
  }

  if (!estatisticas) {
    return (
      <Layout tema="admin" largura="inicio">
        <p className="texto-suave">Carregando...</p>
      </Layout>
    )
  }

  function renderAprovacao(item) {
    const receita = dadosReceita[item.id]
    return (
      <div key={`${item.tipo}-${item.id}`} className="aprovacao">
        <div className="linha-pessoa">
          <span className="linha-pessoa__avatar">{item.tipo === 'empresa' ? <Building2 size={19} /> : <User size={19} />}</span>
          <div>
            <b>{item.nome}</b>
            <p>
              {item.tipo === 'empresa' ? `Empresa · CNPJ ${item.cnpj || 'não informado'}` : 'Candidato · perfil em revisão'}
            </p>
          </div>
          <Selo variante="alerta">Aguardando</Selo>
          {item.tipo === 'empresa' && !receita && (
            <Botao variante="contorno" onClick={() => consultarReceita(item.id)} disabled={!!consultandoReceita[item.id]}>
              {consultandoReceita[item.id] ? 'Consultando...' : 'Consultar Receita'}
            </Botao>
          )}
          <Botao variante="primario" icone={Check} onClick={() => aprovar(item)}>
            Aprovar
          </Botao>
        </div>
        {item.tipo === 'empresa' && erroReceita[item.id] && <p className="aviso aviso--erro">{erroReceita[item.id]}</p>}
        {item.tipo === 'empresa' && receita && (
          <div className="comparacao">
            <div className="comparacao-bloco">
              <h3>Informado pela empresa</h3>
              <div className="comparacao-linha">
                <span className="comparacao-linha__chave">Razão social</span>
                <span className="comparacao-linha__valor">{item.nome}</span>
              </div>
              <div className="comparacao-linha">
                <span className="comparacao-linha__chave">CNPJ</span>
                <span className="comparacao-linha__valor">{item.cnpj || 'Não informado'}</span>
              </div>
            </div>
            <div className="comparacao-bloco comparacao-bloco--receita">
              <h3>Dados oficiais (Receita Federal)</h3>
              {receita.encontrado ? (
                <>
                  <div className="comparacao-linha">
                    <span className="comparacao-linha__chave">Razão social</span>
                    <span className="comparacao-linha__valor">{receita.razao_social}</span>
                  </div>
                  <div className="comparacao-linha">
                    <span className="comparacao-linha__chave">Situação</span>
                    <span className="comparacao-linha__valor">{receita.situacao_cadastral}</span>
                  </div>
                  <div className="comparacao-linha">
                    <span className="comparacao-linha__chave">Nome fantasia</span>
                    <span className="comparacao-linha__valor">{receita.nome_fantasia || '—'}</span>
                  </div>
                </>
              ) : (
                <p className="texto-suave">CNPJ não encontrado na Receita — confira manualmente antes de aprovar.</p>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (secao === 'aprovacoes') {
    return (
      <Layout tema="admin" largura="inicio">
        <CabecalhoPagina
          sobretitulo="APROVAÇÕES"
          titulo="Cadastros esperando aprovação"
          descricao="Revise cada empresa e candidato antes de liberar o acesso à plataforma."
        />
        <section className="painel lista-inicio">
          {pendentes.length === 0 && <p className="texto-suave">Nenhuma aprovação pendente. Tudo em dia!</p>}
          {pendentes.map(renderAprovacao)}
        </section>
      </Layout>
    )
  }

  if (secao === 'cota') {
    return (
      <Layout tema="admin" largura="inicio">
        <CabecalhoPagina
          sobretitulo="LEI DE COTAS"
          titulo="Cota PcD por empresa"
          descricao="Quanto cada empresa aprovada já cumpriu da cota legal (Lei nº 8.213/91)."
          acoes={
            <Botao variante="contorno" icone={Download} onClick={exportarRelatorio}>
              Exportar relatório
            </Botao>
          }
        />
        <section className="painel lista-inicio">
          {cotas.length === 0 && <p className="texto-suave">Nenhuma empresa aprovada ainda.</p>}
          {cotas.map((cota) =>
            cota.vagas_necessarias === 0 ? (
              <div key={cota.empresa_id} className="linha-cota">
                <div className="linha-cota__topo">
                  <span>{cota.razao_social}</span>
                  <span className="texto-suave">Isenta (menos de 100 funcionários ou não informado)</span>
                </div>
              </div>
            ) : (
              <div key={cota.empresa_id} className="linha-cota">
                <div className="linha-cota__topo">
                  <span>
                    {cota.razao_social} — {cota.aceitos}/{cota.vagas_necessarias} vagas ({cota.percentual_legal}%
                    exigido, {cota.total_funcionarios} funcionários)
                  </span>
                  <strong>{cota.percentual_cumprido}%</strong>
                </div>
                <BarraProgresso
                  valor={cota.percentual_cumprido}
                  cor={cota.percentual_cumprido >= 80 ? 'sucesso' : cota.percentual_cumprido >= 50 ? 'acento' : 'alerta'}
                />
              </div>
            )
          )}
        </section>
      </Layout>
    )
  }

  const empresasPendentes = pendentes.filter((item) => item.tipo === 'empresa').length
  const candidatosPendentes = pendentes.length - empresasPendentes
  const partesPendentes = [
    empresasPendentes > 0 && `${empresasPendentes} ${empresasPendentes === 1 ? 'empresa' : 'empresas'}`,
    candidatosPendentes > 0 && `${candidatosPendentes} ${candidatosPendentes === 1 ? 'candidato' : 'candidatos'}`,
  ].filter(Boolean)

  return (
    <Layout tema="admin" largura="inicio">
      <div className="inicio">
        <div className="saudacao-com-foto">
          <header className="saudacao">
            <span>ADMINISTRAÇÃO</span>
            <h1>Olá, {meuUsuario ? meuUsuario.nome.split(' ')[0] : 'administrador'}.</h1>
            <p>Mantenha a comunidade segura e acompanhe a Lei de Cotas.</p>
          </header>
          {meuUsuario && (
            <SeletorFoto
              fotoUrl={meuUsuario.foto_url}
              nome={meuUsuario.nome}
              aoAtualizar={() => {
                carregarMeuUsuario()
                recarregarUsuario()
              }}
              tamanho={56}
            />
          )}
        </div>

        {pendentes.length > 0 ? (
          <Destaque
            visual={<IconeDestaque icone={ShieldCheck} />}
            sobretitulo="PRECISA DA SUA ATENÇÃO"
            titulo={pendentes.length === 1 ? '1 cadastro esperando aprovação' : `${pendentes.length} cadastros esperando aprovação`}
            texto={`${partesPendentes.join(' e ')}. Empresas só podem publicar vagas depois de aprovadas.`}
            acao={{ rotulo: 'Revisar agora', para: '/admin?secao=aprovacoes' }}
          />
        ) : (
          <Destaque
            visual={<IconeDestaque icone={ShieldCheck} />}
            sobretitulo="TUDO EM DIA"
            titulo="Nenhum cadastro esperando aprovação"
            texto="Enquanto isso, acompanhe como as empresas estão cumprindo a cota."
            acao={{ rotulo: 'Ver cota por empresa', para: '/admin?secao=cota' }}
          />
        )}

        <div className="numeros-inicio">
          <div>
            <b>{estatisticas.total_candidatos.toLocaleString('pt-BR')}</b>
            <span>candidatos</span>
          </div>
          <div>
            <b>{estatisticas.total_empresas.toLocaleString('pt-BR')}</b>
            <span>empresas</span>
          </div>
          <div>
            <b>{String(estatisticas.cota_media).replace('.', ',')}%</b>
            <span>cota média PcD</span>
          </div>
        </div>

        {pendentes.length > 0 && (
          <section className="painel lista-inicio">
            <header>
              <h2>Aprovações pendentes</h2>
              {pendentes.length > 3 && <Link to="/admin?secao=aprovacoes">Ver todas →</Link>}
            </header>
            {pendentes.slice(0, 3).map(renderAprovacao)}
          </section>
        )}
      </div>
    </Layout>
  )
}
