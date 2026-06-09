import { ArrowRight, Facebook, MessageCircle } from 'lucide-react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { teamMembers } from '../data/team';
import { useInView } from '../hooks/useInView';

const contactChannels = [
  { icon: MessageCircle, label: 'WhatsApp', value: '+51 933 354 817', href: 'https://wa.link/tx2p34' },
  { icon: Facebook, label: 'Facebook', value: '/acuerdojusto', href: 'https://www.facebook.com/profile.php?id=61590075396567&mibextid=rS40aB7S9Ucbxw6v' },
];

export function Contacto() {
  const { ref, isVisible } = useInView();

  return (
    <section id="contacto" className="relative py-24 lg:py-32" ref={ref}>

      <div className={`relative max-w-7xl mx-auto px-6 lg:px-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <SectionHeading title="Contáctanos" />

        <p className="mx-auto -mt-7 mb-12 max-w-2xl text-center text-lg leading-relaxed text-ink-muted">
          Recibe orientación clara y confidencial para encontrar una solución responsable.
        </p>

        <div className="relative overflow-hidden border border-ink-line bg-white shadow-professional">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-brand to-accent" />
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden bg-brand p-8 sm:p-10 lg:p-14">
              <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full border border-white/10" />
              <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full border border-white/10" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-light">Orientación legal</span>
              <h3 className="mt-4 max-w-xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
                Conversemos sobre tu caso
              </h3>
              <p className="mb-8 mt-5 max-w-xl leading-relaxed text-white/65">
                Estamos preparados para escucharte, resolver tus dudas y acompañarte durante el proceso de conciliación.
              </p>
              <a href="https://wa.link/tx2p34" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 rounded-md bg-white px-6 py-3.5 font-semibold text-brand transition-colors duration-300 hover:bg-accent hover:text-white">
                <MessageCircle className="h-5 w-5" />
                Solicitar orientación
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            <div className="relative bg-brand-soft p-8 sm:p-10 lg:border-l lg:border-ink-line">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">Canales de atención</p>
              <h4 className="mb-3 font-serif text-2xl font-bold text-ink">Estamos disponibles para ayudarte</h4>
              <p className="mb-7 text-sm leading-6 text-ink-muted">Selecciona el canal de tu preferencia para comunicarte con nuestro equipo.</p>
              <div className="divide-y divide-ink-line border-y border-ink-line">
                {contactChannels.map((channel) => (
                  <a
                    key={channel.label}
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 py-5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand/20 bg-white text-brand transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                      <channel.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-ink-subtle">{channel.label}</p>
                      <p className="truncate font-semibold text-ink">{channel.value}</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-ink-subtle transition-all group-hover:translate-x-1 group-hover:text-brand" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 border-t border-ink-line pt-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h3 className="font-serif text-3xl font-bold text-ink sm:text-4xl">Nuestro equipo</h3>
            <div className="mx-auto my-5 h-0.5 w-12 bg-accent" />
            <p className="leading-relaxed text-ink-muted">
              Profesionales comprometidos con una atención jurídica cercana, responsable y confidencial.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {teamMembers.map((member, index) => (
              <article
                key={member.name}
                className="group relative overflow-hidden border border-ink-line bg-white shadow-professional transition-all duration-300 hover:-translate-y-1 hover:border-brand/35"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-brand-light">
                  <div className="absolute inset-0 flex items-center justify-center text-3xl text-brand font-serif font-bold">
                    {member.initials}
                  </div>
                  <img
                    src={member.image}
                    alt={`Fotografía de ${member.name}`}
                    className="relative h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.025]"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="absolute right-3 top-3 bg-white/90 px-2 py-1 text-xs font-medium text-brand shadow-sm backdrop-blur-sm">
                    0{index + 1}
                  </span>
                </div>
                <div className="border-t-2 border-brand p-5">
                  <h4 className="mb-2 font-serif text-lg font-bold leading-snug text-ink">{member.name}</h4>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{member.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
