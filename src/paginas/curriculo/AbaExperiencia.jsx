import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'

const VAZIO = { empresa: '', cargo: '', descricao: '', data_inicio: '', data_fim: '', emprego_atual: false }

export default function AbaExperiencia({ perfil, aoAlterar }) {
  const [novo, setNovo] = useState(VAZIO)
  const [enviando, setEnviando] = useState(false)

  function atualizar(campo, valor) {
    setNovo((atual) => ({ ...atual, [campo]: valor }))
  }

  async function adicionar() {
    setEnviando(true)
    try {
      await cliente.post('/candidatos/me/experiencias', {
        ...novo,
        data_fim: novo.emprego_atual ? null : novo.data_fim || null,
      })
      setNovo(VAZIO)
      aoAlterar()
    } finally {
      setEnviando(false)
    }
  }

  async function remover(id) {
    await cliente.delete(`/candidatos/me/experiencias/${id}`)
    aoAlterar()
  }

  return (
    <div>
      {perfil.experiencias.map((experiencia) => (
        <div key={experiencia.id} className="linha-candidato">
          <div>
            <p className="linha-candidato__nome">
              {experiencia.cargo} — {experiencia.empresa}
            </p>
            <p className="linha-candidato__info">
              {experiencia.data_inicio} - {experiencia.emprego_atual ? 'atual' : experiencia.data_fim || '?'}
            </p>
          </div>
          <Botao variante="contorno" icone={Trash2} onClick={() => remover(experiencia.id)}>
            Remover
          </Botao>
        </div>
      ))}
      {perfil.experiencias.length === 0 && <p className="texto-suave">Nenhuma experiência adicionada ainda.</p>}

      <h2 style={{ marginTop: 20, marginBottom: 12 }}>Adicionar experiência</h2>
      <div className="grade-campos">
        <label className="campo">
          Empresa
          <input value={novo.empresa} onChange={(e) => atualizar('empresa', e.target.value)} />
        </label>
        <label className="campo">
          Cargo
          <input value={novo.cargo} onChange={(e) => atualizar('cargo', e.target.value)} />
        </label>
        <label className="campo">
          Início
          <input type="date" value={novo.data_inicio} onChange={(e) => atualizar('data_inicio', e.target.value)} />
        </label>
        <label className="campo">
          Fim
          <input
            type="date"
            value={novo.data_fim}
            onChange={(e) => atualizar('data_fim', e.target.value)}
            disabled={novo.emprego_atual}
          />
        </label>
      </div>
      <label className="campo">
        Descrição
        <textarea value={novo.descricao} onChange={(e) => atualizar('descricao', e.target.value)} />
      </label>
      <label className="campo" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={novo.emprego_atual}
          onChange={(e) => atualizar('emprego_atual', e.target.checked)}
          style={{ width: 'auto' }}
        />
        Emprego atual
      </label>
      <Botao icone={Plus} onClick={adicionar} disabled={enviando || !novo.empresa || !novo.cargo || !novo.data_inicio}>
        Adicionar
      </Botao>
    </div>
  )
}
