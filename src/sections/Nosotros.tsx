import { Gavel, Landmark } from 'lucide-react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { useInView } from '../hooks/useInView';

const institutionalContent = [
  {
    icon: Gavel,
    label: 'Nuestro propósito',
    title: 'Nuestra Misión',
    text: 'Brindar asesoría y acompañamiento jurídico sobre conciliaciones de alimentos, promoviendo acuerdos justos y responsables que garanticen el bienestar y el interés superior del menor.',
  },
  {
    icon: Landmark,
    label: 'Nuestra proyección',
    title: 'Nuestra Visión',
    text: 'Ser el centro líder de asesoría jurídica sobre conciliaciones de alimentos en La Libertad, reconocido por el profesionalismo, compromiso y efectividad en la construcción de acuerdos que fortalezcan la relación entre las partes.',
  },
];

export function Nosotros() {
  const { ref, isVisible } = useInView();

  return (
    <section id="nosotros" className="relative overflow-hidden bg-white py-24 lg:py-32" ref={ref}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-brand-light blur-3xl opacity-50" />
      <div className="absolute -right-24 bottom-12 h-72 w-72 rounded-full bg-accent-light blur-3xl opacity-50" />
      <div className={`max-w-7xl mx-auto px-6 lg:px-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <SectionHeading title="Nuestra identidad institucional" />
        <p className="max-w-2xl mx-auto mb-14 text-center text-lg leading-relaxed text-ink-muted">
          Trabajamos para construir acuerdos responsables mediante una orientación jurídica cercana, clara y profesional.
        </p>

        <div className="relative grid gap-6 lg:grid-cols-2">
            {institutionalContent.map((item, index) => (
              <article
                key={item.title}
                className={`group relative overflow-hidden border border-ink-line bg-white p-8 shadow-professional sm:p-10 lg:p-12 ${
                  index === 0 ? 'border-l-4 border-l-brand' : 'border-l-4 border-l-accent'
                }`}
              >
                <div className={`absolute -right-14 -top-14 h-36 w-36 rounded-full ${index === 0 ? 'bg-brand-light' : 'bg-accent-light'}`} />
                <div className="relative mb-9 flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${index === 0 ? 'bg-brand' : 'bg-accent'}`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${index === 0 ? 'text-brand' : 'text-accent'}`}>
                    {item.label}
                  </p>
                </div>
                <h3 className="relative mb-5 font-serif text-3xl font-bold tracking-tight text-ink">{item.title}</h3>
                <p className="relative text-base leading-8 text-ink-muted">{item.text}</p>
                <div className={`relative mt-10 h-0.5 w-12 transition-all duration-300 group-hover:w-20 ${index === 0 ? 'bg-brand' : 'bg-accent'}`} />
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}
