import { useEffect, useState } from 'react'
import cliente from '../../api/cliente'
import BarraProgresso from '../../componentes/BarraProgresso'

export default function AbaRelatorioCota() {
  const [cota, setCota] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    cliente
      .get('/empresas/me/cota')
      .then((resposta) => setCota(resposta.data))
      .catch(() => setErro('Não foi possível carregar o relatório'))
  }, [])

  if (erro) return <p className="aviso aviso--erro">{erro}</p>
  if (!cota) return <p className="texto-suave">Carregando...</p>

  const cor = cota.percentual >= 80 ? 'sucesso' : cota.percentual >= 50 ? 'acento' : 'alerta'

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Relatório de cota TEA</h2>
      <div className="linha-cota">
        <div className="linha-cota__topo">
          <span>Interesses aceitos vs. meta da empresa</span>
          <strong>{cota.percentual}%</strong>
        </div>
        <BarraProgresso valor={cota.percentual} cor={cor} />
      </div>
      <p className="texto-suave">
        {cota.aceitos} contratação(ões) TEA de uma meta de {cota.meta_cota || 'não definida'}.
      </p>
    </div>
  )
}
