import { useEffect, useState } from 'react'
import cliente from '../../api/cliente'
import Selo from '../../componentes/Selo'

const ROTULOS_STATUS = {
  pendente: { texto: 'Novo', variante: 'sucesso' },
  visualizado: { texto: 'Visualizado', variante: 'acento' },
  aceito: { texto: 'Aceito', variante: 'sucesso' },
  recusado: { texto: 'Recusado', variante: 'navy' },
}

export default function AbaCandidaturasRecebidas() {
  const [candidaturas, setCandidaturas] = useState([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    cliente
      .get('/empresas/me/candidaturas')
      .then((resposta) => setCandidaturas(resposta.data))
      .catch(() => setErro('Não foi possível carregar as candidaturas'))
  }, [])

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Candidaturas recebidas</h2>
      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {candidaturas.length === 0 && !erro && (
        <p className="texto-suave">Ninguém se candidatou diretamente às suas vagas ainda.</p>
      )}
      <div className="lista-candidatos">
        {candidaturas.map((candidatura) => (
          <div key={candidatura.id} className="linha-candidato">
            <div>
              <p className="linha-candidato__nome">{candidatura.candidato.usuario.nome}</p>
              <p className="linha-candidato__info">{candidatura.mensagem || 'Candidatura direta pela vaga'}</p>
            </div>
            <Selo variante={ROTULOS_STATUS[candidatura.status].variante}>
              {ROTULOS_STATUS[candidatura.status].texto}
            </Selo>
          </div>
        ))}
      </div>
    </div>
  )
}
