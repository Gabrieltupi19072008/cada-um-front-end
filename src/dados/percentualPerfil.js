// Percentual de preenchimento do perfil do candidato (mesma regra no painel e no currículo).
export function calcularPercentualPerfil(perfil) {
  const campos = [
    Boolean(perfil.cidade),
    Boolean(perfil.estado),
    Boolean(perfil.telefone),
    Boolean(perfil.sobre_mim),
    Boolean(perfil.grau_tea),
    Boolean(perfil.curso || perfil.escolaridade),
    perfil.experiencias.length > 0,
    perfil.habilidades.length > 0,
  ]
  const preenchidos = campos.filter(Boolean).length
  return Math.round((preenchidos / campos.length) * 100)
}
