import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Aviso from '../../componentes/Aviso'
import UploadCurriculo from '../../componentes/UploadCurriculo'
import { ESTADOS_BRASIL } from '../../dados/estadosBrasil'

function estadoInicial(perfil) {
  return {
    data_nascimento: perfil.data_nascimento || '',
    cidade: perfil.cidade || '',
    estado: perfil.estado || '',
    telefone: perfil.telefone || '',
    linkedin: perfil.linkedin || '',
    sobre_mim: perfil.sobre_mim || '',
    escolaridade: perfil.escolaridade || '',
    instituicao_ensino: perfil.instituicao_ensino || '',
    curso: perfil.curso || '',
    curso_ano_inicio: perfil.curso_ano_inicio || '',
    curso_ano_conclusao: perfil.curso_ano_conclusao || '',
    curso_em_andamento: perfil.curso_em_andamento || false,
    cursos_profissionalizantes: perfil.cursos_profissionalizantes || '',
    bairros_aceitos: perfil.bairros_aceitos || '',
    tipos_vinculo: perfil.tipos_vinculo ? perfil.tipos_vinculo.split(',') : [],
  }
}

export default function AbaDadosPessoais({ perfil, aoSalvar, aoMudancaPendente }) {
  const [dados, setDados] = useState(() => estadoInicial(perfil))
  const [salvo, setSalvo] = useState(() => estadoInicial(perfil))
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const sujo = JSON.stringify(dados) !== JSON.stringify(salvo)

  useEffect(() => {
    aoMudancaPendente?.(sujo)
  }, [sujo, aoMudancaPendente])

  function atualizar(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
    setSucesso(false)
    setErro('')
  }

  function alternarTipoVinculo(tipo) {
    setDados((atual) => {
      const jaTem = atual.tipos_vinculo.includes(tipo)
      const novos = jaTem ? atual.tipos_vinculo.filter((t) => t !== tipo) : [...atual.tipos_vinculo, tipo]
      return { ...atual, tipos_vinculo: novos }
    })
    setSucesso(false)
    setErro('')
  }

  async function salvar() {
    setSalvando(true)
    try {
      const corpo = { ...dados, tipos_vinculo: dados.tipos_vinculo.join(',') }
      corpo.escolaridade = corpo.escolaridade || null
      corpo.data_nascimento = corpo.data_nascimento || null
      corpo.curso_ano_inicio = corpo.curso_ano_inicio ? Number(corpo.curso_ano_inicio) : null
      corpo.curso_ano_conclusao = corpo.curso_em_andamento ? null : corpo.curso_ano_conclusao ? Number(corpo.curso_ano_conclusao) : null
      await cliente.put('/candidatos/me', corpo)
      setSalvo(dados)
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
      {sucesso && <Aviso variante="sucesso">Dados salvos!</Aviso>}
      {erro && <Aviso variante="erro">{erro}</Aviso>}
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
      <div className="campo">
        Interesse em
        <div className="checks">
          <label className="check-pill">
            <input
              type="checkbox"
              checked={dados.tipos_vinculo.includes('efetivo')}
              onChange={() => alternarTipoVinculo('efetivo')}
            />
            Efetivo (CLT)
          </label>
          <label className="check-pill">
            <input
              type="checkbox"
              checked={dados.tipos_vinculo.includes('estagio')}
              onChange={() => alternarTipoVinculo('estagio')}
            />
            Estágio
          </label>
          <label className="check-pill">
            <input
              type="checkbox"
              checked={dados.tipos_vinculo.includes('menor_aprendiz')}
              onChange={() => alternarTipoVinculo('menor_aprendiz')}
            />
            Menor aprendiz
          </label>
        </div>
      </div>
      <label className="campo">
        Escolaridade ou grau de instrução
        <select
          value={dados.escolaridade}
          onChange={(e) => atualizar('escolaridade', e.target.value)}
        >
          <option value="">Selecione</option>
          <option value="fundamental_incompleto">Ensino fundamental incompleto</option>
          <option value="fundamental_completo">Ensino fundamental completo</option>
          <option value="medio_incompleto">Ensino médio incompleto</option>
          <option value="medio_completo">Ensino médio completo</option>
          <option value="superior_incompleto">Ensino superior incompleto</option>
          <option value="superior_completo">Ensino superior completo</option>
          <option value="pos_graduacao">Pós-graduação</option>
        </select>
      </label>
      <div className="grade-campos">
        <label className="campo">
          Instituição de ensino
          <input
            value={dados.instituicao_ensino}
            onChange={(e) => atualizar('instituicao_ensino', e.target.value)}
            placeholder="Ex: UFRJ, SENAI, Colégio Estadual X"
          />
        </label>
        <label className="campo">
          Curso
          <input
            value={dados.curso}
            onChange={(e) => atualizar('curso', e.target.value)}
            placeholder="Ex: Direito, Técnico em Enfermagem"
          />
        </label>
        <label className="campo">
          Ano de início
          <input
            type="number"
            value={dados.curso_ano_inicio}
            onChange={(e) => atualizar('curso_ano_inicio', e.target.value)}
          />
        </label>
        <label className="campo">
          Ano de conclusão
          <input
            type="number"
            value={dados.curso_ano_conclusao}
            onChange={(e) => atualizar('curso_ano_conclusao', e.target.value)}
            disabled={dados.curso_em_andamento}
          />
        </label>
      </div>
      <label className="campo" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={dados.curso_em_andamento}
          onChange={(e) => atualizar('curso_em_andamento', e.target.checked)}
          style={{ width: 'auto' }}
        />
        Curso em andamento
      </label>
      <label className="campo">
        Cursos profissionalizantes
        <textarea
          value={dados.cursos_profissionalizantes}
          onChange={(e) => atualizar('cursos_profissionalizantes', e.target.value)}
          placeholder="Ex: Auxiliar administrativo (SENAI, 2024), Informática básica (2023)"
        />
      </label>
      <label className="campo">
        Bairros que aceito trabalhar
        <input
          value={dados.bairros_aceitos}
          onChange={(e) => atualizar('bairros_aceitos', e.target.value)}
          placeholder="Ex: Progresso, Velha Central, Centro"
        />
        <span className="campo-dica">Texto livre — escreva os bairros que ficam bons pra você se deslocar.</span>
      </label>
      <div className="campo" style={{ marginBottom: 16 }}>
        Já tem um currículo pronto?
        <UploadCurriculo nomeArquivo={perfil.curriculo_nome_arquivo} aoAtualizar={aoSalvar} />
      </div>
      <Botao variante={sujo ? 'primario' : 'contorno'} icone={Save} onClick={salvar} disabled={salvando || !sujo}>
        {salvando ? 'Salvando...' : sujo ? 'Salvar rascunho' : 'Tudo salvo'}
      </Botao>
      {sujo && !salvando && <span className="campo-dica">Você tem alterações não salvas nesta aba.</span>}
    </div>
  )
}
