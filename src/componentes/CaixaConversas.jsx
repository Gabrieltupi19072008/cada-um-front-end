import { MessageCircle } from 'lucide-react'
import Selo from './Selo'

function obterIniciais(nome) {
  return (nome || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')
}

export function AvatarConversa({ nome, fotoUrl }) {
  if (fotoUrl) {
    return <span className="avatar-conversa avatar-conversa--foto" style={{ backgroundImage: `url(${fotoUrl})` }} />
  }
  return <span className="avatar-conversa">{obterIniciais(nome)}</span>
}

// Lista de conversas à esquerda + painel da conversa selecionada à direita.
// Cada item: { id, nome, fotoUrl, resumo, selo: { texto, variante } }.
export default function CaixaConversas({ itens, selecionadoId, aoSelecionar, children }) {
  return (
    <div className="caixa-conversas">
      <section className="lista-conversas" aria-label="Conversas">
        {itens.map((item) => (
          <button
            type="button"
            key={item.id}
            className={item.id === selecionadoId ? 'ativa' : ''}
            onClick={() => aoSelecionar(item.id)}
          >
            <AvatarConversa nome={item.nome} fotoUrl={item.fotoUrl} />
            <div>
              <b>{item.nome}</b>
              <p>{item.resumo}</p>
              <Selo variante={item.selo.variante}>{item.selo.texto}</Selo>
            </div>
          </button>
        ))}
      </section>
      <section className="painel-conversa">
        {children || (
          <div className="conversa-placeholder">
            <MessageCircle size={32} />
            <b>Selecione uma conversa</b>
            <p>Clique em um item da lista para ver os detalhes.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export function CabecalhoConversa({ nome, fotoUrl, subtitulo, selo, acoes }) {
  return (
    <header className="cabecalho-conversa">
      <AvatarConversa nome={nome} fotoUrl={fotoUrl} />
      <div>
        <b>{nome}</b>
        <small>{subtitulo}</small>
      </div>
      {selo && <Selo variante={selo.variante}>{selo.texto}</Selo>}
      {acoes && <div className="cabecalho-conversa__acoes">{acoes}</div>}
    </header>
  )
}

export function ConversaBloqueada({ titulo, texto }) {
  return (
    <div className="conversa-placeholder">
      <MessageCircle size={32} />
      <b>{titulo}</b>
      <p>{texto}</p>
    </div>
  )
}
