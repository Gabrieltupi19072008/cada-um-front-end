export function iniciais(nome) {
  return (nome || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')
}

export function semAcento(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

// Datas sem horário ("2025-01-01") viram meio-dia local, para o fuso não voltar um dia.
function paraData(dataIso) {
  return new Date(dataIso.length === 10 ? `${dataIso}T12:00:00` : dataIso)
}

export function mesAno(dataIso) {
  if (!dataIso) return '—'
  const texto = paraData(dataIso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1).replace('.', '').replace(' de ', ' ')
}

export function dataCompleta(dataIso) {
  if (!dataIso) return '—'
  return paraData(dataIso).toLocaleDateString('pt-BR')
}

export function local(item) {
  return [item.cidade, item.estado].filter(Boolean).join(' · ') || '—'
}
