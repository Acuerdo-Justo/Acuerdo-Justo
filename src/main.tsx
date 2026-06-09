import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { hasDemoSession } from './services/authService.ts';
import './index.css';

const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
const isLoginPage = currentPath === '/login';
const isDashboardPage = currentPath === '/dashboard';

if (isDashboardPage && !hasDemoSession()) {
  window.location.replace('/login');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isDashboardPage && hasDemoSession() ? <DashboardPage /> : isLoginPage ? <LoginPage /> : <App />}
  </StrictMode>
);
