import { ArrowRight } from 'lucide-react'
import Layout from '../componentes/Layout'
import CabecalhoPagina from '../componentes/CabecalhoPagina'
import { CONTEUDO_ORIENTACAO } from '../dados/conteudoOrientacao'

export default function Orientacao() {
  return (
    <Layout largura="largo">
      <CabecalhoPagina
        sobretitulo="CENTRAL DE CONTEÚDOS"
        titulo="Prepare-se no seu ritmo"
        descricao="Conteúdos curtos e objetivos para apoiar cada etapa da sua jornada."
      />
      <div className="grade-orientacao">
        {CONTEUDO_ORIENTACAO.map((item, indice) => (
          <a
            className="card-conteudo"
            key={item.titulo}
            href={item.url || undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!item.url}
            onClick={(e) => !item.url && e.preventDefault()}
          >
            <div className={`card-conteudo__capa capa-${(indice % 5) + 1}`}>
              <span>
                <ArrowRight size={22} />
              </span>
            </div>
            <div className="card-conteudo__corpo">
              <small>{item.categoria.toUpperCase()}</small>
              <h2>{item.titulo}</h2>
              <p>{item.descricao}</p>
              <b>
                {item.url ? 'Assistir agora' : 'Em breve'} <ArrowRight size={15} />
              </b>
            </div>
          </a>
        ))}
      </div>
    </Layout>
  )
}
