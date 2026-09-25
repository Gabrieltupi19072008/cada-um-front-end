import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Heart, Search } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Aviso from '../../componentes/Aviso'
import { AvatarConversa } from '../../componentes/CaixaConversas'

const ROTULOS_GRAU_TEA = { leve: 'TEA Leve', moderado: 'TEA Moderado', severo: 'TEA Severo' }
const ROTULOS_VINCULO = { efetivo: 'Efetivo (CLT)', estagio: 'Estágio', menor_aprendiz: 'Menor aprendiz' }
const ROTULOS_NIVEL = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' }
const FILTROS_VINCULO = [{ chave: '', rotulo: 'Todos' }, ...Object.entries(ROTULOS_VINCULO).map(([chave, rotulo]) => ({ chave, rotulo }))]

function semAcento(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function tiposVinculo(candidato) {
  return candidato.tipos_vinculo ? candidato.tipos_vinculo.split(',').filter(Boolean) : []
}

function ocupacao(candidato) {
  const experiencias = [...candidato.experiencias].sort((a, b) =>
    a.emprego_atual === b.emprego_atual ? b.data_inicio.localeCompare(a.data_inicio) : a.emprego_atual ? -1 : 1
  )
  if (experiencias.length > 0) return experiencias[0].cargo
  if (candidato.curso) return candidato.curso
  return 'Sem experiência cadastrada'
}

function local(candidato) {
  return [candidato.cidade, candidato.estado].filter(Boolean).join(' · ') || 'Local não informado'
}

export default function AbaBuscarCandidatos() {
  const [candidatos, setCandidatos] = useState(null)
  const [termo, setTermo] = useState('')
  const [vinculo, setVinculo] = useState('')
  const [grauTea, setGrauTea] = useState('')
  const [selecionadoId, setSelecionadoId] = useState(null)
  const [erro, setErro] = useState('')
  const [interesses, setInteresses] = useState({})
  const navegar = useNavigate()

  useEffect(() => {
    setCandidatos(null)
    setErro('')
    cliente
      .get('/empresas/candidatos', { params: grauTea ? { grau_tea: grauTea } : {} })
      .then((resposta) => setCandidatos(resposta.data))
      .catch((erroRequisicao) =>
        setErro(erroRequisicao.response?.data?.detail || 'Não foi possível buscar candidatos')
      )
  }, [grauTea])

  const busca = semAcento(termo.trim())
  const filtrados = (candidatos || []).filter((candidato) => {
    if (vinculo && !tiposVinculo(candidato).includes(vinculo)) return false
    if (!busca) return true
    const textos = [
      candidato.usuario.nome,
      candidato.cidade,
      candidato.estado,
      candidato.curso,
      ...candidato.habilidades.map((h) => h.nome),
      ...candidato.experiencias.map((e) => e.cargo),
    ]
    return textos.some((texto) => semAcento(texto).includes(busca))
  })

  const selecionado = filtrados.find((c) => c.id === selecionadoId) || filtrados[0]

  async function demonstrarInteresse(candidato) {
    setInteresses((atual) => ({ ...atual, [candidato.id]: { enviando: true } }))
    try {
      await cliente.post('/empresas/me/interesses', { candidato_id: candidato.id })
      setInteresses((atual) => ({ ...atual, [candidato.id]: { enviado: true } }))
    } catch (erroRequisicao) {
      setInteresses((atual) => ({
        ...atual,
        [candidato.id]: { erro: erroRequisicao.response?.data?.detail || 'Não foi possível enviar o interesse' },
      }))
    }
  }

  const estadoInteresse = selecionado ? interesses[selecionado.id] || {} : {}

  return (
    <div>
      <form className="barra-busca" role="search" onSubmit={(e) => e.preventDefault()}>
        <Search size={20} />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Busque por nome, habilidade, cargo ou cidade"
          aria-label="Buscar candidatos"
        />
        <button type="submit">Buscar</button>
      </form>

      <div className="filtros-chips">
        {FILTROS_VINCULO.map((filtro) => (
          <button
            type="button"
            key={filtro.chave || 'todos'}
            className={vinculo === filtro.chave ? 'ativo' : ''}
            aria-pressed={vinculo === filtro.chave}
            onClick={() => setVinculo(filtro.chave)}
          >
            {filtro.rotulo}
          </button>
        ))}
        <select value={grauTea} onChange={(e) => setGrauTea(e.target.value)} aria-label="Grau de TEA">
          <option value="">Qualquer grau de TEA</option>
          <option value="leve">TEA Leve</option>
          <option value="moderado">TEA Moderado</option>
          <option value="severo">TEA Severo</option>
        </select>
      </div>

      {erro && <Aviso variante="erro">{erro}</Aviso>}
      {!erro && candidatos === null && <p className="texto-suave">Carregando candidatos...</p>}
      {candidatos !== null && (
        <p className="contagem-resultados">
          {filtrados.length === 1 ? '1 talento encontrado' : `${filtrados.length} talentos encontrados`}
        </p>
      )}
      {candidatos !== null && filtrados.length === 0 && (
        <p className="texto-suave">Nenhum candidato encontrado com esses filtros.</p>
      )}

      {filtrados.length > 0 && (
        <div className="layout-talentos">
          <div className="lista-talentos">
            {filtrados.map((candidato) => (
              <button
                type="button"
                key={candidato.id}
                className={`cartao-talento ${selecionado?.id === candidato.id ? 'selecionado' : ''}`}
                onClick={() => setSelecionadoId(candidato.id)}
              >
                <AvatarConversa nome={candidato.usuario.nome} fotoUrl={candidato.usuario.foto_url} />
                <div>
                  <b>{candidato.usuario.nome}</b>
                  <p>{ocupacao(candidato)}</p>
                  <small>{local(candidato)}</small>
                  {candidato.habilidades.length > 0 && (
                    <span className="cartao-talento__chips">
                      {candidato.habilidades.slice(0, 3).map((habilidade) => (
                        <i key={habilidade.id}>{habilidade.nome}</i>
                      ))}
                    </span>
                  )}
                </div>
                {candidato.grau_tea && <span className="cartao-talento__grau">{ROTULOS_GRAU_TEA[candidato.grau_tea]}</span>}
              </button>
            ))}
          </div>

          {selecionado && (
            <aside className="detalhe-talento">
              <div className="detalhe-talento__topo">
                <AvatarConversa nome={selecionado.usuario.nome} fotoUrl={selecionado.usuario.foto_url} />
                <div>
                  <h2>{selecionado.usuario.nome}</h2>
                  <p>{ocupacao(selecionado)}</p>
                  <small>{local(selecionado)}</small>
                </div>
              </div>

              {selecionado.sobre_mim && (
                <>
                  <h3>Sobre</h3>
                  <p className="detalhe-talento__texto">{selecionado.sobre_mim}</p>
                </>
              )}

              <h3>Habilidades</h3>
              {selecionado.habilidades.length > 0 ? (
                <div className="lista-habilidades">
                  {selecionado.habilidades.map((habilidade) => (
                    <span key={habilidade.id}>
                      {habilidade.nome} <b>{ROTULOS_NIVEL[habilidade.nivel] || habilidade.nivel}</b>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="detalhe-talento__texto">Nenhuma habilidade cadastrada.</p>
              )}

              <h3>Tem interesse em</h3>
              <p className="detalhe-talento__texto">
                {tiposVinculo(selecionado).length > 0
                  ? tiposVinculo(selecionado)
                      .map((tipo) => ROTULOS_VINCULO[tipo] || tipo)
                      .join(', ')
                  : 'Não informado.'}
              </p>

              {estadoInteresse.erro && <Aviso variante="erro">{estadoInteresse.erro}</Aviso>}
              {estadoInteresse.enviado && (
                <Aviso variante="sucesso">Interesse enviado! Acompanhe em "Interesses enviados".</Aviso>
              )}

              <div className="detalhe-talento__acoes">
                <Botao
                  variante="primario"
                  icone={Heart}
                  onClick={() => demonstrarInteresse(selecionado)}
                  disabled={estadoInteresse.enviando || estadoInteresse.enviado}
                >
                  {estadoInteresse.enviando ? 'Enviando...' : estadoInteresse.enviado ? 'Interesse enviado' : 'Demonstrar interesse'}
                </Botao>
                <Botao
                  variante="contorno"
                  icone={FileText}
                  onClick={() => navegar(`/empresa/candidatos/${selecionado.id}`)}
                >
                  Ver currículo completo
                </Botao>
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  )
}
