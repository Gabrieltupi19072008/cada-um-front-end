import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'

const ROTULOS_GRAU_TEA = { leve: 'TEA Leve', moderado: 'TEA Moderado', severo: 'TEA Severo' }

export default function AbaBuscarCandidatos() {
  const [filtros, setFiltros] = useState({ cidade: '', grau_tea: '', area: '', habilidade: '' })
  const [resultados, setResultados] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [erro, setErro] = useState('')
  const navegar = useNavigate()

  function atualizar(campo, valor) {
    setFiltros((atual) => ({ ...atual, [campo]: valor }))
  }

  async function buscar() {
    setBuscando(true)
    setErro('')
    try {
      const params = Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor))
      const resposta = await cliente.get('/empresas/candidatos', { params })
      setResultados(resposta.data)
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível buscar candidatos')
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 12 }}>Buscar candidatos com TEA</h2>
      <div className="filtros-busca">
        <label className="campo">
          Cidade
          <input value={filtros.cidade} onChange={(e) => atualizar('cidade', e.target.value)} />
        </label>
        <label className="campo">
          Grau TEA
          <select value={filtros.grau_tea} onChange={(e) => atualizar('grau_tea', e.target.value)}>
            <option value="">Todos</option>
            <option value="leve">Leve</option>
            <option value="moderado">Moderado</option>
            <option value="severo">Severo</option>
          </select>
        </label>
        <label className="campo">
          Área de atuação
          <input
            value={filtros.area}
            onChange={(e) => atualizar('area', e.target.value)}
            placeholder="Ex: Administração"
          />
        </label>
        <label className="campo">
          Habilidades
          <input
            value={filtros.habilidade}
            onChange={(e) => atualizar('habilidade', e.target.value)}
            placeholder="Ex: Excel, Organização"
          />
        </label>
        <Botao icone={Search} onClick={buscar} disabled={buscando}>
          {buscando ? 'Buscando...' : 'Buscar'}
        </Botao>
      </div>

      {erro && <p className="aviso aviso--erro">{erro}</p>}

      {resultados !== null && (
        <>
          <p className="contagem-resultados">{resultados.length} candidatos encontrados</p>
          <div className="lista-candidatos">
            {resultados.map((candidato) => (
              <div key={candidato.id} className="linha-candidato">
                <div>
                  <p className="linha-candidato__nome">{candidato.usuario.nome}</p>
                  <p className="linha-candidato__info">
                    {candidato.grau_tea ? ROTULOS_GRAU_TEA[candidato.grau_tea] : 'Grau TEA não informado'} ·{' '}
                    {candidato.cidade || 'Local não informado'}
                    {candidato.habilidades.length > 0 && ` · ${candidato.habilidades.map((h) => h.nome).join(', ')}`}
                  </p>
                </div>
                <Botao onClick={() => navegar(`/empresa/candidatos/${candidato.id}`)}>Ver currículo</Botao>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
