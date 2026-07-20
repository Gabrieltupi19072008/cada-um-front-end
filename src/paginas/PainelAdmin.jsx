import { useEffect, useState } from 'react'
import { Settings, Clock, BarChart2, Download, Check, LogOut } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Botao from '../componentes/Botao'
import BarraProgresso from '../componentes/BarraProgresso'
import cliente from '../api/cliente'
import { useAuth } from '../contexto/AuthContext'

export default function PainelAdmin() {
  const [estatisticas, setEstatisticas] = useState(null)
  const [pendentes, setPendentes] = useState([])
  const [cotas, setCotas] = useState([])
  const [erro, setErro] = useState('')
  const { sair } = useAuth()

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
              <div key={`${item.tipo}-${item.id}`} className="linha-aprovacao">
                <div className="linha-aprovacao__texto">
                  <strong>
                    {item.nome} {item.tipo === 'candidato' ? '(candidato)' : ''}
                  </strong>
                  <p>{item.subtitulo}</p>
                </div>
                <Botao variante="sucesso" icone={Check} onClick={() => aprovar(item)}>
                  Aprovar
                </Botao>
              </div>
            ))}
          </div>

          <div>
            <h2 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart2 size={16} /> Cota TEA por Empresa
            </h2>
            {cotas.length === 0 && <p className="texto-suave">Nenhuma empresa aprovada ainda.</p>}
            {cotas.map((cota) => (
              <div key={cota.empresa_id} className="linha-cota">
                <div className="linha-cota__topo">
                  <span>{cota.razao_social}</span>
                  <strong>{cota.percentual}%</strong>
                </div>
                <BarraProgresso
                  valor={cota.percentual}
                  cor={cota.percentual >= 80 ? 'sucesso' : cota.percentual >= 50 ? 'acento' : 'alerta'}
                />
              </div>
            ))}
          </div>
        </div>

        <Botao variante="primario" icone={Download} className="botao--bloco" onClick={exportarRelatorio} style={{ marginTop: 8 }}>
          Exportar relatório
        </Botao>
      </Cartao>
    </Layout>
  )
}
