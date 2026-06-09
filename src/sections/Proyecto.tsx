import { FileCheck, HandHeart, Scale, ShieldCheck } from 'lucide-react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { useInView } from '../hooks/useInView';

const values = [
  {
    icon: ShieldCheck,
    title: 'Ética',
    desc: 'Actuamos con integridad, transparencia y respeto por la confidencialidad en cada orientación.',
  },
  {
    icon: Scale,
    title: 'Justicia',
    desc: 'Promovemos acuerdos equitativos que respeten los derechos y necesidades de cada persona.',
  },
  {
    icon: HandHeart,
    title: 'Empatía',
    desc: 'Escuchamos cada situación con sensibilidad, cercanía y respeto para brindar un acompañamiento humano.',
  },
  {
    icon: FileCheck,
    title: 'Responsabilidad',
    desc: 'Asumimos cada consulta con seriedad, compromiso y atención cuidadosa durante todo el proceso.',
  },
];

export function Proyecto() {
  const { ref, isVisible } = useInView();

  return (
    <section id="valores" className="relative py-24 lg:py-32" ref={ref}>
      <div className={`relative max-w-7xl mx-auto px-6 lg:px-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <SectionHeading title="Valores que nos representan" />
        <p className="text-center text-ink-muted text-lg max-w-2xl mx-auto mb-16 leading-relaxed">
          Nuestra labor se guía por principios que fortalecen la confianza y orientan cada decisión profesional.
        </p>
        <div className="relative overflow-hidden border border-ink-line bg-white shadow-professional">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-brand to-accent" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <article
                key={value.title}
                className={`group relative p-8 sm:p-10 transition-colors duration-300 hover:bg-brand-soft ${
                  index > 0 ? 'lg:border-l lg:border-ink-line' : ''
                } ${index >= 2 ? 'border-t border-ink-line lg:border-t-0' : index === 1 ? 'sm:border-l sm:border-ink-line lg:border-l' : ''}`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand/20 bg-brand-light text-brand transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold tracking-[0.18em] text-ink-subtle">0{index + 1}</span>
                </div>
                <h3 className="mb-4 font-serif text-2xl font-bold text-ink">{value.title}</h3>
                <p className="text-sm leading-7 text-ink-muted">{value.desc}</p>
                <div className="mt-8 flex items-center gap-2">
                  <div className="h-px w-8 bg-accent" />
                  <div className="h-1.5 w-1.5 rotate-45 bg-accent" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
