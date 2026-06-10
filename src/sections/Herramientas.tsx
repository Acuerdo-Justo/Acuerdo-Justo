import { ArrowRight, CalendarDays, Video } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const tools = [
  {
    icon: Video,
    title: 'Asesoría virtual',
    description: 'Recibe orientación especializada de forma ágil, confidencial y sin barreras de ubicación.',
  },
  {
    icon: CalendarDays,
    title: 'Agendamiento de mediación',
    description: 'Gestiona una fecha de atención y da el primer paso hacia una conciliación efectiva.',
  },
];

export function Herramientas() {
  const { ref, isVisible } = useInView();

  return (
    <section id="plataforma" className="relative py-24 lg:py-32" ref={ref}>
      <div className={`relative max-w-7xl mx-auto px-6 lg:px-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="mb-14 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand">Servicios digitales</p>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">Plataforma digital</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              Servicios para facilitar la atención y acercar orientación jurídica a más familias.
            </p>
          </div>
          <a href="/login" className="group inline-flex w-fit items-center gap-2 border-b border-brand pb-1 text-sm font-semibold text-brand transition-colors hover:border-accent hover:text-accent">
            Acceso a usuarios
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {tools.map((tool, index) => (
            <article
              key={tool.title}
              className="group relative overflow-hidden border border-ink-line bg-white p-8 shadow-professional transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 sm:p-9"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-brand transition-colors duration-300 group-hover:bg-accent" />
              <div className="mb-9 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  <tool.icon className="h-6 w-6" />
                </div>
                <span className="font-serif text-3xl font-bold text-ink/10">0{index + 1}</span>
              </div>
              <h3 className="mb-4 font-serif text-2xl font-bold text-ink">{tool.title}</h3>
              <p className="leading-7 text-ink-muted">{tool.description}</p>
              <div className="mt-8 h-px w-10 bg-accent" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
