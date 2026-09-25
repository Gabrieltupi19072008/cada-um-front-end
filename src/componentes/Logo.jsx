import logoHorizontal from '../assets/logo-horizontal.png'

export default function Logo({ compacto = false }) {
  return (
    <div className={`logo ${compacto ? 'logo--compacto' : ''}`}>
      <img src={logoHorizontal} alt="CADA UM" />
    </div>
  )
}
