import { useState } from 'react'
import { Save } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Aviso from '../../componentes/Aviso'

export default function AbaTea({ perfil, aoSalvar }) {
  const [grauTea, setGrauTea] = useState(perfil.grau_tea || 'leve')
  const [necessidades, setNecessidades] = useState(perfil.necessidades_especiais || '')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  async function salvar() {
    setSalvando(true)
    try {
      await cliente.put('/candidatos/me', {
        grau_tea: grauTea,
        necessidades_especiais: necessidades,
      })
      setSucesso(true)
      aoSalvar()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div>
      {sucesso && <Aviso variante="sucesso">Informações salvas!</Aviso>}
      <label className="campo">
        Grau de TEA
        <select
          value={grauTea}
          onChange={(e) => {
            setGrauTea(e.target.value)
            setSucesso(false)
          }}
        >
          <option value="leve">Leve</option>
          <option value="moderado">Moderado</option>
          <option value="severo">Severo</option>
        </select>
      </label>
      <label className="campo">
        Necessidades especiais / adaptações que você precisa
        <textarea
          value={necessidades}
          onChange={(e) => {
            setNecessidades(e.target.value)
            setSucesso(false)
          }}
          placeholder="Ex: Prefere ambiente calmo, precisa de instruções escritas..."
        />
      </label>
      <Botao icone={Save} onClick={salvar} disabled={salvando}>
        {salvando ? 'Salvando...' : 'Salvar rascunho'}
      </Botao>
    </div>
  )
}
