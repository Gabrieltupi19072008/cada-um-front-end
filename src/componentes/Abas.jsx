export default function Abas({ abas, ativa, aoMudar }) {
  return (
    <div className="abas" role="tablist">
      {abas.map((aba) => (
        <button
          key={aba.chave}
          role="tab"
          aria-selected={ativa === aba.chave}
          className={`aba ${ativa === aba.chave ? 'aba--ativa' : ''}`}
          onClick={() => aoMudar(aba.chave)}
          type="button"
        >
          {aba.icone && <aba.icone size={16} />}
          {aba.rotulo}
        </button>
      ))}
    </div>
  )
}
