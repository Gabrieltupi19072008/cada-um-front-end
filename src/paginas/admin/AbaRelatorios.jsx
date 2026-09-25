import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Briefcase, Building2, Download, Users } from 'lucide-react'
import cliente from '../../api/cliente'
import Aviso from '../../componentes/Aviso'
import Botao from '../../componentes/Botao'

function rotuloMes(mes) {
  const [ano, numero] = mes.split('-').map(Number)
  const texto = new Date(ano, numero - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function Numero({ icone: Icone, valor, rotulo, detalhe, para }) {
  return (
    <Link to={para} className="numero-relatorio">
      <span>
        <Icone size={20} />
      </span>
      <div>
        <b>{valor}</b>
        <p>{rotulo}</p>
        {detalhe && <small>{detalhe}</small>}
      </div>
    </Link>
  )
}

export default function AbaRelatorios({ aoExportar }) {
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    cliente
      .get('/admin/relatorios')
      .then((resposta) => setDados(resposta.data))
      .catch(() =>
        setErro('Não foi possível carregar os relatórios. Se o servidor acabou de ser atualizado, tente de novo em alguns minutos.')
      )
  }, [])

  if (erro) return <Aviso variante="erro">{erro}</Aviso>
  if (!dados) return <p className="texto-suave">Carregando...</p>

  const meses = dados.cadastros_por_mes.map((item) => ({ ...item, total: item.candidatos + item.empresas }))
  const maiorMes = Math.max(1, ...meses.map((item) => item.total))
  const novosNoPeriodo = meses.reduce((soma, item) => soma + item.total, 0)
  const mesAtual = meses[meses.length - 1]
  const totalRegioes = dados.candidatos_por_regiao.reduce((soma, item) => soma + item.total, 0)

  return (
    <div className="relatorios">
      <div className="numeros-relatorio">
        <Numero
          icone={Users}
          valor={dados.total_candidatos.toLocaleString('pt-BR')}
          rotulo="Candidatos cadastrados"
          detalhe={`+${mesAtual.candidatos} este mês`}
          para="/admin?secao=candidatos"
        />
        <Numero
          icone={Building2}
          valor={dados.empresas_aprovadas.toLocaleString('pt-BR')}
          rotulo="Empresas parceiras"
          detalhe={`${dados.total_empresas} cadastradas`}
          para="/admin?secao=empresas"
        />
        <Numero
          icone={Briefcase}
          valor={dados.vagas_ativas.toLocaleString('pt-BR')}
          rotulo="Vagas abertas"
          detalhe={`${dados.contratacoes} contratações feitas`}
          para="/admin?secao=empresas"
        />
        <Numero
          icone={BarChart3}
          valor={`${String(dados.cota_media).replace('.', ',')}%`}
          rotulo="Cota PcD cumprida"
          detalhe="Média das empresas obrigadas"
          para="/admin?secao=cota"
        />
      </div>

      <div className="relatorios-graficos">
        <section className="painel">
          <header className="painel-titulo">
            <div>
              <h2>Novos cadastros por mês</h2>
              <p>Candidatos e empresas · últimos {meses.length} meses</p>
            </div>
          </header>
          <p className="relatorio-destaque">
            <b>{novosNoPeriodo.toLocaleString('pt-BR')}</b> novos cadastros no período
          </p>
          <div className="grafico-colunas" role="img" aria-label="Novos cadastros por mês">
            {meses.map((item) => (
              <div
                className="grafico-colunas__item"
                key={item.mes}
                tabIndex={0}
                aria-label={`${rotuloMes(item.mes)}: ${item.candidatos} candidatos e ${item.empresas} empresas`}
              >
                <span className="grafico-colunas__valor">{item.total}</span>
                <div className="grafico-colunas__trilho">
                  <div
                    className="grafico-colunas__barra"
                    style={{ height: `${item.total === 0 ? 0 : Math.max(4, (item.total / maiorMes) * 100)}%` }}
                  />
                </div>
                <span className="grafico-colunas__mes">{rotuloMes(item.mes)}</span>
                <span className="grafico-colunas__dica" role="tooltip">
                  <b>{rotuloMes(item.mes)}</b>
                  {item.candidatos} candidato(s)
                  <br />
                  {item.empresas} empresa(s)
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="painel">
          <header className="painel-titulo">
            <div>
              <h2>Candidatos por região</h2>
              <p>Pelo estado informado no cadastro</p>
            </div>
          </header>
          {totalRegioes === 0 && <p className="texto-suave">Nenhum candidato cadastrado ainda.</p>}
          {totalRegioes > 0 &&
            dados.candidatos_por_regiao.map((item) => {
              const percentual = Math.round((item.total / totalRegioes) * 100)
              return (
                <div className="linha-regiao" key={item.regiao}>
                  <span>{item.regiao}</span>
                  <div className="linha-regiao__trilho">
                    <div style={{ width: `${percentual}%` }} />
                  </div>
                  <b>{percentual}%</b>
                  <small>{item.total}</small>
                </div>
              )
            })}
        </section>
      </div>

      <div>
        <Botao variante="contorno" icone={Download} onClick={aoExportar}>
          Exportar relatório de cota (CSV)
        </Botao>
      </div>
    </div>
  )
}
