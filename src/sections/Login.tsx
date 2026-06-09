import { FormEvent, useState } from 'react';
import { ArrowRight, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { login, register } from '../services/authService';

export function Login({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      if (isRegistering) {
        await register(fullName.trim(), username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
      onAuthenticated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo completar la solicitud.');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden bg-brand-soft py-16 lg:py-20">
      <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-brand-light blur-3xl" />
      <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-accent-light blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl px-6 lg:px-8">
        <div className="grid overflow-hidden border border-ink-line bg-white shadow-professional lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden bg-ink p-8 text-white sm:p-10 lg:p-14">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/10" />
            <ShieldCheck className="mb-10 h-10 w-10 text-accent-light" />
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent-light">Espacio privado</p>
            <h2 className="mb-5 font-serif text-3xl font-bold sm:text-4xl">Gestion clara y segura</h2>
            <p className="max-w-md leading-7 text-white/60">
              Accede a las herramientas de Acuerdo Justo y consulta el avance de tus solicitudes desde un solo lugar.
            </p>
            <div className="mt-12 border-t border-white/10 pt-7 text-sm text-white/50">
              Cada cuenta nueva se registra automaticamente con el rol de cliente.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-10 lg:p-14">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">Area privada</p>
            <h3 className="mb-2 font-serif text-3xl font-bold text-ink">{isRegistering ? 'Crear cuenta' : 'Iniciar sesion'}</h3>
            <p className="mb-8 text-sm leading-6 text-ink-muted">
              {isRegistering ? 'Registra tus datos para ingresar como cliente.' : 'Ingresa tus credenciales para continuar a la plataforma.'}
            </p>

            {isRegistering && (
              <Field label="Nombre completo" value={fullName} onChange={setFullName} autoComplete="name" placeholder="Ingresa tu nombre completo" />
            )}
            <Field label="Usuario" value={username} onChange={setUsername} autoComplete="username" placeholder="Ingresa tu usuario" />

            <label className="mb-6 block">
              <span className="mb-2 block text-sm font-medium text-ink">Contrasena</span>
              <div className="flex items-center gap-3 border border-ink-line bg-brand-soft px-4 transition-colors focus-within:border-brand">
                <LockKeyhole className="h-5 w-5 text-ink-subtle" />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} maxLength={72} autoComplete={isRegistering ? 'new-password' : 'current-password'} placeholder="Ingresa tu contrasena" className="w-full bg-transparent py-3.5 text-sm text-ink outline-none placeholder:text-ink-subtle" />
              </div>
            </label>

            <button type="submit" disabled={isSubmitting} className="group flex w-full items-center justify-center gap-3 rounded-md bg-brand px-6 py-4 font-semibold text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Procesando...' : isRegistering ? 'Crear cuenta' : 'Ingresar a la plataforma'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            {message && <p className="mt-5 text-center text-sm font-medium text-accent">{message}</p>}

            <button type="button" onClick={() => { setIsRegistering((value) => !value); setMessage(''); }} className="mt-6 w-full text-sm font-semibold text-brand">
              {isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, autoComplete, placeholder }: { label: string; value: string; onChange: (value: string) => void; autoComplete: string; placeholder: string }) {
  return (
    <label className="mb-5 block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <div className="flex items-center gap-3 border border-ink-line bg-brand-soft px-4 transition-colors focus-within:border-brand">
        <UserRound className="h-5 w-5 text-ink-subtle" />
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} required minLength={3} maxLength={160} autoComplete={autoComplete} placeholder={placeholder} className="w-full bg-transparent py-3.5 text-sm text-ink outline-none placeholder:text-ink-subtle" />
      </div>
    </label>
  );
}
