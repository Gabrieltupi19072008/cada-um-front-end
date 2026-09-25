import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Aviso from '../../componentes/Aviso'
import Selo from '../../componentes/Selo'
import Janela from '../../componentes/Janela'
import { dataCompleta, iniciais, local, mesAno, semAcento } from '../../dados/formatos'

const ROTULOS_GRAU_TEA = { leve: 'TEA Leve', moderado: 'TEA Moderado', severo: 'TEA Severo' }
const ROTULOS_VINCULO = { efetivo: 'Efetivo (CLT)', estagio: 'Estágio', menor_aprendiz: 'Menor aprendiz' }
const ROTULOS_NIVEL = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' }
const ROTULOS_ESCOLARIDADE = {
  fundamental_incompleto: 'Fundamental incompleto',
  fundamental_completo: 'Fundamental completo',
  medio_incompleto: 'Médio incompleto',
  medio_completo: 'Médio completo',
  superior_incompleto: 'Superior incompleto',
  superior_completo: 'Superior completo',
  pos_graduacao: 'Pós-graduação',
}

function periodo(experiencia) {
  const inicio = mesAno(experiencia.data_inicio)
  const fim = experiencia.emprego_atual ? 'atual' : mesAno(experiencia.data_fim)
  return `${inicio} — ${fim}`
}

export default function AbaCandidatos() {
  const [candidatos, setCandidatos] = useState(null)
  const [erro, setErro] = useState('')
  const [termo, setTermo] = useState('')
  const [aberto, setAberto] = useState(null)
  const [detalhe, setDetalhe] = useState(null)
  const [erroDetalhe, setErroDetalhe] = useState('')

  useEffect(() => {
    cliente
      .get('/admin/candidatos')
      .then((resposta) => setCandidatos(resposta.data))
      .catch(() => setErro('Não foi possível carregar os candidatos'))
  }, [])

  function abrir(candidato) {
    setAberto(candidato)
    setDetalhe(null)
    setErroDetalhe('')
    cliente
      .get(`/admin/candidatos/${candidato.id}`)
      .then((resposta) => setDetalhe(resposta.data))
      .catch(() => setErroDetalhe('Não foi possível carregar o perfil completo. Mostrando o resumo.'))
  }

  const busca = semAcento(termo.trim())
  const filtrados = (candidatos || []).filter(
    (candidato) =>
      !busca ||
      [candidato.usuario.nome, candidato.usuario.email, candidato.cidade, candidato.estado].some((texto) =>
        semAcento(texto).includes(busca)
      )
  )
  const perfil = detalhe || aberto

  return (
    <div>
      <form className="barra-busca" role="search" onSubmit={(e) => e.preventDefault()}>
        <Search size={20} />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome, e-mail ou cidade"
          aria-label="Buscar candidatos"
        />
        <button type="submit">Buscar</button>
      </form>

      {erro && <Aviso variante="erro">{erro}</Aviso>}
      {!erro && candidatos === null && <p className="texto-suave">Carregando...</p>}

      {candidatos !== null && (
        <section className="painel tabela-painel">
          {filtrados.length === 0 ? (
            <p className="texto-suave">Nenhum candidato encontrado.</p>
          ) : (
            <div className="tabela-rolagem">
              <table className="tabela-admin">
                <thead>
                  <tr>
                    <th>Candidato</th>
                    <th>Cidade</th>
                    <th>Desde</th>
                    <th>Candidaturas</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((candidato) => (
                    <tr key={candidato.id}>
                      <td>
                        <div className="tabela-pessoa">
                          <span>{iniciais(candidato.usuario.nome)}</span>
                          <b>{candidato.usuario.nome}</b>
                        </div>
                      </td>
                      <td>{local(candidato)}</td>
                      <td>{mesAno(candidato.criado_em)}</td>
                      <td>
                        {candidato.total_candidaturas === undefined ? '—' : `${candidato.total_candidaturas} enviada(s)`}
                      </td>
                      <td>
                        <Selo variante={candidato.usuario.ativo ? 'sucesso' : 'alerta'}>
                          {candidato.usuario.ativo ? 'Ativo' : 'Inativo'}
                        </Selo>
                      </td>
                      <td>
                        <Botao variante="contorno" onClick={() => abrir(candidato)}>
                          Ver perfil
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

      <Janela aberta={Boolean(aberto)} aoFechar={() => setAberto(null)} titulo={aberto?.usuario.nome || ''}>
        {perfil && (
          <>
            <header className="janela__cabecalho">
              {perfil.usuario.foto_url ? (
                <span className="janela__foto" style={{ backgroundImage: `url(${perfil.usuario.foto_url})` }} />
              ) : (
                <span className="janela__foto">{iniciais(perfil.usuario.nome)}</span>
              )}
              <div>
                <h2>{perfil.usuario.nome}</h2>
                <p>{local(perfil)}</p>
              </div>
              <Selo variante={perfil.visivel_para_empresas ? 'sucesso' : 'navy'}>
                {perfil.visivel_para_empresas ? 'Visível para empresas' : 'Oculto para empresas'}
              </Selo>
            </header>

            {erroDetalhe && <Aviso variante="erro">{erroDetalhe}</Aviso>}
            {!detalhe && !erroDetalhe && <p className="texto-suave">Carregando perfil...</p>}

            <dl className="dados-grade">
              <div>
                <dt>E-mail</dt>
                <dd>{perfil.usuario.email}</dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>{perfil.telefone || 'Não informado'}</dd>
              </div>
              <div>
                <dt>Nascimento</dt>
                <dd>{perfil.data_nascimento ? dataCompleta(perfil.data_nascimento) : 'Não informado'}</dd>
              </div>
              <div>
                <dt>Grau de TEA</dt>
                <dd>{perfil.grau_tea ? ROTULOS_GRAU_TEA[perfil.grau_tea] : 'Não informado'}</dd>
              </div>
              <div>
                <dt>Cadastrado em</dt>
                <dd>{dataCompleta(perfil.criado_em)}</dd>
              </div>
              <div>
                <dt>Candidaturas</dt>
                <dd>{perfil.total_candidaturas ?? '—'}</dd>
              </div>
            </dl>

            {detalhe && (
              <>
                <h3 className="janela__secao">Sobre</h3>
                <p className="janela__texto">{detalhe.sobre_mim || 'Não escreveu nada ainda.'}</p>

                {detalhe.necessidades_especiais && (
                  <>
                    <h3 className="janela__secao">Necessidades e adaptações</h3>
                    <p className="janela__texto">{detalhe.necessidades_especiais}</p>
                  </>
                )}

                <h3 className="janela__secao">Formação</h3>
                <p className="janela__texto">
                  {[
                    detalhe.escolaridade && ROTULOS_ESCOLARIDADE[detalhe.escolaridade],
                    detalhe.curso,
                    detalhe.instituicao_ensino,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Não informada.'}
                </p>

                <h3 className="janela__secao">Experiências</h3>
                {detalhe.experiencias.length === 0 ? (
                  <p className="janela__texto">Nenhuma experiência cadastrada.</p>
                ) : (
                  <ul className="janela__lista">
                    {detalhe.experiencias.map((experiencia) => (
                      <li key={experiencia.id}>
                        <b>
                          {experiencia.cargo} · {experiencia.empresa}
                        </b>
                        <span>{periodo(experiencia)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <h3 className="janela__secao">Habilidades</h3>
                {detalhe.habilidades.length === 0 ? (
                  <p className="janela__texto">Nenhuma habilidade cadastrada.</p>
                ) : (
                  <div className="lista-habilidades">
                    {detalhe.habilidades.map((habilidade) => (
                      <span key={habilidade.id}>
                        {habilidade.nome} <b>{ROTULOS_NIVEL[habilidade.nivel] || habilidade.nivel}</b>
                      </span>
                    ))}
                  </div>
                )}

                <h3 className="janela__secao">Tem interesse em</h3>
                <p className="janela__texto">
                  {detalhe.tipos_vinculo
                    ? detalhe.tipos_vinculo
                        .split(',')
                        .filter(Boolean)
                        .map((tipo) => ROTULOS_VINCULO[tipo] || tipo)
                        .join(', ')
                    : 'Não informado.'}
                </p>
              </>
            )}
          </>
        )}
      </Janela>
    </div>
  )
}
