import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'

const VAZIO = { instituicao: '', curso: '', nivel: '', ano_inicio: '', ano_conclusao: '', em_andamento: false }

export default function AbaFormacao({ perfil, aoAlterar }) {
  const [novo, setNovo] = useState(VAZIO)
  const [enviando, setEnviando] = useState(false)

  function atualizar(campo, valor) {
    setNovo((atual) => ({ ...atual, [campo]: valor }))
  }

  async function adicionar() {
    setEnviando(true)
    try {
      await cliente.post('/candidatos/me/formacoes', {
        ...novo,
        ano_inicio: novo.ano_inicio ? Number(novo.ano_inicio) : null,
        ano_conclusao: novo.ano_conclusao ? Number(novo.ano_conclusao) : null,
      })
      setNovo(VAZIO)
      aoAlterar()
    } finally {
      setEnviando(false)
    }
  }

  async function remover(id) {
    await cliente.delete(`/candidatos/me/formacoes/${id}`)
    aoAlterar()
  }

  return (
    <div>
      {perfil.formacoes.map((formacao) => (
        <div key={formacao.id} className="linha-candidato">
          <div>
            <p className="linha-candidato__nome">
              {formacao.curso} — {formacao.instituicao}
            </p>
            <p className="linha-candidato__info">
              {formacao.nivel} · {formacao.ano_inicio || '?'} -{' '}
              {formacao.em_andamento ? 'em andamento' : formacao.ano_conclusao || '?'}
            </p>
          </div>
          <Botao variante="contorno" icone={Trash2} onClick={() => remover(formacao.id)}>
            Remover
          </Botao>
        </div>
      ))}
      {perfil.formacoes.length === 0 && <p className="texto-suave">Nenhuma formação adicionada ainda.</p>}

      <h2 style={{ marginTop: 20, marginBottom: 12 }}>Adicionar formação</h2>
      <div className="grade-campos">
        <label className="campo">
          Instituição
          <input value={novo.instituicao} onChange={(e) => atualizar('instituicao', e.target.value)} />
        </label>
        <label className="campo">
          Curso
          <input value={novo.curso} onChange={(e) => atualizar('curso', e.target.value)} />
        </label>
        <label className="campo">
          Nível
          <input
            value={novo.nivel}
            onChange={(e) => atualizar('nivel', e.target.value)}
            placeholder="Técnico, Superior..."
          />
        </label>
        <label className="campo">
          Ano início
          <input type="number" value={novo.ano_inicio} onChange={(e) => atualizar('ano_inicio', e.target.value)} />
        </label>
        <label className="campo">
          Ano conclusão
          <input
            type="number"
            value={novo.ano_conclusao}
            onChange={(e) => atualizar('ano_conclusao', e.target.value)}
            disabled={novo.em_andamento}
          />
        </label>
      </div>
      <label className="campo" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={novo.em_andamento}
          onChange={(e) => atualizar('em_andamento', e.target.checked)}
          style={{ width: 'auto' }}
        />
        Em andamento
      </label>
      <Botao icone={Plus} onClick={adicionar} disabled={enviando || !novo.instituicao || !novo.curso || !novo.nivel}>
        Adicionar
      </Botao>
    </div>
  )
}
