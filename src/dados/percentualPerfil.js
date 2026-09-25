// Partes do perfil do candidato (mesma regra no Início e no currículo).
export function partesPerfil(perfil) {
  return [
    { rotulo: 'Cidade', feito: Boolean(perfil.cidade) },
    { rotulo: 'Estado', feito: Boolean(perfil.estado) },
    { rotulo: 'Telefone', feito: Boolean(perfil.telefone) },
    { rotulo: 'Sobre mim', feito: Boolean(perfil.sobre_mim) },
    { rotulo: 'TEA & necessidades', feito: Boolean(perfil.grau_tea) },
    { rotulo: 'Escolaridade', feito: Boolean(perfil.curso || perfil.escolaridade) },
    { rotulo: 'Experiências', feito: perfil.experiencias.length > 0 },
    { rotulo: 'Habilidades', feito: perfil.habilidades.length > 0 },
  ]
}

export function calcularPercentualPerfil(perfil) {
  const partes = partesPerfil(perfil)
  const preenchidos = partes.filter((parte) => parte.feito).length
  return Math.round((preenchidos / partes.length) * 100)
}
