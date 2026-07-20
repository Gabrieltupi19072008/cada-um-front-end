import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Ban } from 'lucide-react'
import cliente from '../../api/cliente'
import Botao from '../../componentes/Botao'
import Selo from '../../componentes/Selo'

const ROTULOS_MODALIDADE = { presencial: 'Presencial', hibrido: 'Híbrido', remoto: 'Remoto' }

export default function AbaMinhasVagas() {
  const [vagas, setVagas] = useState([])
  const [erro, setErro] = useState('')
  const navegar = useNavigate()

  function carregar() {
    cliente
      .get('/empresas/me/vagas')
      .then((resposta) => setVagas(resposta.data))
      .catch(() => setErro('Não foi possível carregar suas vagas'))
  }

  useEffect(() => {
    carregar()
  }, [])

  async function encerrar(id) {
    await cliente.delete(`/empresas/me/vagas/${id}`)
    carregar()
  }

  return (
    <div>
      <div className="espaco-entre" style={{ marginBottom: 16 }}>
        <h2>Minhas vagas</h2>
        <Botao icone={Plus} onClick={() => navegar('/empresa/vagas/nova')}>
          Nova vaga
        </Botao>
      </div>

      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {vagas.length === 0 && !erro && <p className="texto-suave">Você ainda não publicou nenhuma vaga.</p>}

      <div className="lista-candidatos">
        {vagas.map((vaga) => (
          <div key={vaga.id} className="linha-candidato">
            <div>
              <p className="linha-candidato__nome">{vaga.titulo}</p>
              <p className="linha-candidato__info">
                {vaga.cidade || 'Local não informado'} · {ROTULOS_MODALIDADE[vaga.modalidade]}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Selo variante={vaga.ativa ? 'sucesso' : 'navy'}>{vaga.ativa ? 'Ativa' : 'Encerrada'}</Selo>
              {vaga.ativa && (
                <Botao variante="contorno" icone={Ban} onClick={() => encerrar(vaga.id)}>
                  Encerrar
                </Botao>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
