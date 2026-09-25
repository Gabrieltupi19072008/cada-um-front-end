import { Briefcase, Heart, Sparkles } from 'lucide-react'
import Logo from './Logo'

export default function LayoutPublico({ children }) {
  return (
    <div className="tela-publica">
      <div className="orbe orbe--um" />
      <div className="orbe orbe--dois" />

      <header className="cabecalho-publico">
        <Logo />
        <span>Inclusão que transforma</span>
      </header>

      <section className="publico-grade">
        <div className="publico-historia">
          <span className="sobretitulo">
            <Sparkles size={16} /> A nova área de oportunidades CADA UM
          </span>
          <h1>
            Talentos únicos.
            <br />
            Um lugar para <span>cada um.</span>
          </h1>
          <p>
            O cuidado e a tecnologia que você já conhece, agora conectando pessoas autistas a empresas que
            valorizam diferentes formas de pensar.
          </p>
          <div className="ecossistema">
            <span>Também no ecossistema:</span>
            <b>Identificação digital</b>
            <i />
            <b>QR Code</b>
            <i />
            <b>Apoio em emergências</b>
          </div>

          <div className="cartao-flutuante cartao-flutuante--a">
            <span>
              <Briefcase size={20} />
            </span>
            <div>
              <b>Nova oportunidade</b>
              <small>Vagas de empresas parceiras</small>
            </div>
          </div>
          <div className="cartao-flutuante cartao-flutuante--b">
            <span>
              <Heart size={20} />
            </span>
            <div>
              <b>Match inclusivo</b>
              <small>Perfil compatível</small>
            </div>
          </div>
        </div>

        <div className="cartao-publico">
          <span className="logo-mobile">
            <Logo compacto />
          </span>
          {children}
        </div>
      </section>
    </div>
  )
}
