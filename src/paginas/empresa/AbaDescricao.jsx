import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Aviso from '../../componentes/Aviso'

export default function AbaDescricao() {
  const [descricao, setDescricao] = useState('')
  const [salvo, setSalvo] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    cliente
      .get('/empresas/me')
      .then((resposta) => {
        setDescricao(resposta.data.descricao || '')
        setSalvo(resposta.data.descricao || '')
      })
      .catch(() => setErro('Não foi possível carregar sua empresa'))
      .finally(() => setCarregando(false))
  }, [])

  async function salvar() {
    setSalvando(true)
    setErro('')
    try {
      await cliente.put('/empresas/me', { descricao })
      setSalvo(descricao)
      setSucesso(true)
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível salvar')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <p className="texto-suave">Carregando...</p>

  const sujo = descricao !== salvo

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Sobre a empresa</h2>
      <p className="texto-suave" style={{ marginBottom: 12 }}>
        Esse texto aparece pro candidato quando ele clica no nome da sua empresa.
      </p>
      {erro && <Aviso variante="erro">{erro}</Aviso>}
      {sucesso && !sujo && <Aviso variante="sucesso">Salvo!</Aviso>}
      <label className="campo">
        Descrição da empresa
        <textarea
          value={descricao}
          onChange={(e) => {
            setDescricao(e.target.value)
            setSucesso(false)
          }}
          placeholder="Conte um pouco sobre a empresa: o que ela faz, sua cultura, o que valoriza em quem contrata..."
          rows={6}
        />
      </label>
      <Botao variante={sujo ? 'primario' : 'contorno'} icone={Save} onClick={salvar} disabled={salvando || !sujo}>
        {salvando ? 'Salvando...' : sujo ? 'Salvar' : 'Tudo salvo'}
      </Botao>
    </div>
  )
}
