import { ArrowRight, Clapperboard, ListChecks, MonitorPlay, Scissors } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'

const STEPS = [
  { icon: MonitorPlay, title: 'Carga el video', text: 'Selecciona el archivo MP4 de la corrida desde tu computador.' },
  { icon: Scissors, title: 'Marca el momento', text: 'Define el inicio y término de la atajada (máximo 60 segundos).' },
  { icon: ListChecks, title: 'Prepara el análisis', text: 'Revisa el resumen y deja el momento listo para analizar.' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bienvenido a Ojo de Huaso"
        subtitle="Plataforma de apoyo tecnológico para el análisis de momentos específicos de corridas de rodeo chileno."
      />

      {/* Tarjeta central: Nuevo análisis */}
      <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="relative bg-navy px-6 py-10 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{ background: 'radial-gradient(circle at 50% 120%, #2457B8 0%, transparent 65%)' }}
            aria-hidden="true"
          />
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Clapperboard className="h-10 w-10 text-white" strokeWidth={1.75} />
          </div>
        </div>
        <div className="px-6 py-8 text-center sm:px-10">
          <h3 className="text-xl font-bold text-navy">Nuevo análisis</h3>
          <p className="mx-auto mt-2 max-w-md text-slate-600">
            Carga el video de una corrida, reprodúcelo y selecciona el momento exacto de la atajada que deseas analizar.
          </p>
          <button
            type="button"
            onClick={() => navigate('/nuevo-analisis')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 focus-visible:ring-4 focus-visible:ring-brand/30 focus-visible:outline-none"
          >
            Comenzar análisis
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Cómo funciona */}
      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Paso {i + 1}</span>
            </div>
            <h4 className="mt-3 font-semibold text-navy">{title}</h4>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400">
        Ojo de Huaso es una herramienta de apoyo independiente de SIPLAN y no registra ni modifica puntajes oficiales.
      </p>
    </div>
  )
}
