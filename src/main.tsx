import { Component, StrictMode, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { getCurrentUser, hasTabSession, logout, type AuthUser } from './services/authService.ts';
import './index.css';

export function Root() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const isLoginPage = currentPath === '/login';
  const isDashboardPage = currentPath === '/dashboard';

  useEffect(() => {
    if (!isLoginPage && !isDashboardPage) {
      setIsLoading(false);
      return;
    }

    if (!hasTabSession()) {
      logout()
        .catch(() => undefined)
        .finally(() => {
          setUser(null);
          setIsLoading(false);
          if (isDashboardPage) window.location.replace('/login');
        });
      return;
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [isDashboardPage, isLoginPage]);

  if (isLoading) return <div className="min-h-screen bg-brand-soft" />;

  if (isDashboardPage) {
    if (!user) {
      window.location.replace('/login');
      return null;
    }
    return <DashboardPage currentUser={user} />;
  }

  if (isLoginPage) {
    if (user) {
      window.location.replace('/dashboard');
      return null;
    }
    return <LoginPage onAuthenticated={() => window.location.replace('/dashboard')} />;
  }

  return <App />;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error no controlado en la interfaz', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-brand-soft p-6 text-ink">
          <section className="max-w-lg border border-ink-line bg-white p-8 text-center shadow-sm">
            <h1 className="font-serif text-2xl font-bold">No se pudo mostrar esta vista</h1>
            <p className="mt-3 text-sm leading-6 text-ink-muted">La información permanece guardada. Recarga la vista para continuar.</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white">Recargar vista</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary><Root /></AppErrorBoundary>
  </StrictMode>,
);
