import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X } from 'lucide-react'
import Layout from '../componentes/Layout'
import Botao from '../componentes/Botao'
import Selo from '../componentes/Selo'
import cliente from '../api/cliente'

const ROTULOS_STATUS = {
  pendente: { texto: 'Pendente', variante: 'alerta' },
  visualizado: { texto: 'Visualizado', variante: 'acento' },
  aceito: { texto: 'Aceito', variante: 'sucesso' },
  recusado: { texto: 'Recusado', variante: 'navy' },
}

export default function InteressesRecebidos() {
  const [interesses, setInteresses] = useState([])
  const [erro, setErro] = useState('')
  const navegar = useNavigate()

  function carregar() {
    cliente
      .get('/candidatos/me/interesses')
      .then((resposta) => setInteresses(resposta.data))
      .catch(() => setErro('Não foi possível carregar os interesses'))
  }

  useEffect(() => {
    carregar()
  }, [])

  async function responder(id, status) {
    await cliente.put(`/candidatos/me/interesses/${id}`, { status })
    carregar()
  }

  return (
    <Layout largura="largo">
      <Botao variante="contorno" icone={ArrowLeft} onClick={() => navegar('/candidato')} style={{ marginBottom: 16 }}>
        Voltar ao início
      </Botao>

      {erro && <p className="aviso aviso--erro">{erro}</p>}
      {!erro && interesses.length === 0 && <p className="texto-suave">Nenhuma empresa demonstrou interesse ainda.</p>}

      <div className="lista-candidatos">
        {interesses.map((interesse) => (
          <div key={interesse.id} className="linha-candidato">
            <div>
              <p className="linha-candidato__nome">
                {interesse.empresa.razao_social || interesse.empresa.usuario.nome}
              </p>
              <p className="linha-candidato__info">
                {interesse.vaga ? `Vaga: ${interesse.vaga.titulo}` : 'Contato direto'}
                {interesse.mensagem ? ` — "${interesse.mensagem}"` : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Selo variante={ROTULOS_STATUS[interesse.status].variante}>
                {ROTULOS_STATUS[interesse.status].texto}
              </Selo>
              {(interesse.status === 'pendente' || interesse.status === 'visualizado') && (
                <>
                  <Botao variante="sucesso" icone={Check} onClick={() => responder(interesse.id, 'aceito')}>
                    Aceitar
                  </Botao>
                  <Botao variante="contorno" icone={X} onClick={() => responder(interesse.id, 'recusado')}>
                    Recusar
                  </Botao>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
