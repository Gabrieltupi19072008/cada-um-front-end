import { useNavigate } from 'react-router-dom'
import { ArrowLeft, PlayCircle } from 'lucide-react'
import Layout from '../componentes/Layout'
import Botao from '../componentes/Botao'
import { CONTEUDO_ORIENTACAO } from '../dados/conteudoOrientacao'

export default function Orientacao() {
  const navegar = useNavigate()

  return (
    <Layout largura="largo">
      <Botao variante="contorno" icone={ArrowLeft} onClick={() => navegar('/candidato')} style={{ marginBottom: 16 }}>
        Voltar ao início
      </Botao>
      <h2 style={{ marginBottom: 16 }}>Orientação</h2>
      <div className="grade-orientacao">
        {CONTEUDO_ORIENTACAO.map((item) => (
          <div className="card-video" key={item.titulo}>
            <a
              className="card-video__thumb"
              href={item.url || undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!item.url}
              onClick={(e) => !item.url && e.preventDefault()}
            >
              <span className="card-video__play">
                <PlayCircle size={22} color="#fff" />
              </span>
            </a>
            <div className="card-video__corpo">
              <span className="card-video__categoria">{item.categoria}</span>
              <span className="card-video__titulo">{item.titulo}</span>
              <span className="card-video__desc">{item.descricao}</span>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
