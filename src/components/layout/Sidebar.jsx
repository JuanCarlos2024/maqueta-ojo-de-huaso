import { FolderOpen, HelpCircle, Home, Lightbulb, Plus, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import Logo from './Logo.jsx'

const NAV_ITEMS = [
  { label: 'Inicio', to: '/', icon: Home, end: true },
  { label: 'Nuevo análisis', to: '/nuevo-analisis', icon: Plus },
  { label: 'Análisis guardados', icon: FolderOpen, comingSoon: true },
  { label: 'Ayuda', icon: HelpCircle, comingSoon: true },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Fondo oscuro cuando el menú está abierto en tablets */}
      <div
        className={`fixed inset-0 z-30 bg-navy/60 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col bg-navy text-white shadow-xl transition-transform duration-200 lg:static lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menú principal"
      >
        {/* Encabezado institucional */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-8">
          <Logo />
          <div className="min-w-0">
            <p className="text-base leading-tight font-extrabold tracking-wide">OJO DE HUASO</p>
            <p className="truncate text-[11px] text-white/60">Análisis inteligente del Rodeo</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            if (item.comingSoon) {
              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/40"
                  aria-disabled="true"
                  title="Disponible en una próxima fase"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 whitespace-nowrap">{item.label}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white/60 uppercase">
                    Próximamente
                  </span>
                </div>
              )
            }
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-brand font-semibold text-white shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4">
          <div className="rounded-xl bg-navy-700 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-amber-300" />
              Consejo
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/65">
              Revisa que el momento seleccionado sea el correcto antes de analizarlo. El intervalo máximo es de 60
              segundos.
            </p>
          </div>
          <p className="mt-4 px-1 text-[10px] leading-relaxed text-white/35">
            Herramienta de apoyo independiente de SIPLAN. No registra ni modifica puntajes oficiales. · v0.1
          </p>
        </div>
      </aside>
    </>
  )
}
