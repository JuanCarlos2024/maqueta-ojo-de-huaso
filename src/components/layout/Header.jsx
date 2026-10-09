import { Menu } from 'lucide-react'
import Logo from './Logo.jsx'

/**
 * Barra superior visible en tablets (pantallas < lg), donde el menú lateral está oculto.
 * En computadores el encabezado institucional se muestra en la parte superior del menú lateral.
 */
export default function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 bg-navy text-white lg:hidden">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-white/80 hover:bg-white/10"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo className="h-9 w-9" />
        <div className="min-w-0">
          <p className="leading-tight font-extrabold tracking-wide">OJO DE HUASO</p>
          <p className="text-[11px] text-white/60">Análisis inteligente del Rodeo</p>
        </div>
      </div>
    </header>
  )
}
