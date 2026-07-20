import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Briefcase } from 'lucide-react'
import Layout from '../componentes/Layout'
import Botao from '../componentes/Botao'
import Selo from '../componentes/Selo'
import cliente from '../api/cliente'

const ROTULOS_MODALIDADE = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' }
const ROTULOS_CONTRATO = { clt: 'CLT', pj: 'PJ', estagio: 'Estágio', temporario: 'Temporário' }

export default function VagasDisponiveis() {
  const [vagas, setVagas] = useState([])
  const [erro, setErro] = useState('')
  const navegar = useNavigate()

  useEffect(() => {
    cliente
      .get('/candidatos/vagas')
      .then((resposta) => setVagas(resposta.data))
      .catch(() => setErro('Não foi possível carregar as vagas'))
  }, [])

  return (
    <Layout largura="largo">
      <Botao variante="contorno" icone={ArrowLeft} onClick={() => navegar('/candidato')} style={{ marginBottom: 16 }}>
        Voltar ao início
      </Botao>

      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {!erro && vagas.length === 0 && <p className="texto-suave">Nenhuma vaga disponível no momento.</p>}

      <div className="lista-candidatos">
        {vagas.map((vaga) => (
          <div key={vaga.id} className="linha-candidato">
            <div>
              <p className="linha-candidato__nome">
                <Briefcase size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                {vaga.titulo}
              </p>
              <p className="linha-candidato__info">
                {vaga.empresa.razao_social || vaga.empresa.usuario.nome} · {vaga.cidade || 'Local não informado'} ·{' '}
                {ROTULOS_MODALIDADE[vaga.modalidade]} · {ROTULOS_CONTRATO[vaga.tipo_contrato]}
              </p>
            </div>
            <Selo variante="acento">{vaga.area || 'Geral'}</Selo>
          </div>
        ))}
      </div>
    </Layout>
  )
}
