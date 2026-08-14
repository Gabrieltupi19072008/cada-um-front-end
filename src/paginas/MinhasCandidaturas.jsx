import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Layout from '../componentes/Layout'
import Botao from '../componentes/Botao'
import Selo from '../componentes/Selo'
import cliente from '../api/cliente'

const ROTULOS_STATUS = {
  pendente: { texto: 'Em análise', variante: 'alerta' },
  visualizado: { texto: 'Em análise', variante: 'alerta' },
  aceito: { texto: 'Aceita', variante: 'sucesso' },
  recusado: { texto: 'Não seguiu', variante: 'navy' },
}

export default function MinhasCandidaturas() {
  const [candidaturas, setCandidaturas] = useState([])
  const [erro, setErro] = useState('')
  const navegar = useNavigate()

  useEffect(() => {
    cliente
      .get('/candidatos/me/candidaturas')
      .then((resposta) => setCandidaturas(resposta.data))
      .catch(() => setErro('Não foi possível carregar suas candidaturas'))
  }, [])

  return (
    <Layout largura="largo">
      <Botao variante="contorno" icone={ArrowLeft} onClick={() => navegar('/candidato')} style={{ marginBottom: 16 }}>
        Voltar ao início
      </Botao>

      <h2 style={{ marginBottom: 16 }}>Minhas candidaturas</h2>

      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {!erro && candidaturas.length === 0 && (
        <p className="texto-suave">Você ainda não se candidatou a nenhuma vaga.</p>
      )}

      <div className="lista-candidatos">
        {candidaturas.map((candidatura) => (
          <div key={candidatura.id} className="linha-candidato">
            <div>
              <p className="linha-candidato__nome">
                {candidatura.vaga ? candidatura.vaga.titulo : 'Vaga'}
              </p>
              <p className="linha-candidato__info">
                {candidatura.empresa.razao_social || candidatura.empresa.usuario.nome}
              </p>
            </div>
            <Selo variante={ROTULOS_STATUS[candidatura.status].variante}>
              {ROTULOS_STATUS[candidatura.status].texto}
            </Selo>
          </div>
        ))}
      </div>
    </Layout>
  )
}
