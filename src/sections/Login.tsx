import { FormEvent, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { signInWithEmail } from '../services/authService';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setMessage('El acceso estará disponible cuando la plataforma sea conectada a Supabase.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      await signInWithEmail(email, password);
      setMessage('Sesión iniciada correctamente.');
    } catch {
      setMessage('No fue posible iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden bg-brand-soft py-16 lg:py-20">
      <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-brand-light blur-3xl" />
      <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-accent-light blur-3xl" />

      <div className="relative w-full max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid overflow-hidden border border-ink-line bg-white shadow-professional lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative overflow-hidden bg-ink p-8 text-white sm:p-10 lg:p-14">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/10" />
            <ShieldCheck className="mb-8 h-10 w-10 text-accent-light" />
            <h2 className="mb-5 font-serif text-3xl font-bold sm:text-4xl">Acceso a la plataforma</h2>
            <p className="max-w-md leading-7 text-white/60">
              Ingresa para gestionar tus herramientas, solicitudes y citas desde un espacio privado y seguro.
            </p>
            <div className="mt-10 border-t border-white/10 pt-7">
              <p className="text-sm leading-6 text-white/45">
                El acceso estará reservado para usuarios registrados y profesionales autorizados.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-10 lg:p-14">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">Área privada</p>
            <h3 className="mb-8 font-serif text-3xl font-bold text-ink">Iniciar sesión</h3>

            <label className="mb-5 block">
              <span className="mb-2 block text-sm font-medium text-ink">Correo electrónico</span>
              <div className="flex items-center gap-3 border border-ink-line bg-brand-soft px-4">
                <Mail className="h-5 w-5 text-ink-subtle" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-transparent py-3.5 text-sm text-ink outline-none placeholder:text-ink-subtle"
                />
              </div>
            </label>

            <label className="mb-6 block">
              <span className="mb-2 block text-sm font-medium text-ink">Contraseña</span>
              <div className="flex items-center gap-3 border border-ink-line bg-brand-soft px-4">
                <LockKeyhole className="h-5 w-5 text-ink-subtle" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Ingresa tu contraseña"
                  className="w-full bg-transparent py-3.5 text-sm text-ink outline-none placeholder:text-ink-subtle"
                />
              </div>
            </label>

            <button type="submit" disabled={isSubmitting} className="group flex w-full items-center justify-center gap-3 rounded-md bg-brand px-6 py-4 font-semibold text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Ingresando...' : 'Ingresar a la plataforma'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            {message && <p className="mt-5 text-center text-sm leading-6 text-ink-muted">{message}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
