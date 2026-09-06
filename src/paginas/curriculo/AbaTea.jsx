import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Aviso from '../../componentes/Aviso'

export default function AbaTea({ perfil, aoSalvar, aoMudancaPendente }) {
  const [grauTea, setGrauTea] = useState(perfil.grau_tea || '')
  const [necessidades, setNecessidades] = useState(perfil.necessidades_especiais || '')
  const [salvo, setSalvo] = useState({
    grau_tea: perfil.grau_tea || '',
    necessidades_especiais: perfil.necessidades_especiais || '',
  })
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const sujo = grauTea !== salvo.grau_tea || necessidades !== salvo.necessidades_especiais

  useEffect(() => {
    aoMudancaPendente?.(sujo)
  }, [sujo, aoMudancaPendente])

  async function salvar() {
    setSalvando(true)
    try {
      await cliente.put('/candidatos/me', {
        grau_tea: grauTea || null,
        necessidades_especiais: necessidades,
      })
      setSalvo({ grau_tea: grauTea, necessidades_especiais: necessidades })
      setSucesso(true)
      aoSalvar()
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível salvar seus dados')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div>
      {sucesso && <Aviso variante="sucesso">Informações salvas!</Aviso>}
      {erro && <Aviso variante="erro">{erro}</Aviso>}
      <label className="campo">
        Grau de TEA
        <select
          value={grauTea}
          onChange={(e) => {
            setGrauTea(e.target.value)
            setSucesso(false)
            setErro('')
          }}
        >
          <option value="">Não tenho TEA</option>
          <option value="leve">Leve</option>
          <option value="moderado">Moderado</option>
          <option value="severo">Severo</option>
        </select>
      </label>
      <label className="campo">
        O que preciso para trabalhar bem
        <textarea
          value={necessidades}
          onChange={(e) => {
            setNecessidades(e.target.value)
            setSucesso(false)
            setErro('')
          }}
          placeholder="Ex: Cadeirante e precisa de rampa, sensível a barulho, baixa visão e precisa de tela adaptada..."
        />
      </label>
      <Botao variante={sujo ? 'primario' : 'contorno'} icone={Save} onClick={salvar} disabled={salvando || !sujo}>
        {salvando ? 'Salvando...' : sujo ? 'Salvar rascunho' : 'Tudo salvo'}
      </Botao>
      {sujo && !salvando && <span className="campo-dica">Você tem alterações não salvas nesta aba.</span>}
    </div>
  )
}
