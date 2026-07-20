import { useEffect, useState } from 'react'
import cliente from '../../api/cliente'
import Selo from '../../componentes/Selo'

const ROTULOS_STATUS = {
  pendente: { texto: 'Pendente', variante: 'alerta' },
  visualizado: { texto: 'Visualizado', variante: 'acento' },
  aceito: { texto: 'Aceito', variante: 'sucesso' },
  recusado: { texto: 'Recusado', variante: 'navy' },
}

export default function AbaInteressesEnviados() {
  const [interesses, setInteresses] = useState([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    cliente
      .get('/empresas/me/interesses')
      .then((resposta) => setInteresses(resposta.data))
      .catch(() => setErro('Não foi possível carregar os interesses'))
  }, [])

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Interesses enviados</h2>
      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {interesses.length === 0 && !erro && (
        <p className="texto-suave">Você ainda não demonstrou interesse em nenhum candidato.</p>
      )}
      <div className="lista-candidatos">
        {interesses.map((interesse) => (
          <div key={interesse.id} className="linha-candidato">
            <div>
              <p className="linha-candidato__nome">{interesse.candidato.usuario.nome}</p>
              <p className="linha-candidato__info">{interesse.mensagem || 'Sem mensagem'}</p>
            </div>
            <Selo variante={ROTULOS_STATUS[interesse.status].variante}>
              {ROTULOS_STATUS[interesse.status].texto}
            </Selo>
          </div>
        ))}
      </div>
    </div>
  )
}
