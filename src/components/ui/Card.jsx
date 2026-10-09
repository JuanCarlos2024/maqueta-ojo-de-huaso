/** Tarjeta blanca de bordes suaves. `title` puede incluir la numeración del paso (ej. "1. Cargar video"). */
export default function Card({ title, badge, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      {title && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-base font-bold text-navy">{title}</h2>
          {badge}
        </div>
      )}
      {children}
    </section>
  )
}
