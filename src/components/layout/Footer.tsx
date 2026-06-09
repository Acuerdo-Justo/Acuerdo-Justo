import { Facebook, MessageCircle } from 'lucide-react';
import logoImage from '../../assets/logo.jpeg';

export function Footer() {
  return (
    <footer className="relative bg-ink border-t border-white/10">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-accent to-white" />
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        <div className="grid gap-8 border-b border-white/10 pb-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="max-w-sm">
            <div className="mb-4 flex items-center gap-3">
              <img src={logoImage} alt="Acuerdo Justo" className="h-14 w-14 rounded-full border-2 border-white/20 object-cover" />
              <span className="font-serif text-xl font-bold text-white">Acuerdo Justo</span>
            </div>
            <p className="text-sm leading-6 text-white/50">
              Asesoría jurídica y acompañamiento para construir acuerdos responsables en procesos de alimentos.
            </p>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">Navegación</p>
            <div className="space-y-2 text-sm text-white/55">
              <a href="#nosotros" className="block transition-colors hover:text-white">Nosotros</a>
              <a href="#galeria" className="block transition-colors hover:text-white">Galería</a>
              <a href="#plataforma" className="block transition-colors hover:text-white">Plataforma</a>
              <a href="#valores" className="block transition-colors hover:text-white">Valores</a>
            </div>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">Contacto</p>
            <div className="flex items-center gap-3">
              <a href="https://wa.link/tx2p34" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-white/50 transition-colors hover:border-success hover:text-success">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-white/50 transition-colors hover:border-brand-light hover:text-brand-light">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Acuerdo Justo. Todos los derechos reservados.</p>
          <p>Orientación jurídica con responsabilidad y empatía.</p>
        </div>
      </div>
    </footer>
  );
}
