import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Aviso from '../../componentes/Aviso'
import BarraProgresso from '../../componentes/BarraProgresso'

export default function AbaRelatorioCota() {
  const [cota, setCota] = useState(null)
  const [totalFuncionarios, setTotalFuncionarios] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  function carregar() {
    cliente
      .get('/empresas/me/cota')
      .then((resposta) => {
        setCota(resposta.data)
        setTotalFuncionarios(resposta.data.total_funcionarios ?? '')
      })
      .catch(() => setErro('Não foi possível carregar o relatório'))
  }

  useEffect(() => {
    carregar()
  }, [])

  async function salvar() {
    setSalvando(true)
    setErro('')
    try {
      await cliente.put('/empresas/me', {
        total_funcionarios: totalFuncionarios === '' ? null : Number(totalFuncionarios),
      })
      setSucesso(true)
      carregar()
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível salvar')
    } finally {
      setSalvando(false)
    }
  }

  if (erro && !cota) return <p className="aviso aviso--erro">{erro}</p>
  if (!cota) return <p className="texto-suave">Carregando...</p>

  const cor = cota.percentual_cumprido >= 80 ? 'sucesso' : cota.percentual_cumprido >= 50 ? 'acento' : 'alerta'

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Relatório de cota PcD</h2>

      <label className="campo" style={{ maxWidth: 280 }}>
        Quantidade de funcionários da empresa
        <input
          type="number"
          min="0"
          value={totalFuncionarios}
          onChange={(e) => {
            setTotalFuncionarios(e.target.value)
            setSucesso(false)
          }}
          placeholder="Ex: 250"
        />
      </label>
      {erro && <Aviso variante="erro">{erro}</Aviso>}
      {sucesso && <Aviso variante="sucesso">Salvo!</Aviso>}
      <Botao
        variante="primario"
        icone={Save}
        onClick={salvar}
        disabled={salvando}
        style={{ marginBottom: 24 }}
      >
        {salvando ? 'Salvando...' : 'Salvar'}
      </Botao>

      {cota.vagas_necessarias === 0 ? (
        <p className="texto-suave">
          {cota.total_funcionarios
            ? 'Com esse número de funcionários, a Lei de Cotas (Art. 93 da Lei nº 8.213/91) ainda não exige vagas reservadas para PcD (a partir de 100 funcionários).'
            : 'Informe a quantidade de funcionários acima pra calcular sua cota legal.'}
        </p>
      ) : (
        <>
          <div className="linha-cota">
            <div className="linha-cota__topo">
              <span>
                {cota.aceitos} de {cota.vagas_necessarias} vagas preenchidas (cota legal de {cota.percentual_legal}%
                pra {cota.total_funcionarios} funcionários)
              </span>
              <strong>{cota.percentual_cumprido}%</strong>
            </div>
            <BarraProgresso valor={cota.percentual_cumprido} cor={cor} />
          </div>
          <p className="texto-suave">
            {cota.aceitos} contratação(ões) via plataforma de uma cota legal de {cota.vagas_necessarias} vaga(s)
            reservada(s) para PcD.
          </p>
        </>
      )}
    </div>
  )
}
