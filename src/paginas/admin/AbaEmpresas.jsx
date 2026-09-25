import { useEffect, useState } from 'react'
import { Check, ExternalLink, Search } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Aviso from '../../componentes/Aviso'
import Selo from '../../componentes/Selo'
import Janela from '../../componentes/Janela'
import { dataCompleta, iniciais, local, semAcento } from '../../dados/formatos'

function nomeDa(empresa) {
  return empresa.razao_social || empresa.usuario.nome
}

function linkDoSite(site) {
  return /^https?:\/\//i.test(site) ? site : `https://${site}`
}

export default function AbaEmpresas() {
  const [empresas, setEmpresas] = useState(null)
  const [erro, setErro] = useState('')
  const [termo, setTermo] = useState('')
  const [abertaId, setAbertaId] = useState(null)
  const [receita, setReceita] = useState({})
  const [aprovando, setAprovando] = useState(false)

  function carregar() {
    cliente
      .get('/admin/empresas')
      .then((resposta) => setEmpresas(resposta.data))
      .catch(() => setErro('Não foi possível carregar as empresas'))
  }

  useEffect(() => {
    carregar()
  }, [])

  async function consultarReceita(empresaId) {
    setReceita((atual) => ({ ...atual, [empresaId]: { consultando: true } }))
    try {
      const resposta = await cliente.get(`/admin/empresas/${empresaId}/cnpj-receita`)
      setReceita((atual) => ({ ...atual, [empresaId]: { dados: resposta.data } }))
    } catch (erroRequisicao) {
      setReceita((atual) => ({
        ...atual,
        [empresaId]: { erro: erroRequisicao.response?.data?.detail || 'Não foi possível consultar a Receita' },
      }))
    }
  }

  async function aprovar(empresaId) {
    setAprovando(true)
    try {
      await cliente.put(`/admin/empresas/${empresaId}/aprovar`)
      carregar()
    } finally {
      setAprovando(false)
    }
  }

  const busca = semAcento(termo.trim())
  const filtradas = (empresas || []).filter(
    (empresa) =>
      !busca ||
      [nomeDa(empresa), empresa.cnpj, empresa.setor, empresa.cidade].some((texto) =>
        semAcento(texto).replace(/[./-]/g, '').includes(busca.replace(/[./-]/g, ''))
      )
  )
  const aberta = (empresas || []).find((empresa) => empresa.id === abertaId)
  const consulta = aberta ? receita[aberta.id] || {} : {}

  return (
    <div>
      <form className="barra-busca" role="search" onSubmit={(e) => e.preventDefault()}>
        <Search size={20} />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome, CNPJ, setor ou cidade"
          aria-label="Buscar empresas"
        />
        <button type="submit">Buscar</button>
      </form>

      {erro && <Aviso variante="erro">{erro}</Aviso>}
      {!erro && empresas === null && <p className="texto-suave">Carregando...</p>}

      {empresas !== null && (
        <section className="painel tabela-painel">
          {filtradas.length === 0 ? (
            <p className="texto-suave">Nenhuma empresa encontrada.</p>
          ) : (
            <div className="tabela-rolagem">
              <table className="tabela-admin">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>CNPJ</th>
                    <th>Setor</th>
                    <th>Vagas</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td>
                        <div className="tabela-pessoa">
                          <span>{iniciais(nomeDa(empresa))}</span>
                          <b>{nomeDa(empresa)}</b>
                        </div>
                      </td>
                      <td>{empresa.cnpj || '—'}</td>
                      <td>{empresa.setor || '—'}</td>
                      <td>{empresa.vagas_ativas === undefined ? '—' : `${empresa.vagas_ativas} ativa(s)`}</td>
                      <td>
                        <Selo variante={empresa.aprovada ? 'sucesso' : 'alerta'}>
                          {empresa.aprovada ? 'Verificada' : 'Pendente'}
                        </Selo>
                      </td>
                      <td>
                        <Botao variante="contorno" onClick={() => setAbertaId(empresa.id)}>
                          Detalhes
                        </Botao>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <Janela aberta={Boolean(aberta)} aoFechar={() => setAbertaId(null)} titulo={aberta ? nomeDa(aberta) : ''}>
        {aberta && (
          <>
            <header className="janela__cabecalho">
              {aberta.usuario.foto_url ? (
                <span className="janela__foto" style={{ backgroundImage: `url(${aberta.usuario.foto_url})` }} />
              ) : (
                <span className="janela__foto">{iniciais(nomeDa(aberta))}</span>
              )}
              <div>
                <h2>{nomeDa(aberta)}</h2>
                <p>{aberta.setor || 'Setor não informado'}</p>
              </div>
              <Selo variante={aberta.aprovada ? 'sucesso' : 'alerta'}>
                {aberta.aprovada ? 'Verificada' : 'Pendente'}
              </Selo>
            </header>

            <dl className="dados-grade">
              <div>
                <dt>CNPJ</dt>
                <dd>{aberta.cnpj || 'Não informado'}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{aberta.usuario.email}</dd>
              </div>
              <div>
                <dt>Cidade-sede</dt>
                <dd>{local(aberta)}</dd>
              </div>
              <div>
                <dt>Funcionários</dt>
                <dd>{aberta.total_funcionarios ?? 'Não informado'}</dd>
              </div>
              <div>
                <dt>Vagas ativas</dt>
                <dd>{aberta.vagas_ativas ?? '—'}</dd>
              </div>
              <div>
                <dt>Cadastrada em</dt>
                <dd>{dataCompleta(aberta.criado_em)}</dd>
              </div>
              <div className="dados-grade__largo">
                <dt>Site</dt>
                <dd>
                  {aberta.site ? (
                    <a href={linkDoSite(aberta.site)} target="_blank" rel="noreferrer">
                      {aberta.site} <ExternalLink size={13} />
                    </a>
                  ) : (
                    'Não tem site'
                  )}
                </dd>
              </div>
            </dl>

            <h3 className="janela__secao">Sobre a empresa</h3>
            <p className="janela__texto">{aberta.descricao || 'A empresa ainda não escreveu uma descrição.'}</p>

            <h3 className="janela__secao">Conferir CNPJ na Receita Federal</h3>
            {!consulta.dados && (
              <Botao
                variante="contorno"
                onClick={() => consultarReceita(aberta.id)}
                disabled={consulta.consultando || !aberta.cnpj}
              >
                {consulta.consultando ? 'Consultando...' : aberta.cnpj ? 'Consultar Receita' : 'Sem CNPJ para consultar'}
              </Botao>
            )}
            {consulta.erro && <Aviso variante="erro">{consulta.erro}</Aviso>}
            {consulta.dados && (
              <div className="comparacao">
                <div className="comparacao-bloco">
                  <h3>Informado pela empresa</h3>
                  <div className="comparacao-linha">
                    <span className="comparacao-linha__chave">Razão social</span>
                    <span className="comparacao-linha__valor">{nomeDa(aberta)}</span>
                  </div>
                  <div className="comparacao-linha">
                    <span className="comparacao-linha__chave">CNPJ</span>
                    <span className="comparacao-linha__valor">{aberta.cnpj}</span>
                  </div>
                </div>
                <div className="comparacao-bloco comparacao-bloco--receita">
                  <h3>Dados oficiais (Receita Federal)</h3>
                  {consulta.dados.encontrado ? (
                    <>
                      <div className="comparacao-linha">
                        <span className="comparacao-linha__chave">Razão social</span>
                        <span className="comparacao-linha__valor">{consulta.dados.razao_social}</span>
                      </div>
                      <div className="comparacao-linha">
                        <span className="comparacao-linha__chave">Situação</span>
                        <span className="comparacao-linha__valor">{consulta.dados.situacao_cadastral}</span>
                      </div>
                      <div className="comparacao-linha">
                        <span className="comparacao-linha__chave">Nome fantasia</span>
                        <span className="comparacao-linha__valor">{consulta.dados.nome_fantasia || '—'}</span>
                      </div>
                    </>
                  ) : (
                    <p className="texto-suave">CNPJ não encontrado na Receita — confira manualmente.</p>
                  )}
                </div>
              </div>
            )}

            {!aberta.aprovada && (
              <div className="janela__rodape">
                <Botao variante="primario" icone={Check} onClick={() => aprovar(aberta.id)} disabled={aprovando}>
                  {aprovando ? 'Aprovando...' : 'Aprovar empresa'}
                </Botao>
              </div>
            )}
          </>
        )}
      </Janela>
    </div>
  )
}
