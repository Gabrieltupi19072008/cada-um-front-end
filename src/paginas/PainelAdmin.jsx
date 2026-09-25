import { useEffect, useState } from 'react'
import { BarChart3, Building2, Download, Check, Users } from 'lucide-react'
import Layout from '../componentes/Layout'
import Botao from '../componentes/Botao'
import BarraProgresso from '../componentes/BarraProgresso'
import SeletorFoto from '../componentes/SeletorFoto'
import Metrica from '../componentes/Metrica'
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
      <Layout tema="admin" largura="largo">
        <p className="aviso aviso--erro">{erro}</p>
      </Layout>
    )
  }

  if (!estatisticas) {
    return (
      <Layout tema="admin" largura="largo">
        <p className="texto-suave">Carregando...</p>
      </Layout>
    )
  }

  return (
    <Layout tema="admin" largura="largo">
      <section className="boas-vindas">
        <div>
          <span className="sobretitulo">VISÃO GERAL DA PLATAFORMA</span>
          <h1>Olá, {meuUsuario ? meuUsuario.nome.split(' ')[0] : 'administrador'}.</h1>
          <p>Acompanhe os indicadores e mantenha a comunidade segura.</p>
        </div>
        <div className="boas-vindas__acoes">
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
          <button type="button" className="acao-destaque acao-destaque--contorno" onClick={exportarRelatorio}>
            <Download size={20} /> Exportar relatório
          </button>
        </div>
      </section>

      <div className="grade-metricas">
        <Metrica icone={Users} valor={estatisticas.total_candidatos} rotulo="Candidatos" detalhe="Cadastrados na plataforma" />
        <Metrica icone={Building2} valor={estatisticas.total_empresas} rotulo="Empresas" detalhe="Parceiras cadastradas" />
        <Metrica icone={BarChart3} valor={`${estatisticas.cota_media}%`} rotulo="Cota média PcD" detalhe="Entre empresas obrigadas" />
        <Metrica
          icone={Check}
          valor={estatisticas.aprovacoes_pendentes}
          rotulo="Aprovações pendentes"
          detalhe={estatisticas.aprovacoes_pendentes > 0 ? 'Requer atenção' : 'Tudo em dia'}
          destaque
        />
      </div>

      <div className="grade-conteudo grade-conteudo--metades">
        <section className="painel">
          <header className="painel-titulo">
            <div>
              <h2>Aprovações pendentes</h2>
              <p>Empresas e candidatos aguardando validação</p>
            </div>
          </header>
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
        </section>

        <section className="painel">
          <header className="painel-titulo">
            <div>
              <h2>Cota PcD por empresa</h2>
              <p>Lei nº 8.213/91</p>
            </div>
          </header>
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
      </div>
    </Layout>
  )
}
