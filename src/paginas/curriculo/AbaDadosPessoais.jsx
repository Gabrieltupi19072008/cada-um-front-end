import { useState } from 'react'
import { Save } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Aviso from '../../componentes/Aviso'
import { ESTADOS_BRASIL } from '../../dados/estadosBrasil'

export default function AbaDadosPessoais({ perfil, aoSalvar }) {
  const [dados, setDados] = useState({
    data_nascimento: perfil.data_nascimento || '',
    cidade: perfil.cidade || '',
    estado: perfil.estado || '',
    telefone: perfil.telefone || '',
    linkedin: perfil.linkedin || '',
    sobre_mim: perfil.sobre_mim || '',
  })
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  function atualizar(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
    setSucesso(false)
  }

  async function salvar() {
    setSalvando(true)
    try {
      await cliente.put('/candidatos/me', dados)
      setSucesso(true)
      aoSalvar()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div>
      {sucesso && <Aviso variante="sucesso">Dados salvos!</Aviso>}
      <div className="grade-campos">
        <label className="campo">
          Nome Completo
          <input value={perfil.usuario.nome} disabled title="Alteração de nome não disponível por aqui" />
        </label>
        <label className="campo">
          Data de Nascimento
          <input
            type="date"
            value={dados.data_nascimento || ''}
            onChange={(e) => atualizar('data_nascimento', e.target.value)}
          />
        </label>
        <label className="campo">
          CPF
          <input value={perfil.cpf || 'Não informado'} disabled />
        </label>
      </div>
      <div className="grade-campos">
        <label className="campo">
          Cidade
          <input value={dados.cidade} onChange={(e) => atualizar('cidade', e.target.value)} />
        </label>
        <label className="campo">
          Estado
          <select value={dados.estado || ''} onChange={(e) => atualizar('estado', e.target.value)}>
            <option value="">Selecione</option>
            {ESTADOS_BRASIL.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          Telefone
          <input value={dados.telefone} onChange={(e) => atualizar('telefone', e.target.value)} />
        </label>
        <label className="campo">
          LinkedIn / Portfólio
          <input value={dados.linkedin} onChange={(e) => atualizar('linkedin', e.target.value)} />
        </label>
      </div>
      <label className="campo">
        Sobre mim / Objetivo profissional
        <textarea value={dados.sobre_mim} onChange={(e) => atualizar('sobre_mim', e.target.value)} />
      </label>
      <Botao variante="contorno" icone={Save} onClick={salvar} disabled={salvando}>
        {salvando ? 'Salvando...' : 'Salvar rascunho'}
      </Botao>
    </div>
  )
}
