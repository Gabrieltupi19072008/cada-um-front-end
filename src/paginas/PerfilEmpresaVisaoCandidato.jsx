import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Globe } from 'lucide-react'
import Layout from '../componentes/Layout'
import Cartao from '../componentes/Cartao'
import Botao from '../componentes/Botao'
import cliente from '../api/cliente'

function obterIniciais(nome) {
  const partes = nome.trim().split(/\s+/)
  return partes.slice(0, 2).map((parte) => parte[0].toUpperCase()).join('')
}

export default function PerfilEmpresaVisaoCandidato() {
  const { empresaId } = useParams()
  const navegar = useNavigate()
  const [empresa, setEmpresa] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    cliente
      .get(`/candidatos/empresas/${empresaId}`)
      .then((resposta) => setEmpresa(resposta.data))
      .catch(() => setErro('Não foi possível carregar esta empresa'))
  }, [empresaId])

  if (erro) {
    return (
      <Layout>
        <p className="aviso aviso--erro">{erro}</p>
      </Layout>
    )
  }

  if (!empresa) {
    return (
      <Layout>
        <p className="texto-suave">Carregando...</p>
      </Layout>
    )
  }

  const nomeExibido = empresa.razao_social || empresa.usuario.nome
  const fotoUrl = empresa.usuario.foto_url

  return (
    <Layout largura="largo">
      <Botao variante="contorno" icone={ArrowLeft} onClick={() => navegar(-1)} style={{ marginBottom: 16 }}>
        Voltar
      </Botao>

      <Cartao titulo={nomeExibido} icone={Building2}>
        <div className="grade-curriculo">
          <div className="curriculo-lateral">
            <div
              className={fotoUrl ? '' : 'avatar-circulo'}
              style={
                fotoUrl
                  ? {
                      width: 84,
                      height: 84,
                      borderRadius: '50%',
                      backgroundImage: `url(${fotoUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      margin: '0 auto 12px',
                    }
                  : {}
              }
            >
              {!fotoUrl && obterIniciais(nomeExibido)}
            </div>
            <p className="perfil-lateral__nome">{nomeExibido}</p>
            <p className="perfil-lateral__info">
              {empresa.cidade}
              {empresa.estado ? ` - ${empresa.estado}` : ''}
            </p>
            {empresa.setor && <p className="perfil-lateral__info">{empresa.setor}</p>}
          </div>

          <div>
            <div className="secao-curriculo">
              <h2>Sobre a empresa</h2>
              <p>{empresa.descricao || 'Não informado.'}</p>
              {empresa.site && (
                <a
                  href={empresa.site}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginTop: 12 }}
                >
                  <Globe size={13} /> Site
                </a>
              )}
            </div>
          </div>
        </div>
      </Cartao>
    </Layout>
  )
}
