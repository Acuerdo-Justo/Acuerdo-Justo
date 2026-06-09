import { ArrowLeft } from 'lucide-react';
import logoImage from '../assets/logo.jpeg';
import { Login } from '../sections/Login';

export function LoginPage({ onAuthenticated }: { onAuthenticated: () => void }) {
  return (
    <main className="min-h-screen bg-brand-soft">
      <header className="border-b border-ink-line bg-white">
        <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <img src={logoImage} alt="Acuerdo Justo" className="h-12 w-12 rounded-full border border-ink-line object-cover" />
            <span className="font-serif text-xl font-bold text-ink">Acuerdo Justo</span>
          </a>
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-accent">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </a>
        </div>
      </header>
      <Login onAuthenticated={onAuthenticated} />
    </main>
  );
}
