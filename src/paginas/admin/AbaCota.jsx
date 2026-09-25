import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Selo from '../../componentes/Selo'

function situacao(cota) {
  if (cota.vagas_necessarias === 0) return { texto: 'Isenta', variante: 'navy' }
  if (cota.aceitos >= cota.vagas_necessarias) return { texto: 'Cumprida', variante: 'sucesso' }
  return { texto: `Faltam ${cota.vagas_necessarias - cota.aceitos}`, variante: 'alerta' }
}

export default function AbaCota({ cotas }) {
  const [mostrarIsentas, setMostrarIsentas] = useState(false)

  const obrigadas = cotas
    .filter((cota) => cota.vagas_necessarias > 0)
    .sort((a, b) => a.percentual_cumprido - b.percentual_cumprido)
  const isentas = cotas.filter((cota) => cota.vagas_necessarias === 0)
  const cumprem = obrigadas.filter((cota) => cota.aceitos >= cota.vagas_necessarias).length
  const media = obrigadas.length
    ? Math.round(obrigadas.reduce((soma, cota) => soma + cota.percentual_cumprido, 0) / obrigadas.length)
    : 0

  if (cotas.length === 0) return <p className="texto-suave">Nenhuma empresa aprovada ainda.</p>

  return (
    <div className="relatorios">
      <div className="numeros-inicio">
        <div>
          <b>{obrigadas.length}</b>
          <span>empresas obrigadas pela Lei de Cotas</span>
        </div>
        <div>
          <b>
            {cumprem} de {obrigadas.length}
          </b>
          <span>já cumprem a cota</span>
        </div>
        <div>
          <b>{media}%</b>
          <span>da cota cumprida, em média</span>
        </div>
      </div>

      <section className="painel tabela-painel">
        <header className="painel-titulo">
          <div>
            <h2>Empresas obrigadas</h2>
            <p>Quem está mais longe da meta aparece primeiro</p>
          </div>
        </header>
        {obrigadas.length === 0 ? (
          <p className="texto-suave">Nenhuma empresa aprovada tem 100 funcionários ou mais.</p>
        ) : (
          <div className="tabela-rolagem">
            <table className="tabela-admin">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Funcionários</th>
                  <th>Cota exigida</th>
                  <th>Contratados</th>
                  <th>Progresso</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {obrigadas.map((cota) => {
                  const estado = situacao(cota)
                  return (
                    <tr key={cota.empresa_id}>
                      <td>
                        <b>{cota.razao_social || '—'}</b>
                      </td>
                      <td>{cota.total_funcionarios}</td>
                      <td>
                        {cota.vagas_necessarias} vagas <small>({cota.percentual_legal}%)</small>
                      </td>
                      <td>{cota.aceitos}</td>
                      <td>
                        <div className="progresso-tabela">
                          <div className="progresso-tabela__trilho">
                            <div style={{ width: `${Math.min(100, cota.percentual_cumprido)}%` }} />
                          </div>
                          <b>{Math.round(cota.percentual_cumprido)}%</b>
                        </div>
                      </td>
                      <td>
                        <Selo variante={estado.variante}>{estado.texto}</Selo>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isentas.length > 0 && (
        <section className="painel">
          <button
            type="button"
            className="botao-expandir"
            aria-expanded={mostrarIsentas}
            onClick={() => setMostrarIsentas((atual) => !atual)}
          >
            <span>
              <b>Empresas isentas ({isentas.length})</b>
              <small>Menos de 100 funcionários, ou número de funcionários não informado</small>
            </span>
            <ChevronDown size={20} style={{ transform: mostrarIsentas ? 'rotate(180deg)' : 'none' }} />
          </button>
          {mostrarIsentas && (
            <ul className="lista-isentas">
              {isentas.map((cota) => (
                <li key={cota.empresa_id}>
                  <span>{cota.razao_social || '—'}</span>
                  <small>
                    {cota.total_funcionarios ? `${cota.total_funcionarios} funcionários` : 'Funcionários não informados'}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
