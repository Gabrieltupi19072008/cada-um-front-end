import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import cliente from '../api/cliente'

const TAMANHO_MAXIMO_MB = 2
const DIMENSAO_ALVO = 320
const QUALIDADE_JPEG = 0.82

function obterIniciais(nome) {
  const partes = nome.trim().split(/\s+/)
  return partes.slice(0, 2).map((parte) => parte[0].toUpperCase()).join('')
}

function comprimirImagem(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onerror = () => reject(new Error('Não foi possível ler o arquivo'))
    leitor.onload = () => {
      const imagem = new Image()
      imagem.onerror = () => reject(new Error('Arquivo não é uma imagem válida'))
      imagem.onload = () => {
        const lado = Math.min(imagem.width, imagem.height)
        const origemX = (imagem.width - lado) / 2
        const origemY = (imagem.height - lado) / 2

        const tela = document.createElement('canvas')
        tela.width = DIMENSAO_ALVO
        tela.height = DIMENSAO_ALVO
        const contexto = tela.getContext('2d')
        contexto.drawImage(imagem, origemX, origemY, lado, lado, 0, 0, DIMENSAO_ALVO, DIMENSAO_ALVO)

        resolve(tela.toDataURL('image/jpeg', QUALIDADE_JPEG))
      }
      imagem.src = leitor.result
    }
    leitor.readAsDataURL(arquivo)
  })
}

export default function SeletorFoto({ fotoUrl, nome, aoAtualizar, tamanho = 84 }) {
  const inputRef = useRef(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function aoEscolherArquivo(evento) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo) return

    if (!arquivo.type.startsWith('image/')) {
      setErro('Escolha um arquivo de imagem (PNG, JPEG ou WEBP)')
      return
    }
    if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
      setErro(`Imagem muito grande (máximo ${TAMANHO_MAXIMO_MB} MB)`)
      return
    }

    setErro('')
    setEnviando(true)
    try {
      const dataUrl = await comprimirImagem(arquivo)
      await cliente.put('/usuarios/me/foto', { foto_base64: dataUrl })
      aoAtualizar?.()
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível atualizar a foto')
    } finally {
      setEnviando(false)
    }
  }

  async function remover() {
    setErro('')
    setEnviando(true)
    try {
      await cliente.delete('/usuarios/me/foto')
      aoAtualizar?.()
    } catch {
      setErro('Não foi possível remover a foto')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: tamanho, height: tamanho, margin: '0 auto' }}>
        <div
          className={fotoUrl ? '' : 'avatar-circulo'}
          style={{
            width: tamanho,
            height: tamanho,
            fontSize: Math.round(tamanho * 0.28),
            ...(fotoUrl
              ? {
                  borderRadius: '50%',
                  backgroundImage: `url(${fotoUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {}),
          }}
        >
          {!fotoUrl && obterIniciais(nome || '?')}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          title="Trocar foto"
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '2px solid #fff',
            background: 'var(--acento)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: enviando ? 'default' : 'pointer',
            opacity: enviando ? 0.6 : 1,
          }}
        >
          <Camera size={14} />
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={aoEscolherArquivo} style={{ display: 'none' }} />
      </div>
      {fotoUrl && (
        <button
          type="button"
          onClick={remover}
          disabled={enviando}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 11,
            color: 'var(--texto-suave, #8a8378)',
            background: 'transparent',
            border: 'none',
            cursor: enviando ? 'default' : 'pointer',
            padding: 0,
          }}
        >
          <X size={11} /> Remover foto
        </button>
      )}
      {erro && <span style={{ fontSize: 11, color: 'var(--erro, #b8392f)', textAlign: 'center' }}>{erro}</span>}
    </div>
  )
}
