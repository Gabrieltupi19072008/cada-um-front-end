import { useEffect, useState } from 'react'
import { Settings, Clock, BarChart2, Download, Check, LogOut } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Botao from '../componentes/Botao'
import BarraProgresso from '../componentes/BarraProgresso'
import SeletorFoto from '../componentes/SeletorFoto'
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
  const { sair } = useAuth()

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
      <Layout tema="admin">
        <p className="aviso aviso--erro">{erro}</p>
      </Layout>
    )
  }

  if (!estatisticas) {
    return (
      <Layout tema="admin">
        <p className="texto-suave">Carregando...</p>
      </Layout>
    )
  }

  return (
    <Layout tema="admin" largura="largo" centralizar>
      <Cartao
        titulo="Painel Admin — Visão Geral da Plataforma"
        icone={Settings}
        acoes={
          <button
            type="button"
            onClick={sair}
            title="Sair"
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
          >
            <LogOut size={18} />
          </button>
        }
      >
        {meuUsuario && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <SeletorFoto fotoUrl={meuUsuario.foto_url} nome={meuUsuario.nome} aoAtualizar={carregarMeuUsuario} tamanho={64} />
          </div>
        )}
        <div className="grade-estatisticas">
          <div className="estatistica-cartao">
            <p className="estatistica-cartao__valor">{estatisticas.total_candidatos}</p>
            <p className="estatistica-cartao__rotulo">Candidatos</p>
          </div>
          <div className="estatistica-cartao">
            <p className="estatistica-cartao__valor">{estatisticas.total_empresas}</p>
            <p className="estatistica-cartao__rotulo">Empresas</p>
          </div>
          <div className="estatistica-cartao">
            <p className="estatistica-cartao__valor">{estatisticas.cota_media}%</p>
            <p className="estatistica-cartao__rotulo">Cota média</p>
          </div>
          <div className="estatistica-cartao">
            <p className="estatistica-cartao__valor">{estatisticas.aprovacoes_pendentes}</p>
            <p className="estatistica-cartao__rotulo">Aprovações pendentes</p>
          </div>
        </div>

        <div className="grade-admin">
          <div>
            <h2 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} /> Aprovações Pendentes
            </h2>
            {pendentes.length === 0 && <p className="texto-suave">Nenhuma aprovação pendente.</p>}
            {pendentes.map((item) => (
              <div key={`${item.tipo}-${item.id}`} className="linha-aprovacao" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div className="linha-aprovacao__texto">
                    <strong>
                      {item.nome} {item.tipo === 'candidato' ? '(candidato)' : ''}
                    </strong>
                    <p>{item.subtitulo}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {item.tipo === 'empresa' && !dadosReceita[item.id] && (
                      <Botao
                        variante="contorno"
                        onClick={() => consultarReceita(item.id)}
                        disabled={!!consultandoReceita[item.id]}
                      >
                        {consultandoReceita[item.id] ? 'Consultando...' : 'Consultar Receita'}
                      </Botao>
                    )}
                    <Botao variante="sucesso" icone={Check} onClick={() => aprovar(item)}>
                      Aprovar
                    </Botao>
                  </div>
                </div>
                {item.tipo === 'empresa' && erroReceita[item.id] && (
                  <p className="aviso aviso--erro" style={{ marginTop: 8 }}>
                    {erroReceita[item.id]}
                  </p>
                )}
                {item.tipo === 'empresa' && dadosReceita[item.id] && (
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
                      {dadosReceita[item.id].encontrado ? (
                        <>
                          <div className="comparacao-linha">
                            <span className="comparacao-linha__chave">Razão social</span>
                            <span className="comparacao-linha__valor">{dadosReceita[item.id].razao_social}</span>
                          </div>
                          <div className="comparacao-linha">
                            <span className="comparacao-linha__chave">Situação</span>
                            <span className="comparacao-linha__valor">{dadosReceita[item.id].situacao_cadastral}</span>
                          </div>
                          <div className="comparacao-linha">
                            <span className="comparacao-linha__chave">Nome fantasia</span>
                            <span className="comparacao-linha__valor">{dadosReceita[item.id].nome_fantasia || '—'}</span>
                          </div>
                        </>
                      ) : (
                        <p className="texto-suave">CNPJ não encontrado na Receita — confira manualmente antes de aprovar.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <h2 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart2 size={16} /> Cota PcD por Empresa (Lei nº 8.213/91)
            </h2>
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
          </div>
        </div>

        <Botao variante="primario" icone={Download} className="botao--bloco" onClick={exportarRelatorio} style={{ marginTop: 8 }}>
          Exportar relatório
        </Botao>
      </Cartao>
    </Layout>
  )
}
