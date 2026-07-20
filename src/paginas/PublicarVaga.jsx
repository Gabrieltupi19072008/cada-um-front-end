import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Save, Flag } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Botao from '../componentes/Botao'
import Aviso from '../componentes/Aviso'
import cliente from '../api/cliente'

const OPCOES_ADAPTACOES = [
  'Instruções escritas',
  'Ambiente silencioso',
  'Horário flexível',
  'Mentor de integração',
  'Home office parcial',
]

const VAZIO = {
  titulo: '',
  area: '',
  cidade: '',
  modalidade: 'presencial',
  salario: '',
  tipo_contrato: 'clt',
  descricao: '',
}

export default function PublicarVaga() {
  const [dados, setDados] = useState(VAZIO)
  const [adaptacoesSelecionadas, setAdaptacoesSelecionadas] = useState([])
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navegar = useNavigate()

  function atualizar(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
  }

  function alternarAdaptacao(opcao) {
    setAdaptacoesSelecionadas((atual) =>
      atual.includes(opcao) ? atual.filter((item) => item !== opcao) : [...atual, opcao],
    )
  }

  async function enviar(ativa) {
    setErro('')
    setEnviando(true)
    try {
      await cliente.post('/empresas/me/vagas', {
        ...dados,
        salario: dados.salario ? Number(dados.salario) : null,
        adaptacoes: adaptacoesSelecionadas.join(', ') || null,
        ativa,
      })
      navegar('/empresa')
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível salvar a vaga')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Layout tema="empresa" largura="padrao">
      <Cartao titulo="Nova Vaga de Emprego" icone={Flag}>
        {erro && <Aviso variante="erro">{erro}</Aviso>}

        <div className="grade-campos">
          <label className="campo">
            Título da Vaga
            <input
              value={dados.titulo}
              onChange={(e) => atualizar('titulo', e.target.value)}
              placeholder="Ex: Auxiliar Administrativo"
            />
          </label>
          <label className="campo">
            Área / Setor
            <input value={dados.area} onChange={(e) => atualizar('area', e.target.value)} placeholder="Administração" />
          </label>
        </div>

        <div className="grade-campos">
          <label className="campo">
            Cidade
            <input value={dados.cidade} onChange={(e) => atualizar('cidade', e.target.value)} />
          </label>
          <label className="campo">
            Modalidade
            <select value={dados.modalidade} onChange={(e) => atualizar('modalidade', e.target.value)}>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
              <option value="remoto">Remoto</option>
            </select>
          </label>
          <label className="campo">
            Salário
            <input
              type="number"
              value={dados.salario}
              onChange={(e) => atualizar('salario', e.target.value)}
              placeholder="1500.00"
            />
          </label>
          <label className="campo">
            Tipo de Contrato
            <select value={dados.tipo_contrato} onChange={(e) => atualizar('tipo_contrato', e.target.value)}>
              <option value="clt">CLT</option>
              <option value="pj">PJ</option>
              <option value="estagio">Estágio</option>
              <option value="temporario">Temporário</option>
            </select>
          </label>
        </div>

        <label className="campo">
          Descrição da vaga / Requisitos
          <textarea
            value={dados.descricao}
            onChange={(e) => atualizar('descricao', e.target.value)}
            placeholder="Descreva as atividades, requisitos e benefícios. Informe adaptações disponíveis para pessoas com TEA..."
          />
        </label>

        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Adaptações oferecidas pela empresa</p>
        <div className="chips">
          {OPCOES_ADAPTACOES.map((opcao) => (
            <button
              key={opcao}
              type="button"
              className={`chip ${adaptacoesSelecionadas.includes(opcao) ? 'chip--selecionado' : ''}`}
              onClick={() => alternarAdaptacao(opcao)}
            >
              {adaptacoesSelecionadas.includes(opcao) ? '✓ ' : ''}
              {opcao}
            </button>
          ))}
        </div>

        <div className="acoes-form">
          <Botao variante="contorno" icone={Save} onClick={() => enviar(false)} disabled={enviando || !dados.titulo}>
            Salvar rascunho
          </Botao>
          <Botao icone={Send} onClick={() => enviar(true)} disabled={enviando || !dados.titulo}>
            {enviando ? 'Publicando...' : 'Publicar vaga'}
          </Botao>
        </div>
      </Cartao>
    </Layout>
  )
}
