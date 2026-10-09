/**
 * Espacio reservado para el logotipo oficial del proyecto.
 * Para usar el logo definitivo: guardarlo en `public/logo.svg` (o .png) y reemplazar
 * el contenido de este componente por: <img src="/logo.svg" alt="Ojo de Huaso" className={className} />
 */
export default function Logo({ className = 'h-10 w-10' }) {
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20`}
      title="Espacio para el logotipo oficial"
    >
      <svg viewBox="0 0 64 64" className="h-3/4 w-3/4" aria-hidden="true">
        <path
          d="M6 32c6.5-10.5 15-16 26-16s19.5 5.5 26 16c-6.5 10.5-15 16-26 16S12.5 42.5 6 32z"
          fill="none"
          stroke="#fff"
          strokeWidth="4"
        />
        <circle cx="32" cy="32" r="9" fill="#2457B8" stroke="#fff" strokeWidth="3" />
      </svg>
    </div>
  )
}
