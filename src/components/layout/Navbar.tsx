import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import logoImage from '../../assets/logo.jpeg';

const links = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Galería', href: '#galeria' },
  { label: 'Plataforma', href: '#plataforma' },
  { label: 'Valores', href: '#valores' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md border-ink-line shadow-professional' : 'bg-transparent border-white/10'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#hero" className="flex items-center gap-3 group">
            <img src={logoImage} alt="Acuerdo Justo" className="h-12 w-12 rounded-full border-2 border-white/80 object-cover shadow-sm" />
            <span className={`font-serif text-xl font-bold tracking-wide transition-colors duration-300 ${scrolled ? 'text-ink' : 'text-white'}`}>
              Acuerdo Justo
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium border-b-2 border-transparent transition-colors duration-300 ${
                    scrolled
                      ? 'text-ink-muted hover:text-brand hover:border-brand'
                      : 'text-white/75 hover:text-white hover:border-accent'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <a
              href="/login"
              className={`ml-3 rounded-md border px-5 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                scrolled
                  ? 'border-accent bg-accent text-white hover:border-brand hover:bg-brand'
                  : 'border-white/40 bg-white/10 text-white hover:bg-white hover:text-brand'
              }`}
            >
              Iniciar sesión
            </a>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="lg:hidden p-2 rounded-md hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className={`w-6 h-6 ${scrolled ? 'text-ink' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${scrolled ? 'text-ink' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-ink-line shadow-professional animate-fade-in">
          <div className="px-6 py-4 space-y-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-md text-ink-muted hover:bg-brand-light hover:text-brand font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block rounded-md bg-accent px-4 py-3 font-semibold text-white transition-colors hover:bg-brand"
            >
              Iniciar sesión
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
