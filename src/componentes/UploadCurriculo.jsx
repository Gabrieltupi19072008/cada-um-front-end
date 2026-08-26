import { useRef, useState } from 'react'
import { FileText, Upload, Download, X } from 'lucide-react'
import cliente from '../api/cliente'
import Botao from './Botao'

const TAMANHO_MAXIMO_MB = 4
const TIPOS_ACEITOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function lerComoDataUrl(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => resolve(leitor.result)
    leitor.onerror = () => reject(new Error('Não foi possível ler o arquivo'))
    leitor.readAsDataURL(arquivo)
  })
}

export default function UploadCurriculo({ nomeArquivo, aoAtualizar }) {
  const inputRef = useRef(null)
  const [arrastandoSobre, setArrastandoSobre] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [baixando, setBaixando] = useState(false)
  const [erro, setErro] = useState('')

  async function processarArquivo(arquivo) {
    if (!arquivo) return
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      setErro('Envie um arquivo PDF ou Word (.doc/.docx)')
      return
    }
    if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
      setErro(`Arquivo muito grande (máximo ${TAMANHO_MAXIMO_MB} MB)`)
      return
    }

    setErro('')
    setEnviando(true)
    try {
      const dataUrl = await lerComoDataUrl(arquivo)
      await cliente.put('/candidatos/me/curriculo-arquivo', {
        arquivo_base64: dataUrl,
        nome_arquivo: arquivo.name,
      })
      aoAtualizar?.()
    } catch (erroRequisicao) {
      setErro(erroRequisicao.response?.data?.detail || 'Não foi possível enviar o currículo')
    } finally {
      setEnviando(false)
    }
  }

  function aoSoltarArquivo(evento) {
    evento.preventDefault()
    setArrastandoSobre(false)
    processarArquivo(evento.dataTransfer.files?.[0])
  }

  async function baixar() {
    setBaixando(true)
    setErro('')
    try {
      const resposta = await cliente.get('/candidatos/me/curriculo-arquivo', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([resposta.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = nomeArquivo || 'curriculo'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setErro('Não foi possível baixar o currículo')
    } finally {
      setBaixando(false)
    }
  }

  async function remover() {
    setErro('')
    try {
      await cliente.delete('/candidatos/me/curriculo-arquivo')
      aoAtualizar?.()
    } catch {
      setErro('Não foi possível remover o currículo')
    }
  }

  if (nomeArquivo) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          border: '1px solid var(--borda, #e5e1d8)',
          borderRadius: 10,
          background: 'var(--fundo-2, #faf9f5)',
        }}
      >
        <FileText size={18} style={{ flex: 'none' }} />
        <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {nomeArquivo}
        </span>
        <Botao variante="contorno" icone={Download} onClick={baixar} disabled={baixando}>
          {baixando ? 'Baixando...' : 'Baixar'}
        </Botao>
        <Botao variante="contorno" icone={X} onClick={remover}>
          Remover
        </Botao>
        {erro && <span style={{ fontSize: 11, color: 'var(--erro, #b8392f)' }}>{erro}</span>}
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setArrastandoSobre(true)
        }}
        onDragLeave={() => setArrastandoSobre(false)}
        onDrop={aoSoltarArquivo}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${arrastandoSobre ? 'var(--acento)' : 'var(--borda, #d8d2c5)'}`,
          borderRadius: 10,
          padding: '20px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: arrastandoSobre ? 'var(--fundo-2, #faf9f5)' : 'transparent',
        }}
      >
        <Upload size={22} style={{ marginBottom: 6, opacity: 0.7 }} />
        <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
          {enviando ? 'Enviando...' : 'Já tem um currículo pronto?'}
        </p>
        <p className="texto-suave" style={{ fontSize: 12, margin: '2px 0 0' }}>
          Arraste o arquivo aqui ou clique pra escolher (PDF ou Word, até {TAMANHO_MAXIMO_MB} MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => processarArquivo(e.target.files?.[0])}
          style={{ display: 'none' }}
        />
      </div>
      {erro && (
        <p className="aviso aviso--erro" style={{ marginTop: 6, fontSize: 12 }}>
          {erro}
        </p>
      )}
    </div>
  )
}
