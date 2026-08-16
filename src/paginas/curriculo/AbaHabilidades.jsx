import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Aviso from '../../componentes/Aviso'

export default function AbaHabilidades({ perfil, aoAlterar }) {
  const [nome, setNome] = useState('')
  const [nivel, setNivel] = useState('basico')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function adicionar() {
    setEnviando(true)
    setErro('')
    try {
      await cliente.post('/candidatos/me/habilidades', { nome, nivel })
      setNome('')
      setNivel('basico')
      aoAlterar()
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível adicionar esta habilidade')
    } finally {
      setEnviando(false)
    }
  }

  async function remover(id) {
    setErro('')
    try {
      await cliente.delete(`/candidatos/me/habilidades/${id}`)
      aoAlterar()
    } catch {
      setErro('Não foi possível remover esta habilidade')
    }
  }

  return (
    <div>
      {erro && <Aviso variante="erro">{erro}</Aviso>}
      <div className="chips">
        {perfil.habilidades.map((habilidade) => (
          <span
            key={habilidade.id}
            className="chip chip--selecionado"
            onClick={() => remover(habilidade.id)}
            title="Clique para remover"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            {habilidade.nome} ({habilidade.nivel}) <X size={12} />
          </span>
        ))}
        {perfil.habilidades.length === 0 && <p className="texto-suave">Nenhuma habilidade adicionada ainda.</p>}
      </div>

      <h2 style={{ marginTop: 20, marginBottom: 12 }}>Adicionar habilidade</h2>
      <div className="grade-campos">
        <label className="campo">
          Habilidade
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Excel, Organização" />
        </label>
        <label className="campo">
          Nível
          <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
            <option value="basico">Básico</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
        </label>
      </div>
      <Botao icone={Plus} onClick={adicionar} disabled={enviando || !nome}>
        Adicionar
      </Botao>
    </div>
  )
}
